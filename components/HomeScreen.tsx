import React from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native'

// CSV parser library
import parse from 'csv-parse/lib/browser/sync'

// AsyncStorage (local device storage) library
import AsyncStorage from '@react-native-async-storage/async-storage'

// Useful geodata library
import { getPathLength } from 'geolib'

function HomeScreen({ navigation }) {
  const [data, setData] = React.useState()
  const [error, setError] = React.useState()

  async function fetcher(src) {
    try {
      const response = await fetch(src)
      const result = await response.text()
      const rawdata = await parse(result, {
        columns: true,
        delimiter: ';',
        trim: true,
      })
      const data = await rawdata.reduce((accumulator, current) => {
        const utc_current = Date.parse(
          current.timestamp.split(' ').slice(0, 2).join('T')
        )
        // New process needs initial push; no prev_walk
        if (!accumulator.length) {
          accumulator.push([{ ...current, utc: utc_current, id: '1-1' }])
          return accumulator
        }
        // Get most recent walk (last in overall array)
        const prev_walk = accumulator.slice(-1)[0]
        // Get most recent datapoint (last in walk array)
        const prev_point = prev_walk.slice(-1)[0]
        // If the time difference between current and previous datapoint
        // is greater than ~7 minutes, it's a new walk
        // NOTE: 400000 ms determined experimentally, data probably needs cleaning!
        if (utc_current - prev_point.utc < 400000) {
          accumulator[accumulator.length - 1].push({
            ...current,
            id: `${accumulator.length}-${prev_walk.length}`,
            utc: utc_current,
          })
        } else {
          accumulator.push([
            { ...current, id: `${accumulator.length + 1}-1`, utc: utc_current },
          ])
        }
        return accumulator
      }, [])
      setData(data)
    } catch (err) {
      console.log('err in fetcher: ', err)
      setError(true)
    }
  }

  React.useEffect(() => {
    fetcher(
      'https://s3.amazonaws.com/silvertree-interview-public/gps_dataset.csv'
    )
  }, [])

  const renderItem = ({ item }) => {
    const total_duration =
      Math.round((item[item.length - 1].utc - item[0].utc) / 6000) / 10
    const total_distance = getPathLength(item)
    // console.log('item? ', item)

    const handleNav = async () => {
      try {
        const jsonValue = JSON.stringify(item)
        await AsyncStorage.setItem('CURRENT_WALK', jsonValue)
        navigation.navigate('Map')
      } catch (e) {
        console.error('oops! error in storing data')
        console.log('e: ', e)
      }
    }

    return (
      <TouchableHighlight key={item.id} onPress={handleNav}>
        <View style={{ backgroundColor: 'white' }}>
          <Text>Walk: </Text>
          <Text>{total_duration} minutes</Text>
          <Text>{total_distance} meters</Text>
          <Text>
            Avg. speed{' '}
            {Math.round((total_distance / total_duration) * 0.6) / 10} km/h
          </Text>
        </View>
      </TouchableHighlight>
    )
  }

  if (!data || data.length < 1) {
    return <Text>Loading...</Text>
  }

  if (error) {
    return <Text>Something went wrong!</Text>
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      ItemSeparatorComponent={() => (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            width: '10%',
            backgroundColor: '#E2E2E2',
          }}
        />
      )}
    />
  )
}

export default HomeScreen
