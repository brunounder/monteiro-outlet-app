import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './styles'; 

// 📦 Importando as suas telas (AGORA COM O FINANCEIRO!)
import Login from './Login';
import Cadastro from './Cadastro';
import Catalogo from './Catalogo'; 
import Financeiro from './Financeiro'; // 👈 AQUI ESTÁ A MÁGICA!

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Menu de abas que abre após o login
function MenuAbas() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Cadastro') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Catálogo') {
            iconName = focused ? 'shirt' : 'shirt-outline';
          } else if (route.name === 'Financeiro') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: '#556475',
        tabBarStyle: { 
          backgroundColor: '#070A13', 
          borderTopColor: '#1A2236',
          height: 60,
          paddingBottom: 8
        },
        headerShown: false, // 🚀 Tira o nome do topo
      })}
    >
      <Tab.Screen name="Cadastro" component={Cadastro} />
      <Tab.Screen name="Catálogo" component={Catalogo} />
      <Tab.Screen name="Financeiro" component={Financeiro} />
    </Tab.Navigator>
  );
}

// Estrutura principal de navegação
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Tabs" component={MenuAbas} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}