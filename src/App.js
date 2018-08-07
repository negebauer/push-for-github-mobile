/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { Sentry } from 'react-native-sentry'
import OAuthManager from 'react-native-oauth';
import Config from 'react-native-config'
import DeviceInfo from 'react-native-device-info'
import { OAUTH_CONFIG, OAUTH_APP_NAME, OAUTH_PROVIDER, OAUTH_SCOPES } from './constants'
import { color1, color2, color3, color4, color5 } from './config/colors'
import Notifications from './Notifications'
import LoadingView from './components/LoadingView'

async function apiLogin(token) {
  const response = await fetch(`${Config.API_URL}/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw { text, status: response.status }
  } else {
    const { username, avatarUrl } = await response.json()
    return { username, avatarUrl }
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.manager = new OAuthManager(OAUTH_APP_NAME)
    this.state = {
      loading: true,
      token: undefined,
      username: undefined,
      avatarUrl: undefined,
      loginError: undefined,
      // notificationsError: new Error('asd'),
      notificationsError: undefined,
    }
  }

  componentDidMount() {
    this.manager.configure(OAUTH_CONFIG);
    this.loadAccount()
  }

  loadAccount = async () => {
    const { accounts } = await this.manager.savedAccounts()
    if (accounts.length === 0) return this.setState({ loading: false })
    const { response: { credentials: { accessToken: token } } } = accounts[0]
    return this.login(token)
  }

  authorize = async () => {
    this.setState({ loading: true })
    const { response: { credentials: {
      accessToken: token
    } } } = await this.manager.authorize(OAUTH_PROVIDER, OAUTH_SCOPES)
    return this.login(token)
  }

  login = async (token) => {
    try {
      const { username, avatarUrl } = await apiLogin(token)
      this.setState({ token, username, avatarUrl })
      Sentry.setUserContext({ username })
    } catch (error) {
      if (error.status === 401) return this.logout().then(this.authorize)
      this.setState({ loginError: error })
      Sentry.captureException(error)
    }
    this.setState({ loading: false })
  }

  logout = () => this.manager.deauthorize(OAUTH_PROVIDER)
    .then(() => this.setState({ loading: false, token: undefined }))

  notificationsFailed = (notificationsError) => {
    this.setState({ notificationsError })
    Sentry.captureException(notificationsError)
  }

  notificationsSetup = () => this.setState({ loading: true, notificationsError: undefined }, () =>
    this.setState({ loading: false })
  )

  handleUrl = url => Alert.alert(
    'Open notification url',
    url,
    [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      { text: 'Open', onPress: () => this.openURL(url) },
    ],
    { cancelable: false }
  )

  openUrl = url => Linking.canOpenURL(url).then(isSupported => Linking.openURL(url))

  render() {
    const { loading, token, username, avatarUrl, loginError, notificationsError } = this.state
    if (loading) return <LoadingView text="Loading account"/>
    if (!loading && !token) {
      return (
        <View style={styles.loginBackground}>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Log in with github to activate push notifications</Text>
            <TouchableOpacity style={styles.loginButton} onPress={this.authorize}>
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>
            {loginError && <Text style={styles.loginError}>{loginError.message}</Text>}
          </View>
        </View>
      )
    }
    return (
      <Notifications
        token={token}
        onNotificationsFailed={this.notificationsFailed}
        onUrl={this.handleUrl}
      >
        <View style={styles.background}>
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={this.logout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.container}>
            <Image style={styles.avatar} source={{ uri: avatarUrl }}/>
            <Text style={styles.username}>{username}</Text>
            {!notificationsError && <Text style={styles.subtitle}>Notifications active</Text>}
            {notificationsError &&
              <>
                <Text style={styles.notificationsError}>{`Notifications failed\n${notificationsError.message}`}</Text>
                <TouchableOpacity style={styles.notificationsRetryButton} onPress={this.notificationsSetup}>
                  <Text style={styles.notificationsRetryText}>Activate notifications</Text>
                </TouchableOpacity>
              </>
            }
            <Text style={styles.data}>{`Github Push v${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`}</Text>
          </View>
        </View>
      </Notifications>
    );
  }
}

const styles = StyleSheet.create({
  loginBackground: {
    backgroundColor: color1,
    width: '100%',
    height: '100%',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: color3,
    fontSize: 24,
    textAlign: 'center',
    margin: 16,
  },
  loginButton: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 16,
    paddingLeft: 16,
    backgroundColor: color5,
    borderRadius: 16,
  },
  loginButtonText: {
    color: color4,
    fontSize: 24,
  },
  loginError: {
    color: color3,
    fontSize: 24,
  },
  background: {
    backgroundColor: color2,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 64,
  },
  avatar: {
    width: 180,
    height: 180,
    borderRadius: 90,
    margin: 8,
  },
  username: {
    color: color4,
    fontSize: 32,
    margin: 8,
  },
  subtitle: {
    color: color3,
    textAlign: 'center',
    fontSize: 24,
    margin: 16,
  },
  data: {
    color: color3,
    textAlign: 'center',
    fontSize: 16,
    margin: 16,
  },
  notificationsError: {
    color: color5,
    fontSize: 16,
    textAlign: 'center',
  },
  notificationsRetryButton: {
    padding: 8,
    margin: 16,
    backgroundColor: color5,
    borderRadius: 16,
  },
  notificationsRetryText: {
    color: color1,
  },
  logoutContainer: {
    backgroundColor: color2,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logoutButton: {
    marginTop: 24,
    marginLeft: 16,
    padding: 8,
  },
  logoutText: {
    color: color1,
    fontSize: 16,
  },
});
