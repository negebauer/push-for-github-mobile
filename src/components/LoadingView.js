import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native'
// import { mainColor, mainColorAlternate } from '../config/colors'

export default function LoadingView({ text, size }) {
  return (
    <View style={styles.container}>
      {text && <Text style={styles.text}>{text}</Text>}
      <ActivityIndicator size={size} />
    </View>
  )
}

LoadingView.defaultProps = {
  size: 'large',
}

LoadingView.propTypes = {
  text: PropTypes.string,
  size: PropTypes.string,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    height: '100%',
  },
  text: {
    color: '#DDDDDD',
    textAlign: 'center',
    margin: 12,
    fontSize: 24,
  },
})
