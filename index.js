import { AppRegistry, YellowBox } from 'react-native'
import { Sentry } from 'react-native-sentry'
import DeviceInfo from 'react-native-device-info'
import App from './src/App'
import { name } from './app.json';

if (!DeviceInfo.isEmulator()) {
  Sentry.config('https://dd6894b022894719a63a190718c2d25c@sentry.io/1250052').install()
}

AppRegistry.registerComponent(name, () => App)

YellowBox.ignoreWarnings([
  'Module OAuthManager requires main queue setup since it overrides `init` but doesn\'t implement',
])
