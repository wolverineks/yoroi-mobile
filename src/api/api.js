// @flow
import _ from 'lodash'
import axios from 'axios'

import {Logger} from '../utils/logging'
import {CONFIG} from '../config'
import {NetworkError, ApiError} from './errors'
import assert from '../utils/assert'
import {checkAndFacadeTransactionAsync} from './facade'

import type {Moment} from 'moment'
import type {Transaction, RawUtxo} from '../types/HistoryTransaction'

type Addresses = Array<string>

const _fetch = (path: string, payload: any) => {
  Logger.info(`API call: ${path}`)
  return axios(`${CONFIG.API.ROOT}/${path}`, {
    method: 'POST',
    data: payload,
    validateStatus: (status) => status === 200,
  })
    .catch((e) => {
      Logger.info(`API call ${path} failed`, e)
      // Error-handling logic taken from
      // https://github.com/axios/axios/issues/383#issuecomment-436506793
      if (e.response) {
        // Connected to the server
        throw new ApiError(e.request)
      } else if (e.code === 'ECONNABORTED') {
        // timeout or cancelled request
        throw new NetworkError()
      } else {
        // Connection error
        throw new NetworkError()
      }
    })
    .then((response) => {
      Logger.info(`API call ${path} finished`)
      Logger.debug('Response:', response)
      return response.data
    })
}

export const fetchNewTxHistory = async (
  dateFrom: Moment,
  addresses: Addresses,
): Promise<{isLast: boolean, transactions: Array<Transaction>}> => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.TX_HISTORY_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  const response = await _fetch('txs/history', {
    addresses,
    dateFrom: dateFrom.toISOString(),
  })

  const transactions = await Promise.all(
    response.map(checkAndFacadeTransactionAsync),
  )
  return {
    transactions,
    isLast: response.length <= CONFIG.API.TX_HISTORY_RESPONSE_LIMIT,
  }
}

export const filterUsedAddresses = async (
  addresses: Addresses,
): Promise<Addresses> => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.FILTER_USED_MAX_ADDRESSES,
    'filterUsedAddresses: too many addresses',
  )
  // Take a copy in case underlying data mutates during await
  const copy = [...addresses]
  const used = await _fetch('addresses/filterUsed', {addresses: copy})
  // We need to do this so that we keep original order of addresses
  return copy.filter((addr) => used.includes(addr))
}

export const fetchUTXOsForAddresses = (addresses: Addresses) => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  return _fetch('txs/utxoForAddresses', {addresses})
}

export const bulkFetchUTXOsForAddresses = async (
  addresses: Array<string>,
): Promise<Array<RawUtxo>> => {
  const chunks = _.chunk(addresses, CONFIG.API.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(
    chunks.map((addrs) => fetchUTXOsForAddresses(addrs)),
  )
  return _.flatten(responses)
}

export const submitTransaction = (signedTx: string) => {
  return _fetch('txs/signed', {signedTx})
}
