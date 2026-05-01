import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// IMPORTAÇÃO DAS SUAS TELAS
import Login from './Login';
import Dashboard from './Dashboard';
import Cadastro from './Cadastro';
import Catalogo from './Catalogo';
import Financeiro from './Financeiro';
import { COLORS } from './styles';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// CONFIGURAÇÃO DO MENU INFERIOR (TABS)
function MenuAbas() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Início') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Cadastro') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Estoque') {
            iconName = focused ? 'shirt' : 'shirt-outline';
          } else if (route.name === 'Financeiro') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: '#556475',
        tabBarStyle: { 
          backgroundColor: COLORS.bg, 
          borderTopColor: COLORS.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 5
        },
        headerStyle: { 
          backgroundColor: COLORS.bg, 
          elevation: 0, 
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border
        },
        headerTitleStyle: { 
          color: COLORS.textPrimary,
          fontWeight: 'bold',
          fontSize: 18,
          letterSpacing: 1
        },
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen name="Início" component={Dashboard} options={{ title: 'DASHBOARD' }} />
      <Tab.Screen name="Cadastro" component={Cadastro} options={{ title: 'NOVO ITEM' }} />
      <Tab.Screen name="Estoque" component={Catalogo} options={{ title: 'MEU ESTOQUE' }} />
      <Tab.Screen name="Financeiro" component={Financeiro} options={{ title: 'RELATÓRIOS' }} />
    </Tab.Navigator>
  );
}

// NAVEGAÇÃO PRINCIPAL (FLUXO DE LOGIN)
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Tela de Login vem primeiro */}
        <Stack.Screen name="Login" component={Login} />
        
        {/* Após o login, o usuário entra no Menu de Abas */}
        <Stack.Screen name="Tabs" component={MenuAbas} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}