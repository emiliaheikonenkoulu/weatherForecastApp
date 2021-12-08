import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function Map({ route }) {
  // here we get the params from Search.js
  const { geocodingUrl } = route.params;
  const [coordinates, setCoordinates] = useState({
    latitude: 0,
    longitude: 0
  });
  const [region, setRegion] = useState({
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    latitudeDelta: 0.0322,
    longitudeDelta: 0.0221
  });
        
  // fetcLocationData will fetch coordinates to users favorite city.
  // We use coordinates (latitude, longitude) to get marker position in map.
  // Region we use to get position on map with latitude and longitude.
  // LatitudeDelta and longitudeDelta are used to provide the zoom
  // options in the map.
  const fetchLocationDataToMap = () => {
    fetch(geocodingUrl)
    .then((response) => response.json()) 
    .then((data) => {
      setCoordinates({...coordinates, latitude: data.results[0].locations[0].latLng.lat, longitude: data.results[0].locations[0].latLng.lng});
      setRegion({...region, latitude: (data.results[0].locations[0].latLng.lat-0.002), longitude: (data.results[0].locations[0].latLng.lng+0.0006)})
    })
    .catch((error) => {
      Alert.alert('Error', error);
    });
  };

// Every time user presses "Show in Map" button in Search.js, fetchLocationDataToMap will fetch the new data.
useEffect(() => {
  fetchLocationDataToMap();
}, []);
  
  return (
    <View style={styles.container}>
      <MapView 
        style={{flex: 1, width: '100%', height: '100%' }}
        region={region}>
        <Marker 
          coordinate={coordinates}
          pinColor='#335577'
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 5,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plainView: {
    width: 60,
  }
});