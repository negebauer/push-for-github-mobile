/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Linking} from 'react-native';
import OAuthManager from 'react-native-oauth';
import Config from 'react-native-config'
import { OAUTH_CONFIG, OAUTH_APP_NAME, OAUTH_PROVIDER, OAUTH_SCOPES } from './constants'
import LoadingView from './components/LoadingView'

export default class App extends Component {

  constructor(props) {
    super(props)
    this.manager = new OAuthManager(OAUTH_APP_NAME)
    this.state = {
      loading: true,
      token: undefined,
      username: undefined,
      avatarUrl: undefined,
    }
  }

  componentDidMount() {
    this.manager.configure(OAUTH_CONFIG);
    this.loadData()
  }

  loadData = async () => {
    const { accounts } = await this.manager.savedAccounts()
    console.log('accounts', accounts);
    if (accounts.length === 0) return this.setState({ loading: false })
    const { response: { credentials: { accessToken: token } } } = accounts[0]
    try {
      const { username, avatarUrl } = await (await fetch(`${Config.API_URL}/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })).json()
      this.setState({ token, username, avatarUrl })
    } catch (err) { console.error('err', err) }
    this.setState({ loading: false })
  }

  work = async () => {
    const { accounts } = await this.manager.savedAccounts()
    console.log('account list: ', accounts);
    // try {
    //   await this.manager.deauthorize('github')
    //   const { accounts: accounts2 } = await this.manager.savedAccounts()
    //   console.log('account list: ', accounts2);
    // } catch (err) {}
    const { response: { credentials: { accessToken: token } } } = await this.manager.authorize(OAUTH_PROVIDER, OAUTH_SCOPES)
    console.log('token', token);
    console.log('API_URL', API_URL);
    const res2 = await (await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    })).json()
    console.log('res2', res2);
  }

  render() {
    if (this.state.loading) return <LoadingView />
    if (!this.state.loading && !this.state.token) {
      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>We should do login</Text>
        </View>
      )
    }
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>{`username: ${this.state.username}`}</Text>
        <Text style={styles.welcome}>{`avatarUrl: ${this.state.avatarUrl}`}</Text>
        <Text style={styles.welcome}>{`token: ${this.state.token}`}</Text>
      </View>
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
