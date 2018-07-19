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

const { API_URL } = Config

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

const OAUTH_CONFIG =  {
  github: {
    client_id: Platform.select({
      ios: 'c8540af149a6bfe38a42',
      android: '075e7aaa056d3cb2c1ff'
    }),
    client_secret: Platform.select({
      ios: 'e4d6e5d8787d1acf145ecd8f53a92b4de25cf0c5',
      android: '3ca8451b4da98a11f14fc4711f9b2dff327ba009'
    }),
  },
}

const OAUTH_APP_NAME = Platform.select({
  ios: 'mobilegithubpushnotificationsios',
  android: 'mobilegithubpushnotificationsandroid',
})

const OAUTH_PROVIDER = 'github'

const OAUTH_SCOPES = { scope: 'notifications,read:user' }

type Props = {};
export default class App extends Component<Props> {

  constructor() {
    super()
    this.manager = new OAuthManager(OAUTH_APP_NAME)
    console.log(this.manager);
  }

  componentDidMount() {
    this.manager.configure(OAUTH_CONFIG);
    console.log(this.manager);
    Linking.addEventListener('url', this.handleOpenURL);
    this.work()
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL);
  }

  handleOpenURL = (event) => {
    console.log(event.url);
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
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
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
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
