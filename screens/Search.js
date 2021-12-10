import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Image, Keyboard, FlatList, ImageBackground } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SQLite from 'expo-sqlite';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Input, Button, ListItem } from 'react-native-elements';

const db = SQLite.openDatabase('citiesdb.db');

// put here your https://openweathermap.org/ API key
const API_KEY = ``;

// put here your https://developer.mapquest.com/ API key
const geocoding_API_KEY = ``;

export default function Search({ navigation }) {
    const [city, setCity] = useState('');
    const [cities, setCities] = useState([]);
    const [sound, setSound] = useState();

    const [name, setName] = useState('');
    const [temp, setTemp] = useState(0);
    const [description, setDescription] = useState('');
    const [feelsLike, setFeelsLike] = useState(0);
    const [speed, setSpeed] = useState(0);
    const [humidity, setHumidity] = useState(0);
    const [icon, setIcon] = useState('');

    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });

      useEffect(() => {
        registerForPushNotificationsAsync();

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification);
        });
    
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log(response);
        });
    
        return () => {
          Notifications.removeNotificationSubscription(notificationListener.current);
          Notifications.removeNotificationSubscription(responseListener.current);
        };
      }, []);

    // Creating database table for cities.
    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql('create table if not exists cities (id integer primary key not null, city text);');
        });
        updateList();
    },[]);

    // Save new city.
    const saveItem = () => {
        if(city == '') {
            Alert.alert("Can't add to favorites!");
        } else {
            db.transaction(tx => {
                tx.executeSql('insert into cities (city) values (?);', [city]);
            }, null, updateList);
            // After save button is pressed, we hide the keyboard
            Keyboard.dismiss();
            schedulePushNotification();
        }
    };

    // Update cities list.
    const updateList = () => {
        db.transaction(tx => {
            tx.executeSql('select * from cities;', [], (_, { rows }) =>
            setCities(rows._array)
            );
        });
    };

    // Delete city with confirm.
    const deleteItem = (id) => {
        Alert.alert(
            'Are your sure?',
            'Are you sure you want to delete city?',
            [
              // If user presses "Yes" we delete city from favorites and play a sound.
              {
                text: "Yes",
                onPress: () => {
                    db.transaction(
                        tx => {
                            tx.executeSql('delete from cities where id=?;', [id]);
                        }, null, updateList
                    );
                    playSound(); 
                },
              },
              // If user presses "No", nothing happens.
              {
                text: "No"
              },
            ]
          );
    };

    // This async function plays soud when user deletes city from his favorites list.
    async function playSound() {
        const { sound } = await Audio.Sound.createAsync(
            require("../assets/soundmp.mp3")
        );
        setSound(sound);

        await sound.playAsync();
    }

    React.useEffect(() => {
        return sound
          ? () => {
              sound.unloadAsync(); }
          : undefined;
      }, [sound]);

    // Every time user searches new city, fetchLocationData will fetch the new data.
    useEffect(() => {
        fetchLocationData('Helsinki');
    }, []);

    // fetchLocation will fetch data based on users input from search button.
    const fetchLocationData = (city) => {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            setName(data.name)
            setTemp(data.main.temp)
            setDescription(data.weather[0].main)
            setFeelsLike(data.main.feels_like)
            setSpeed(data.wind.speed)
            setHumidity(data.main.humidity)
            setIcon(data.weather[0].icon)
            // After search button is pressed, we hide the keyboard.
            Keyboard.dismiss();
        })
        .catch(error => {
            Alert.alert('Error', error);
         });
    };

    // After "Show in Map" button is pressed we navigate to Map.js and pass
    // information to that file using params.
    const getCoordinatesToCity = (city) => {
        const geocodingUrl = `http://www.mapquestapi.com/geocoding/v1/address?key=${geocoding_API_KEY}&location=${city}`;
        const weatherDataToMap = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
        navigation.navigate('Map', { geocodingUrl, city, weatherDataToMap })
      };
    
      return (
        <View style={styles.container}>
            <ImageBackground source={require('../assets/blue.jpg')} style={{ flex: 1 }}>
                <Input
                    placeholder='Enter location...'
                    label='LOCATION'
                    labelStyle={{ color: 'black' }}
                    placeholderTextColor='black'
                    leftIcon={{ type: 'font-awesome', name: 'building-o' }}
                    value={city}
                    onChangeText={(text) => setCity(text)}
                />
                <View style={styles.inputIcon}>
                    <MaterialCommunityIcons name="magnify" size={32} onPress={() => fetchLocationData(city)} />
                    <MaterialCommunityIcons name="heart-outline" size={32}
                        onPress={() => {
                            saveItem();
                        }}
                        title="Save Location"
                    />
                </View> 
                <Text style={{ textAlign: 'center', fontSize: 18 }}>Current weather in {name}</Text>
                <View style={styles.currentWeather}>
                    <Image style={styles.icon}
                        source={{
                        uri: `http://openweathermap.org/img/wn/${icon}@4x.png`
                        }}
                    />
                </View>
                <View style={styles.info}>
                <View style={styles.weatherInfo}>
                    <Text style={styles.temperature}>{Math.round(temp)}°C</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>   
                </View>             
                <View style={styles.info}>
                    <View style={styles.weatherInfo}>
                        <Text style={{ fontSize: 15, textAlign: 'center', color: 'white' }}>Feels like: {Math.round(feelsLike)}°C</Text>
                        <Text style={{ fontSize: 15, textAlign: 'center', color: 'white' }}>Wind speed: {speed}m/s</Text>
                        <Text style={{ fontSize: 15, textAlign: 'center', color: 'white' }}>Humidity: {humidity}%</Text>
                    </View>
                </View>
                <Text style={{ fontSize: 16, textAlign: 'center', paddingBottom: 10, paddingTop: 20 }}>YOUR FAVORITE LOCATIONS</Text>
                <FlatList style={styles.list}
                    keyExtractor={item => item.id.toString()} 
                    data={cities} 
                    renderItem={({ item }) => (
                    <ListItem containerStyle={{backgroundColor: 'transparent'}} topDivider >
                        <ListItem.Content>
                            <ListItem.Title>{item.city.toUpperCase()}</ListItem.Title>
                        </ListItem.Content>
                        <Button title="Show in Map" titleStyle={{ color: '#335577' }} type="clear" onPress={() => { getCoordinatesToCity(item.city); }} />
                        <MaterialCommunityIcons name="magnify" size={32} onPress={() => fetchLocationData(item.city)} />
                        <MaterialCommunityIcons name="delete" size={32} onPress={() => { deleteItem(item.id); }} />
                    </ListItem>
                    )}
                /> 
            </ImageBackground>
        </View>
    );

    // This function shows user a notification when a new city is
    // addded to favorite locations
    async function schedulePushNotification() {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "New city added to your favorites!",
            body: `${city}`
          },
          trigger: { seconds: 1 }
        });
    }

    // This async function will ask permission to use Expo notifications
    async function registerForPushNotificationsAsync() {
    if (Constants.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        }
        if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
        }
    } else {
        alert('Must use physical device for Push Notifications');
    }
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    inputIcon: {
        flexDirection: 'row',
         paddingBottom: 10,
         justifyContent: 'center'
    },
    currentWeather: {
        alignContent: 'center',
        alignItems: 'center'
    },
    icon: {
        width: 100,
        height: 100
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
      },
      citiesList: {
        alignItems: 'center',
        padding: 20
      },
      list: {
        padding: 1,
        width: '100%',
      }
})

