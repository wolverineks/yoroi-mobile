// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  wrapper: {},
  stats: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 18,
    paddingBottom: 10,
    flexWrap: 'wrap',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  label: {
    color: COLORS.GRAY,
    paddingRight: 12,
    lineHeight: 24,
    fontSize: 14,
  },
  value: {
    lineHeight: 24,
    fontSize: 16,
    color: COLORS.DARK_GRAY,
  },
  timeWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  timeBlock: {
    lineHeight: 24,
    fontSize: 16,
    color: COLORS.DARK_TEXT,
    marginHorizontal: 4,
    paddingHorizontal: 4,
    borderRadius: 2,
    backgroundColor: COLORS.BANNER_GREY,
    textAlign: 'center',
  },
})
