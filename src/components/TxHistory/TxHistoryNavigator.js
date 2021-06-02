// @flow
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import {Button} from '../UiKit'
import TxHistory from './TxHistory'
import TxDetails from './TxDetails'
import {TX_HISTORY_ROUTES, WALLET_ROOT_ROUTES} from '../../RoutesList'
import iconGear from '../../assets/img/gear.png'

import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'

import styles from './styles/SettingsButton.style'

const Stack = createStackNavigator()

const TxHistoryNavigator = () => (
  <Stack.Navigator
    screenOptions={{...defaultStackNavigatorOptions}}
    initialRouteName={TX_HISTORY_ROUTES.MAIN}
  >
    <Stack.Screen
      name={TX_HISTORY_ROUTES.MAIN}
      component={TxHistory}
      options={({navigation, route}) => ({
        title:
          typeof route.params?.title === 'string'
            ? route.params.title
            : undefined,
        headerRight: () => (
          <Button
            style={styles.settingsButton}
            onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}
            iconImage={iconGear}
            title=""
            withoutBackground
          />
        ),
        ...defaultNavigationOptions,
      })}
    />
    <Stack.Screen
      name={TX_HISTORY_ROUTES.TX_DETAIL}
      component={TxDetails}
      options={({route}) => ({
        title:
          typeof route.params?.title === 'string'
            ? route.params.title
            : undefined,
        ...defaultNavigationOptions,
      })}
    />
  </Stack.Navigator>
)

export default TxHistoryNavigator
