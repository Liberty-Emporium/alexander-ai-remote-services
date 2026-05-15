import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/theme/colors';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import DiagnoseScreen from './src/screens/DiagnoseScreen';
import ResultScreen from './src/screens/ResultScreen';
import TechScreen from './src/screens/TechScreen';
import JobHistoryScreen from './src/screens/JobHistoryScreen';
import JobDetailScreen from './src/screens/JobDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

// ── Auth navigator (login / register) ────────────────────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// ── Bottom tabs ───────────────────────────────────────────────────────────────
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.navyMid,
          borderTopColor: colors.navyBorder,
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.electric,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:    focused ? 'home' : 'home-outline',
            Diagnose: focused ? 'scan' : 'scan-outline',
            Tech:    focused ? 'headset' : 'headset-outline',
            History: focused ? 'time' : 'time-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Diagnose" component={DiagnoseScreen} />
      <Tab.Screen name="Tech" component={TechScreen} />
      <Tab.Screen name="History" component={JobHistoryScreen} options={{ tabBarLabel: 'History' }} />
    </Tab.Navigator>
  );
}

// ── Authenticated app navigator ────────────────────────────────────────────────
function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Main" component={BottomTabs} />
      <AppStack.Screen
        name="Result"
        component={ResultScreen}
        options={{ presentation: 'card' }}
      />
      <AppStack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ presentation: 'card' }}
      />
      <AppStack.Screen
        name="JobHistory"
        component={JobHistoryScreen}
        options={{ presentation: 'card' }}
      />
      <AppStack.Screen
        name="TechScreen"
        component={TechScreen}
        options={{ presentation: 'card' }}
      />
    </AppStack.Navigator>
  );
}

// ── Root navigator — switches between auth and app ────────────────────────────
function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onReady={() => setShowSplash(false)} />;
  }

  if (loading) {
    return null; // Brief loading state while auth resolves
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

// ── App entry point ────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: colors.electric,
                background: colors.navyDeep,
                card: colors.navyMid,
                text: colors.textPrimary,
                border: colors.navyBorder,
                notification: colors.error,
              },
            }}
          >
            <StatusBar style="light" backgroundColor={colors.navyDeep} />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
