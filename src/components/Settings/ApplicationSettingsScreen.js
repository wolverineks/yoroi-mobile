// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {ScrollView, StyleSheet, Switch} from 'react-native'
import {NavigationEvents} from 'react-navigation'
import {injectIntl, defineMessages} from 'react-intl'

import {SETTINGS_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {setAppSettingField, setSystemAuth, showErrorDialog} from '../../actions'
import {APP_SETTINGS_KEYS} from '../../helpers/appSettings'
import {
  isBiometricEncryptionHardwareSupported,
  canBiometricEncryptionBeEnabled,
} from '../../helpers/deviceSettings'
import {
  SettingsItem,
  NavigatedSettingsItem,
  SettingsSection,
} from './SettingsItems'
import {
  biometricHwSupportSelector,
  isSystemAuthEnabledSelector,
  installationIdSelector,
  sendCrashReportsSelector,
} from '../../selectors'
import walletManager from '../../crypto/wallet'
import KeyStore from '../../crypto/KeyStore'
import {StatusBar} from '../UiKit'

import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.settings.applicationsettingsscreen.title',
    defaultMessage: 'Settings',
    description: "some desc",
  },
  tabTitle: {
    id: 'components.settings.applicationsettingsscreen.tabTitle',
    defaultMessage: 'Application',
    description: "some desc",
  },
  language: {
    id: 'components.settings.applicationsettingsscreen.language',
    defaultMessage: 'Your language',
    description: "some desc",
  },
  security: {
    id: 'components.settings.applicationsettingsscreen.security',
    defaultMessage: 'Security',
    description: "some desc",
  },
  changePin: {
    id: 'components.settings.applicationsettingsscreen.changePin',
    defaultMessage: 'Change PIN',
    description: "some desc",
  },
  biometricsSignIn: {
    id: 'components.settings.applicationsettingsscreen.biometricsSignIn',
    defaultMessage: '!!!Sign in with your biometrics',
    description: "some desc",
  },
  crashReporting: {
    id: 'components.settings.applicationsettingsscreen.crashReporting',
    defaultMessage: '!!!Crash reporting',
    description: "some desc",
  },
  crashReportingText: {
    id: 'components.settings.applicationsettingsscreen.crashReportingText',
    defaultMessage:
      'Send crash reports to Emurgo. ' +
      'Changes to this option will be reflected ' +
      ' after restarting the application.',
    description: "some desc",
  },
  termsOfUse: {
    id: 'components.settings.applicationsettingsscreen.termsOfUse',
    defaultMessage: 'Terms of Use',
    description: "some desc",
  },
  support: {
    id: 'components.settings.applicationsettingsscreen.support',
    defaultMessage: '!!!Support',
    description: "some desc",
  },

})

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
})

const disableBiometrics = ({navigation, setSystemAuth}) => async () => {
  await setSystemAuth(false)

  navigation.navigate(SETTINGS_ROUTES.MAIN)
}

const onToggleBiometricsAuthIn = ({
  isSystemAuthEnabled,
  navigation,
  setSystemAuth,
  intl,
  installationId,
  disableBiometrics,
}) => async () => {
  if (isSystemAuthEnabled) {
    if (!walletManager.canBiometricsSignInBeDisabled()) {
      await showErrorDialog((dialogs) => dialogs.disableEasyConfirmationFirst)

      return
    }

    navigation.navigate(SETTINGS_ROUTES.BIO_AUTHENTICATE, {
      keyId: installationId,
      onSuccess: () =>
        navigation.navigate(SETTINGS_ROUTES.SETUP_CUSTOM_PIN, {
          onSuccess: disableBiometrics,
        }),
      onFail: (reason) => {
        if (reason === KeyStore.REJECTIONS.CANCELED) {
          navigation.navigate(SETTINGS_ROUTES.MAIN)
        } else {
          throw new Error(`Could not authenticate user: ${reason}`)
        }
      },
    })
  } else {
    navigation.navigate(SETTINGS_ROUTES.FINGERPRINT_LINK)
  }
}

const updateDeviceSettings = async ({setAppSettingField}) => {
  // prettier-ignore
  const isHardwareSupported =
    await isBiometricEncryptionHardwareSupported()
  // prettier-ignore
  const canEnableBiometricEncryption =
    await canBiometricEncryptionBeEnabled()

  await setAppSettingField(
    APP_SETTINGS_KEYS.BIOMETRIC_HW_SUPPORT,
    isHardwareSupported,
  )
  await setAppSettingField(
    APP_SETTINGS_KEYS.CAN_ENABLE_BIOMETRIC_ENCRYPTION,
    canEnableBiometricEncryption,
  )
}

const ApplicationSettingsScreen = ({
  onToggleBiometricsAuthIn,
  intl,
  updateDeviceSettings,
  isBiometricHardwareSupported,
  isSystemAuthEnabled,
  language,
  sendCrashReports,
  setCrashReporting,
}) => (
  <ScrollView style={styles.scrollView}>
    <StatusBar type="dark" />

    <NavigationEvents onWillFocus={updateDeviceSettings} />
    <SettingsSection title={intl.formatMessage(messages.language)}>
      <NavigatedSettingsItem
        label={language}
        navigateTo={SETTINGS_ROUTES.CHANGE_LANGUAGE}
      />
    </SettingsSection>

    <SettingsSection title={intl.formatMessage(messages.security)}>
      <NavigatedSettingsItem
        label={intl.formatMessage(messages.changePin)}
        navigateTo={SETTINGS_ROUTES.CHANGE_CUSTOM_PIN}
        disabled={isSystemAuthEnabled}
      />

      <SettingsItem
        label={intl.formatMessage(messages.biometricsSignIn)}
        disabled={!isBiometricEncryptionHardwareSupported}
      >
        <Switch
          value={isSystemAuthEnabled}
          onValueChange={onToggleBiometricsAuthIn}
          disabled={!isBiometricHardwareSupported}
        />
      </SettingsItem>
    </SettingsSection>

    <SettingsSection title={intl.formatMessage(messages.crashReporting)}>
      <SettingsItem label={intl.formatMessage(messages.crashReportingText)}>
        <Switch value={sendCrashReports} onValueChange={setCrashReporting} />
      </SettingsItem>
    </SettingsSection>

    <SettingsSection>
      <NavigatedSettingsItem
        label={intl.formatMessage(messages.termsOfUse)}
        navigateTo={SETTINGS_ROUTES.TERMS_OF_USE}
      />

      <NavigatedSettingsItem
        label={intl.formatMessage(messages.support)}
        navigateTo={SETTINGS_ROUTES.SUPPORT}
      />
    </SettingsSection>
  </ScrollView>
)

export default injectIntl(compose(
  connect(
    (state) => ({
      isBiometricHardwareSupported: biometricHwSupportSelector(state),
      sendCrashReports: sendCrashReportsSelector(state),
      isSystemAuthEnabled: isSystemAuthEnabledSelector(state),
      language: state.trans.global.currentLanguageName,
      installationId: installationIdSelector(state),
    }),
    {setAppSettingField, setSystemAuth},
  ),
  withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  withNavigationTitle(
    ({intl}) => intl.formatMessage(messages.tabTitle),
    'applicationTabTitle',
  ),
  withHandlers({
    disableBiometrics,
  }),
  withHandlers({
    onToggleBiometricsAuthIn,
    updateDeviceSettings: ({setAppSettingField}) => () => {
      // Runaway promise. This is neaded because
      // onWillFocus accepts only ()=>void
      updateDeviceSettings({setAppSettingField})
    },
    setCrashReporting: ({setAppSettingField}) => (value: boolean) => {
      setAppSettingField(APP_SETTINGS_KEYS.SEND_CRASH_REPORTS, value)
    },
  }),
)(ApplicationSettingsScreen): ComponentType<{navigation: Navigation}>)
