// @flow
import React from 'react'
import {AppRegistry, Text} from 'react-native'
import {createIntl, IntlProvider} from 'react-intl'

import {connect, Provider} from 'react-redux'

import App from './App'
import {name as appName} from './app.json'

import getConfiguredStore from './helpers/configureStore'
import {setupHooks, handleGeneralError} from './actions'
import {languageSelector} from './selectors'
import {setLogLevel} from './utils/logging'
import {CONFIG} from './config/config'
import translations from './i18n/translations'
import bluebird from 'bluebird'

setLogLevel(CONFIG.LOG_LEVEL)

bluebird.config({
  longStackTraces: true,
  warnings: true,
})

/*
  Warning(ppershing): DO NOT EVER REMOVE FOLLOWING LINE!
  React-native promise implementation is totally broken, see
  https://github.com/facebook/react-native/issues/19490
  https://github.com/facebook/react-native/issues/17972
*/
global.Promise = bluebird

const intl = createIntl({
  locale: 'en-US',
  messages: translations['en-US'],
})
global.onunhandledrejection = (e) => handleGeneralError(e.message, e, intl)

const store = getConfiguredStore()

store.dispatch(setupHooks())
// TODO: this is async action, we should wait for it in future

const IntlProviderWrapper = connect((state) => {
  const locale = languageSelector(state) || 'en-US'

  return {
    locale,
    messages: translations[locale],
    textComponent: Text,
  }
})(IntlProvider)

const AppWithProviders = () => {
  return (
    <Provider store={store}>
      <IntlProviderWrapper>
        <App />
      </IntlProviderWrapper>
    </Provider>
  )
}

AppRegistry.registerComponent(appName, () => AppWithProviders)
