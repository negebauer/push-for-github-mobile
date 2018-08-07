import React from 'react'
import PropTypes from 'prop-types'
import { View, Text, PushNotificationIOS, Platform, Linking } from 'react-native'
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
      Authorization: `token ${token}`
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
  }

  componentWillMount = () => {
    this.configure()
    if (Platform.OS === 'ios') PushNotification.setApplicationIconBadgeNumber(0)
  }

  configure = () => {
    this.setState({ loading: true })
    if (DeviceInfo.isEmulator()) this.setState({ loading: false })
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

  onRegister = async ({ token }) => {
    const { token: accessToken, onNotificationsFailed } = this.props
    const deviceData = {
      token,
      applicationName: DeviceInfo.getApplicationName(),
      brand: DeviceInfo.getBrand(),
      buildNumber: DeviceInfo.getBuildNumber(),
      bundleId: DeviceInfo.getBundleId(),
      carrier: DeviceInfo.getCarrier(),
      deviceCountry: DeviceInfo.getDeviceCountry(),
      deviceId: DeviceInfo.getDeviceId(),
      deviceName: DeviceInfo.getDeviceName(),
      manufacturer: DeviceInfo.getManufacturer(),
      model: DeviceInfo.getModel(),
      readableVersion: DeviceInfo.getReadableVersion(),
      systemName: DeviceInfo.getSystemName(),
      systemVersion: DeviceInfo.getSystemVersion(),
      timezone: DeviceInfo.getTimezone(),
      uid: DeviceInfo.getUniqueID(),
    }
    try {
      await registerDevice(deviceData, accessToken)
    } catch (err) { onNotificationsFailed(err) }
    this.setState({ loading: false })
  }

  receiveNotification = ({ userInteraction, data: rawData, payload, finish }) => {
    /*
      foreground: false, // BOOLEAN: If the notification was received in foreground or not
      userInteraction: false, // BOOLEAN: If the notification was opened by the user from the notification area or not
      message: 'My Notification Message', // STRING: The notification message
      data: {}, // OBJECT: The push data
    */
    const data = rawData || JSON.parse(payload)
    const { url, type } = data
    if (url && userInteraction && type === 'NEW_NOTIFICATION') {
      Linking.canOpenURL(url).then(supported => supported && Linking.openURL(url))
    }
    if (Platform.OS === 'ios') finish(PushNotificationIOS.FetchResult.NoData)
  }

  render() {
    if (this.state.loading) return <LoadingView text="Setting up notifications" />
    else if (this.state.error) {
      return (
        <View>
          <Text>{`error: ${this.state.error}`}</Text>
        </View>
      )
    }
    return this.props.children
  }
}

Notifications.propTypes = {
  token: PropTypes.string.isRequired,
  onNotificationsFailed: PropTypes.func,
}

Notifications.defaulProps = {
  onNotificationsFailed: () => {},
}
