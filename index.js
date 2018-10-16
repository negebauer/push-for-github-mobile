import { AppRegistry, YellowBox } from 'react-native'
import { Sentry } from 'react-native-sentry'
import DeviceInfo from 'react-native-device-info'
import Config from 'react-native-config'
import App from './src/App'
import { name } from './app.json';

if (!DeviceInfo.isEmulator()) {
  Sentry.config(Config.SENTRY_API_URL).install()
}

AppRegistry.registerComponent(name, () => App)

YellowBox.ignoreWarnings([
  'Module OAuthManager requires main queue setup since it overrides `init` but doesn\'t implement',
])
