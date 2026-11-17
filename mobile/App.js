import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { colors } from './src/theme/colors'
import HomeScreen      from './src/screens/HomeScreen'
import LearnScreen     from './src/screens/LearnScreen'
import ReferenceScreen from './src/screens/ReferenceScreen'
import ProfileScreen   from './src/screens/ProfileScreen'

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle:     { backgroundColor: colors.bg2, shadowColor: 'transparent', borderBottomColor: colors.border, borderBottomWidth: 1 },
          headerTintColor: colors.text,
          headerTitleStyle:{ fontWeight: '800', fontSize: 18, letterSpacing: -0.5 },
          tabBarStyle: {
            backgroundColor: colors.bg2,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 8, paddingTop: 8, height: 70,
          },
          tabBarActiveTintColor:   colors.teal,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              Home:      focused ? 'home'            : 'home-outline',
              Learn:     focused ? 'book'            : 'book-outline',
              Reference: focused ? 'hand-right'      : 'hand-right-outline',
              Profile:   focused ? 'person'          : 'person-outline',
            }
            return <Ionicons name={icons[route.name]} size={size} color={color} />
          },
        })}>
        <Tab.Screen name="Home"      component={HomeScreen}      options={{ title: '🤟 SignAI' }} />
        <Tab.Screen name="Learn"     component={LearnScreen}     options={{ title: '📚 Learn Signs' }} />
        <Tab.Screen name="Reference" component={ReferenceScreen} options={{ title: '🤚 Reference' }} />
        <Tab.Screen name="Profile"   component={ProfileScreen}   options={{ title: '👤 Profile' }} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
