import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SearchStackNavigator, HomeStackNavigator } from './StackNavigator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    // Home and Search pages, bottom tab menu for our app
    <Tab.Navigator screenOptions={{headerShown: false}} >
      <Tab.Screen name="Home" component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => (
            <MaterialCommunityIcons name="home" color="#335577" size={26} />
          )
        }} />
      <Tab.Screen name="Search" component={SearchStackNavigator}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: () => (
            <MaterialCommunityIcons name="magnify" color="#335577" size={26} />
          )
        }} />
    </Tab.Navigator>
  );
};