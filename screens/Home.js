import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator, Image, FlatList, ImageBackground, ScrollView } from 'react-native';
import * as Location from 'expo-location';

// put here your https://openweathermap.org/ API key
const API_KEY = ``;
let url = `https://api.openweathermap.org/data/2.5/onecall?&units=metric&exclude=minutely&appid=${API_KEY}`;

export default function Home() {
    const [weather, setWeather] = useState('');
    const [place, setPlace] = useState('');

    // fetchWeather will fetch weather data based on the user's location.
    // With async function we will wait user's location permission first before proceeding forward.
    const fetchWeather = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('No permission to get location')
        }
        
        // If permission is granted, we get location and use it in API call as lat and lon.
        let location = await Location.getCurrentPositionAsync({});

        // url for testing: https://api.openweathermap.org/data/2.5/onecall?&units=metric&exclude=minutely&appid=9a563d503b9045d424821962b9b4a9b2&lat=10&lon=20
        const response = await fetch(`${url}&lat=${location.coords.latitude}&lon=${location.coords.longitude}`);
        // Converting fetched data into JSON.
        const data = await response.json();

        // With this fetch we will get user's current location's name.
        // url for testing: http://api.openweathermap.org/data/2.5/weather?lat=10&lon=20&appid=9a563d503b9045d424821962b9b4a9b2
        const locationResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${API_KEY}`);
        // Converting fetched data into JSON.
        const locationData = await locationResponse.json();

        // If there is some problem fetching the data, we will throw error alert.
        // If we can fetch data without any problems, we set the data to weather and place variables.
        if (!response.ok && !locationResponse.ok) {
            Alert.alert('Error')
        } else {
            setWeather(data);
            setPlace(locationData);
        }
    };
    
    // Every time user's location changes we will run fetchWeather to update current weather data.
    useEffect(() => {
        fetchWeather();
    }, []);
    
    // If the app is fetching the weather data, we will display a circular loading indicator to user.
    if (!weather) {
        return <View style={styles.loading}>
          <ActivityIndicator size="large" />
          </View>;
    };

    const current = weather.current.weather[0];
    const currentLocation = place.name;
    
    return (
        <View style={styles.container}>
            <ImageBackground source={require('../assets/blue.jpg')} style={{ flex: 1 }}>
                <ScrollView>
                    <Text style={styles.title}>Current Weather</Text>
                    <Text style={{ textAlign: 'center', fontSize: 20 }}>in {currentLocation}</Text>
                    <View style={styles.currentWeather}>
                        <Image style={styles.icon} source={{
                            uri: `http://openweathermap.org/img/wn/${current.icon}@4x.png`
                        }}
                        />
                    </View>
                    <View style={styles.info}>
                        <View style={styles.weatherInfo}>
                            <Text style={styles.temperature}>{Math.round(weather.current.temp)}°C</Text>
                            <Text style={styles.description}>{current.description}</Text>
                        </View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.weatherInfo}>
                            <Text style={{ fontSize: 15, textAlign: 'center', color: 'white' }}> Feels like: {Math.round(weather.current.feels_like)}°C</Text>
                            <Text style={{ fontSize: 15, textAlign: 'center', color: 'white' }}> Wind speed: {(weather.current.wind_speed).toFixed(1)}m/s</Text>
                            <Text style={{ fontSize: 15, textAlign: 'center', color: 'white' }}>Humidity: {weather.current.humidity}%</Text>
                            <Text style={{ fontSize: 15, textAlign: 'center', color: 'white' }}>UV index: {weather.current.uvi}</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={{ textAlign: 'center', fontSize: 20, paddingTop: 30 }}>24 hour forecast for {currentLocation}</Text>
                        <FlatList horizontal
                            data={weather.hourly.slice(0, 24)}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={(hour) => {
                                const hourlyForecast = hour.item.weather[0];
                                const date = new Date(hour.item.dt * 1000);
                            return <View style={{ alignItems: 'center', padding: 20 }}>
                            <Text>{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                            <Text>{Math.round(hour.item.temp)}°C</Text>
                            <Image
                                style={{ width: 150, height: 150 }}
                                source={{
                                uri: `http://openweathermap.org/img/wn/${hourlyForecast.icon}@4x.png`
                                }}
                            />
                            <Text style={{ textTransform: 'capitalize' }}>{hourlyForecast.description}</Text>
                            </View>
                            }}
                        />
                    </View>
                </ScrollView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    title: {
        width: '100%',
        textAlign: 'center',
        fontSize: 30,
        paddingTop: 10
    },
    currentWeather: {
        alignContent: 'center',
        alignItems: 'center'
    },
    icon: {
        width: 150,
        height: 150,
    },
    loading: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    temperature: {
        fontSize: 15,
        textAlign: 'center',
        color: 'white'
    },
    description: {
        textAlign: 'center',
        fontSize: 15,
        textTransform: 'capitalize',
        color: 'white'
    },
    weatherInfo: {
        backgroundColor: '#335577',
        padding: 10,
        borderRadius: 20,
        justifyContent: 'center',
    },
    info: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10
      }
})