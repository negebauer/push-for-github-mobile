import { Platform } from 'react-native';

export const OAUTH_CONFIG = {
  github: {
    client_id: Platform.select({
      ios: 'c8540af149a6bfe38a42',
      android: '075e7aaa056d3cb2c1ff',
    }),
    client_secret: Platform.select({
      ios: 'e4d6e5d8787d1acf145ecd8f53a92b4de25cf0c5',
      android: '3ca8451b4da98a11f14fc4711f9b2dff327ba009',
    }),
  },
}

export const OAUTH_APP_NAME = Platform.select({
  ios: 'mobilegithubpushnotificationsios',
  android: 'mobilegithubpushnotificationsandroid',
})

export const OAUTH_PROVIDER = 'github'

export const OAUTH_SCOPES = { scopes: 'notifications,read:user' }
