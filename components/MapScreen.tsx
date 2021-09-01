import React from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native'
// Maps library
import MapView, { Polyline } from 'react-native-maps'

// AsyncStorage (local device storage) library
import AsyncStorage from '@react-native-async-storage/async-storage'

function MapScreen() {
  const [region, setRegion] = React.useState()
  const [coords, setCoords] = React.useState()

  const grabData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('CURRENT_WALK')
      const savedData = JSON.parse(jsonValue)
      console.log('saved Data: ', savedData[0])
      setCoords(savedData)
      setRegion({ ...savedData[0], latitudeDelta: 0.01, longitudeDelta: 0.01 })
    } catch (e) {
      console.error('oops! error in storing data')
      console.log('e? ', e)
    }
  }
  React.useEffect(() => {
    grabData()
  }, [])

  return region ? (
    <MapView style={{ flex: 1 }} initialRegion={region}>
      {coords?.length > 0 && (
        <Polyline coordinates={coords} strokeColor="blue" strokeWidth={2} />
      )}
    </MapView>
  ) : (
    <Text>Loading...</Text>
  )
}

export default MapScreen
