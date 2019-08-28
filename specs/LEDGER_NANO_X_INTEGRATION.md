# Abstract

Allow users to connect a Ledger Nano X [(1)](1) hardware wallet to the Yoroi Mobile application in order to perform transactions with an additional layer of security. Also, Nano X users may use the Yoroi app as an UI to check balances, transaction history, etc.

# Motivation

Hardware wallets allow to sign transactions (and, more generally, any digital message) without requiring users to input their private keys. Keys are always kept securely inside the device. This is currently one of the most secure ways to interact with blockchains.

The Nano X also has the particular advantage of offering bluetooth connectivity, which makes it ideal for mobile use.

# Background

For general background information please refer to:

- Ledger Documentation Hub [(2)](2)
- Ledger integration specifications for the Yoroi browser extension [(3)](3)

# Proposal

From a user's perspective, setting up and using the device should follow the same approach described in the specifications of the Yoroi Extension [(3)][3]
Roughly, it should work as follows:

- Users first need to install the [Cardano Ledger App](https://github.com/cardano-foundation/ledger-app-cardano), which can be done through Ledger Live app.
- Then, create a new wallet through the option `Connect to Ledger Nano X` and follow the steps.
- Once the wallet is created, users will be able to sign transactions with the Nano X device.

# Implementation

## Additional dependencies

The following dependencies will need to be added:

- [`@ledgerhq/react-native-hw-transport-ble`](https://github.com/LedgerHQ/ledgerjs/tree/master/packages/react-native-hw-transport-ble)
- [jsc-android](https://github.com/react-native-community/jsc-android-buildscripts#readme), required by `react-native-hw-transport-ble`

Transport layer will be based on [`@ledgerhq/react-native-hw-transport-ble`](https://github.com/LedgerHQ/ledgerjs/tree/master/packages/react-native-hw-transport-ble)

## Issues

- `@ledgerhq/react-native-hw-transport-ble` depends on `react-native-ble-plx`, which curently **does not support** react-native 0.59.10 (which is the current version used by `yoroi-mobile`)

- Android: Starting on version 6.0, applications using bluetooth pairing must require users to grant `ACCESS_COARSE_LOCATION` permission (see [Android 6.0 Changes](https://developer.android.com/about/versions/marshmallow/android-6.0-changes.html#behavior-hardware-id) and [Bluetooth overview](https://developer.android.com/guide/topics/connectivity/bluetooth))

[1]: https://support.ledger.com/hc/en-us/articles/360015259693
[2]: https://ledger.readthedocs.io/en/latest/index.html
[3]: https://github.com/Emurgo/yoroi-frontend/blob/develop/docs/specs/code/ledger-integration/README.md
