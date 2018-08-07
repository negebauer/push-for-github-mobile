import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native'
import { color1, color3, color5 } from '../config/colors'

export default function LoadingView({ text, size }) {
  return (
    <View style={styles.container}>
      {text && <Text style={styles.text}>{text}</Text>}
      <ActivityIndicator size={size} color={color3}/>
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
    backgroundColor: color1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    height: '100%',
  },
  text: {
    color: color5,
    textAlign: 'center',
    margin: 12,
    fontSize: 24,
  },
})
