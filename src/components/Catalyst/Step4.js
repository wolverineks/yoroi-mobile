// @flow

/**
 * Step 4 for the Catalyst registration
 * Ask password used for signing transaction
 * submit the transaction
 * ### HW is NOT supported yet - validation is done on first screen itself###
 */

import _ from 'lodash'
import React, {useState} from 'react'
import {View, SafeAreaView} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import {connect} from 'react-redux'

import type {ComponentType} from 'react'
import type {IntlShape} from 'react-intl'

import {CONFIG} from '../../config/config'
import KeyStore from '../../crypto/KeyStore'
import {formatTokenWithSymbol, formatTokenWithText} from '../../utils/format'
import {showErrorDialog, submitTransaction} from '../../actions'
import {
  Text,
  ProgressStep,
  Button,
  OfflineBanner,
  ValidatedTextInput,
  StatusBar,
  PleaseWaitModal,
} from '../UiKit'
import ErrorModal from '../Common/ErrorModal'
import {withTitle} from '../../utils/renderUtils'
import {
  CATALYST_ROUTES,
  SEND_ROUTES,
  WALLET_ROOT_ROUTES,
} from '../../RoutesList'
import walletManager, {SystemAuthDisabled} from '../../crypto/walletManager'
import globalMessages, {
  errorMessages,
  confirmationMessages,
  txLabels,
} from '../../i18n/global-messages'
import {WrongPassword} from '../../crypto/errors'

import styles from './styles/Step3.style'

import {
  easyConfirmationSelector,
  defaultNetworkAssetSelector,
} from '../../selectors'
import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  subTitle: {
    id: 'components.catalyst.step4.title',
    defaultMessage: '!!!Confirm Registration',
  },
  description: {
    id: 'components.catalyst.step4.description',
    defaultMessage:
      '!!!Enter the spending password to confirm voting registration and submit the certificate generated in previous step to blockchain',
  },
})

const Step4 = ({
  intl,
  isEasyConfirmationEnabled,
  navigation,
  submitTransaction,
  unSignedTx,
  defaultAsset,
}) => {
  const [password, setPassword] = useState(
    CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
  )

  const [sendingTransaction, setSendingTransaction] = useState(false)
  const [errorData, setErrorData] = useState({
    showErrorDialog: false,
    errorMessage: '',
    errorLogs: '',
  })

  const isConfirmationDisabled = !isEasyConfirmationEnabled && !password

  const submitTrx = async (decryptedKey) => {
    setSendingTransaction(true)
    await submitTransaction(unSignedTx, decryptedKey)
    setSendingTransaction(false)
    navigation.navigate(CATALYST_ROUTES.STEP4)
  }

  const onContinue = async (_event) => {
    if (isEasyConfirmationEnabled) {
      try {
        await walletManager.ensureKeysValidity()
        navigation.navigate(SEND_ROUTES.BIOMETRICS_SIGNING, {
          keyId: walletManager._id,
          onSuccess: async (decryptedKey) => {
            await submitTrx(decryptedKey)
            navigation.navigate(CATALYST_ROUTES.STEP3)
          },
          onFail: () => navigation.goBack(),
        })
      } catch (e) {
        if (e instanceof SystemAuthDisabled) {
          await walletManager.closeWallet()
          await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
          navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)

          return
        } else {
          setErrorData((_state) => ({
            showErrorDialog: true,
            errorMessage: intl.formatMessage(
              errorMessages.generalTxError.message,
            ),
            errorLogs: String(e.message),
          }))
        }
      }

      try {
        const decryptedKey = await KeyStore.getData(
          walletManager._id,
          'MASTER_PASSWORD',
          '',
          password,
          intl,
        )

        await submitTrx(decryptedKey)
      } catch (e) {
        if (e instanceof WrongPassword) {
          await showErrorDialog(errorMessages.incorrectPassword, intl)
        } else {
          setErrorData((_state) => ({
            showErrorDialog: true,
            errorMessage: intl.formatMessage(
              errorMessages.generalTxError.message,
            ),
            errorLogs: String(e.message),
          }))
        }
      }
    }
  }
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={4} totalSteps={4} />
      <StatusBar type="dark" />

      <OfflineBanner />
      <View style={styles.container}>
        <Text style={styles.subTitle}>
          {intl.formatMessage(messages.subTitle)}
        </Text>
        <Text style={styles.description}>
          {intl.formatMessage(messages.description)}
        </Text>
        <Text small>
          {intl.formatMessage(txLabels.fees)}:{' '}
          {formatTokenWithSymbol(unSignedTx.fee(), defaultAsset)}
        </Text>
        {!isEasyConfirmationEnabled && (
          <View>
            <ValidatedTextInput
              secureTextEntry
              value={password}
              label={intl.formatMessage(txLabels.password)}
              onChangeText={setPassword}
            />
          </View>
        )}
        <Button
          onPress={onContinue}
          title={intl.formatMessage(
            confirmationMessages.commonButtons.confirmButton,
          )}
          disabled={isConfirmationDisabled}
        />
      </View>
      <ErrorModal
        visible={errorData.showErrorDialog}
        title={intl.formatMessage(errorMessages.generalTxError.title)}
        errorMessage={errorData.errorMessage}
        errorLogs={errorData.errorLogs}
        onRequestClose={() => {
          setErrorData((state) => ({
            ...state,
            showErrorDialog: false,
          }))
        }}
      />
      <PleaseWaitModal
        title={intl.formatMessage(txLabels.submittingTx)}
        spinnerText={intl.formatMessage(globalMessages.pleaseWait)}
        visible={sendingTransaction}
      />
    </SafeAreaView>
  )
}

type ExternalProps = {|
  navigation: Navigation,
  route: Object, // TODO(navigation): type
  intl: IntlShape,
|}

export default injectIntl(
  connect(
    (state) => ({
      isEasyConfirmationEnabled: easyConfirmationSelector(state),
      unSignedTx: state.voting.unSignedTx,
      defaultAsset: defaultNetworkAssetSelector(state),
    }),
    {submitTransaction},
  )(
    withTitle((Step4: ComponentType<ExternalProps>), ({intl}) =>
      intl.formatMessage(globalMessages.votingTitle),
    ),
  ),
)
