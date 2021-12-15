import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, Text, Image, ImageBackground } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function Map({ route }) {
  // here we get the params from Search.js
  const { geocodingUrl, city, weatherDataToMap } = route.params;
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
  const [temp, setTemp] = useState(0);
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
        
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

  const fetchWeather = () => {
    fetch(weatherDataToMap)
    .then((response) => response.json()) 
    .then((data) => {
      setTemp(data.main.temp)
      setDescription(data.weather[0].main)
      setIcon(data.weather[0].icon)
    })
    .catch((error) => {
      Alert.alert('Error', error);
    });
  }

// Every time user presses "Show in Map" button in Search.js, fetchLocationDataToMap will fetch the new data.
useEffect(() => {
  fetchLocationDataToMap();
  fetchWeather();
}, []);
  
  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/sunset.jpg')} style={{ flex: 1 }}>
        <View style={styles.weatherInfo}>
          <Text style={{ fontSize: 20, textAlign: 'center', paddingTop: 10 }}>{city.toUpperCase()}</Text>
          <Text style={{ fontSize: 15, textAlign: 'center' }}>{Math.round(temp)}°C</Text>
          <Text style={{ fontSize: 15, textAlign: 'center' }}>{description}</Text>
          <View style={styles.currentWeather}>
            <Image style={{ width: 100, height: 100 }}
              source={{
              uri: `http://openweathermap.org/img/wn/${icon}@4x.png`
              }}
            />
          </View>
        </View>
        <MapView 
          style={{flex: 1, width: '100%', height: '100%' }}
          region={region}>
          <Marker 
            coordinate={coordinates}
            pinColor='#335577'
            title={city}
          />
        </MapView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  weatherInfo: {
    flex: 0.3
  },
  currentWeather: {
    alignContent: 'center',
    alignItems: 'center'
}
});