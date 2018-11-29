// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, ScrollView} from 'react-native'
import {withHandlers, withState} from 'recompose'

import {Button, Text, Checkbox, ValidatedTextInput} from '../UiKit'
import {withNavigationTitle} from '../../utils/renderUtils'
import {ROOT_ROUTES} from '../../RoutesList'
import {walletNameSelector} from '../../selectors'
import {removeCurrentWallet} from '../../actions'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

import styles from './styles/RemoveWalletScreen.style'

import type {State} from '../../state'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state: State) => state.trans.RemoveWalletScreen

const handleRemoveWallet = ({navigation, removeCurrentWallet}) => async () => {
  await removeCurrentWallet()
  navigation.navigate(ROOT_ROUTES.WALLET_SELECTION)
}

type Prop = {
  translations: SubTranslation<typeof getTranslations>,
  walletName: string,
  typedWalletName: string,
  setTypedWalletName: (string) => mixed,
  isRemovingWallet: boolean,
  handleRemoveWallet: () => void,
  setHasMnemonicWrittenDown: (boolean) => mixed,
  hasMnemonicWrittenDown: boolean,
}

const RemoveWalletScreen = ({
  translations,
  walletName,
  isRemovingWallet,
  handleRemoveWallet,
  hasMnemonicWrittenDown,
  setHasMnemonicWrittenDown,
  typedWalletName,
  setTypedWalletName,
}: Prop) => {
  const disabled =
    isRemovingWallet ||
    !hasMnemonicWrittenDown ||
    walletName !== typedWalletName

  return (
    <View style={styles.container}>
      <Text style={styles.description}>{translations.description}</Text>

      <ScrollView contentContainerStyle={styles.screenContainer}>
        <View style={styles.walletInfo}>
          <Text style={styles.walletNameLabel}>{translations.walletName}</Text>
          <Text style={styles.walletName}>{walletName}</Text>

          <ValidatedTextInput
            label={translations.walletNameInput}
            value={typedWalletName}
            onChangeText={setTypedWalletName}
          />
        </View>

        <View>
          <Checkbox
            checked={hasMnemonicWrittenDown}
            text={translations.hasWrittenDownMnemonic}
            onChange={setHasMnemonicWrittenDown}
          />

          <Button
            onPress={handleRemoveWallet}
            title={translations.remove}
            style={styles.removeButton}
            disabled={disabled}
          />
        </View>
      </ScrollView>
    </View>
  )
}

export default compose(
  connect(
    (state: State) => ({
      translations: getTranslations(state),
      walletName: walletNameSelector(state),
    }),
    {
      removeCurrentWallet,
    },
  ),
  withNavigationTitle(({translations}) => translations.title),
  withState('hasMnemonicWrittenDown', 'setHasMnemonicWrittenDown', false),
  withState('typedWalletName', 'setTypedWalletName', ''),
  withHandlers({
    handleRemoveWallet: ignoreConcurrentAsyncHandler(handleRemoveWallet, 1000),
  }),
)(RemoveWalletScreen)
