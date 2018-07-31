/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { Platform, StyleSheet, Text, View, Button } from 'react-native';
import OAuthManager from 'react-native-oauth';
import Config from 'react-native-config'
import { OAUTH_CONFIG, OAUTH_APP_NAME, OAUTH_PROVIDER, OAUTH_SCOPES } from './constants'
import LoadingView from './components/LoadingView'
import Notifications from './Notifications'

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
      error: undefined,
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
    } catch (error) {
      if (error.status === 401) return this.logout().then(this.authorize)
      console.log('login error', error);
      this.setState({ error })
    }
    this.setState({ loading: false })
  }

  logout = () => this.manager.deauthorize(OAUTH_PROVIDER)
    .then(() => this.setState({ loading: false, token: undefined }))

  notificationsFailed = (notificationsError) => this.setState({ notificationsError })

  notificationsSetup = () => this.setState({ loading: true, notificationsError: undefined }, () =>
    this.setState({ loading: false })
  )

  render() {
    const { loading, token, username, avatarUrl, error, notificationsError } = this.state
    if (loading) return <LoadingView text="Loading account"/>
    if (!loading && !token) {
      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>{`API_URL: ${Config.API_URL}`}</Text>
          <Button onPress={this.authorize} title="Login" />
          {error && <Text>{error.message}</Text>}
        </View>
      )
    }
    return (
      <Notifications token={token} onNotificationsFailed={this.notificationsFailed}>
        <View style={styles.container}>
          <Text style={styles.welcome}>{`API_URL: ${Config.API_URL}`}</Text>
          <Text style={styles.welcome}>{`username: ${username}`}</Text>
          <Text style={styles.welcome}>{`avatarUrl: ${avatarUrl}`}</Text>
          <Text style={styles.welcome}>{`token: ${token}`}</Text>
          <Button onPress={this.logout} title="Logout" />
          {notificationsError &&
            <View>
              <Text style={styles.welcome}>{`notificationsError: ${notificationsError.message}`}</Text>
              <Button onPress={this.notificationsSetup} title="Activate notifications" />
            </View>
          }
        </View>
      </Notifications>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
