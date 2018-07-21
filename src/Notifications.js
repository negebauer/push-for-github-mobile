import React from 'react'
import PropTypes from 'prop-types'
import { View, Text } from 'react-native'
import PushNotification from 'react-native-push-notification'
import DeviceInfo from 'react-native-device-info'
import Config from 'react-native-config'
import LoadingView from './components/LoadingView'

export default class Notifications extends React.Component {
  constructor() {
    super()
    this.state = { loading: true, error: undefined }
  }

  componentWillMount = () => {
    this.configure()
  }

  configure = () => {
    this.setState({ loading: true })
    PushNotification.configure({
      onRegister: this.onRegister,
      onNotification: this.receiveNotification,
      senderID: Config.GCM_SENDER_ID || 'NOT_IMPLEMENTED', // TODO: Obtain GCM_SENDER_ID
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    })
  }

  onRegister = ({ token }) => {
    const { token: accessToken } = this.props
    console.log('Notifications token: ', token)
    const data = {
      token,
      applicationName: getApplicationName(),
      brand: getBrand(),
      buildNumber: getBuildNumber(),
      bundleId: getBundleId(),
      carrier: getCarrier(),
      deviceCountry: getDeviceCountry(),
      deviceId: getDeviceId(),
      deviceName: getDeviceName(),
      manufacturer: getManufacturer(),
      model: getModel(),
      readableVersion: getReadableVersion(),
      systemName: getSystemName(),
      systemVersion: getSystemVersion(),
      timezone: getTimezone(),
      uid: getUniqueID(),
    }
    // Call api to register device
    this.setState({ loading: false })
  }

  receiveNotification = ({ foreground, userInteraction, message, data: rawData, payload }) => {
    /*
      foreground: false, // BOOLEAN: If the notification was received in foreground or not
      userInteraction: false, // BOOLEAN: If the notification was opened by the user from the notification area or not
      message: 'My Notification Message', // STRING: The notification message
      data: {}, // OBJECT: The push data
    */
    const data = rawData || JSON.parse(payload)
    console.log('received notification', { message, data });
  }

  render() {
    if (this.state.loading) return <LoadingView text="Checking notifications" />
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
}
