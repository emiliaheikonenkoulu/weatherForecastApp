import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Map from '../screens/Map';
import Search from '../screens/Search';
import Home from '../screens/Home';

const Stack = createStackNavigator();

const screenOptionStyle = {
  headerStyle: {
    backgroundColor: '#335577'
  },
  headerTintColor: '#fff'
};

// Search and Map pages stack navigator
const SearchStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptionStyle}>
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Map" component={Map} />
    </Stack.Navigator>
  );
};

// Home page stack navigator
const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptionStyle}>
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
};

export { SearchStackNavigator, HomeStackNavigator };