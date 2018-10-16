import React from 'react'
import PropTypes from 'prop-types'
import {
  View, Text, PushNotificationIOS, Platform,
} from 'react-native'
import PushNotification from 'react-native-push-notification'
import DeviceInfo from 'react-native-device-info'
import Config from 'react-native-config'
import LoadingView from './components/LoadingView'

async function registerDevice(data, token) {
  const response = await fetch(`${Config.API_URL}/devices`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw error
  }
}

export default class Notifications extends React.Component {
  constructor() {
    super()
    this.state = { loading: true, error: undefined }

    this.configure = this.configure.bind(this)
    this.onRegister = this.onRegister.bind(this)
    this.receiveNotification = this.receiveNotification.bind(this)
  }

  componentWillMount() {
    this.configure()
    if (Platform.OS === 'ios') PushNotification.setApplicationIconBadgeNumber(0)
  }

  async onRegister({ token }) {
    const { token: accessToken, onNotificationsFailed } = this.props
    const deviceData = {
      token,
      applicationName: DeviceInfo.getApplicationName(),
      buildNumber: DeviceInfo.getBuildNumber(),
      bundleId: DeviceInfo.getBundleId(),
      carrier: DeviceInfo.getCarrier(),
      model: DeviceInfo.getModel(),
      systemName: DeviceInfo.getSystemName(),
      systemVersion: DeviceInfo.getSystemVersion(),
      timezone: DeviceInfo.getTimezone(),
      uid: DeviceInfo.getUniqueID(),
      version: DeviceInfo.getVersion(),
    }
    try {
      await registerDevice(deviceData, accessToken)
    } catch (err) { onNotificationsFailed(err) }
    this.setState({ loading: false })
  }

  configure() {
    this.setState({ loading: true })
    if (DeviceInfo.isEmulator() && Platform.OS === 'ios') this.setState({ loading: false })
    PushNotification.configure({
      onRegister: this.onRegister,
      onNotification: this.receiveNotification,
      senderID: Config.GCM_SENDER_ID,
      permissions: {
        alert: true,
        // badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    })
  }

  receiveNotification({ userInteraction, data, finish }) {
    const { url, type } = data
    const { onUrl } = this.props
    if (url && userInteraction && type === 'NEW_NOTIFICATION') onUrl(url)
    if (Platform.OS === 'ios') finish(PushNotificationIOS.FetchResult.NoData)
  }

  render() {
    const { loading, error } = this.state
    const { children } = this.props
    if (loading) return <LoadingView text="Setting up notifications" />
    if (error) {
      return (
        <View>
          <Text>{`error: ${error}`}</Text>
        </View>
      )
    }
    return children
  }
}

Notifications.propTypes = {
  token: PropTypes.string.isRequired,
  onUrl: PropTypes.func.isRequired,
  onNotificationsFailed: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}

Notifications.defaulProps = {
  onUrl: () => { },
  onNotificationsFailed: () => { },
}
