import { AppRegistry } from 'react-native'
import { Sentry } from 'react-native-sentry'
import App from './src/App'
import { name } from './app.json';

Sentry.config('https://dd6894b022894719a63a190718c2d25c@sentry.io/1250052').install()

AppRegistry.registerComponent(name, () => App)
