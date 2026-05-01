import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles, { COLORS } from './styles';

export default function Dashboard() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [nomeUsuario, setNomeUsuario] = useState('Usuário');
  const [cargo, setCargo] = useState('Colaborador');

  const [resumo, setResumo] = useState({
    valorEstoque: 0,
    totalVendas: 0,
    lucroLiquido: 0,
    qtdProdutos: 0
  });

  useFocusEffect(
    useCallback(() => {
      carregarDadosIniciais();
    }, [])
  );

  const fazerLogout = () => {
    Alert.alert('Sair 🚪', 'Deseja realmente encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive', 
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } 
      }
    ]);
  };

  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      const nomeSessao = await AsyncStorage.getItem('@nome_usuario');
      const cargoSessao = await AsyncStorage.getItem('@cargo_usuario');
      
      if (nomeSessao) setNomeUsuario(nomeSessao);
      if (cargoSessao) setCargo(cargoSessao);

      const response = await axios.get('http://192.168.1.14:3000/produtos');
      const produtos = response.data;
      
      const calculoEstoque = produtos.reduce((acc, p) => acc + (p.preco * p.quantidade), 0);
      const totalItens = produtos.reduce((acc, p) => acc + Number(p.quantidade), 0);

      const vendasSalvas = await AsyncStorage.getItem('@vendas_monteiro');
      const listaVendas = vendasSalvas ? JSON.parse(vendasSalvas) : [];
      
      const calculoVendas = listaVendas.reduce((acc, v) => acc + v.valor, 0);
      const calculoLucro = listaVendas.reduce((acc, v) => acc + (v.valor - (v.custo || 0)), 0);

      setResumo({
        valorEstoque: calculoEstoque,
        totalVendas: calculoVendas,
        lucroLiquido: calculoLucro,
        qtdProdutos: totalItens
      });

    } catch (error) {
      console.log("Erro ao atualizar Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.fullscreen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.fullscreen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        
        <View style={dashStyles.header}>
          <View>
            <Text style={dashStyles.welcomeText}>Olá, {nomeUsuario} 👋</Text>
            <View style={dashStyles.roleTag}>
                <Text style={dashStyles.roleTagText}>{cargo.toUpperCase()}</Text>
            </View>
          </View>
          <TouchableOpacity style={dashStyles.logoutBtn} onPress={fazerLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3366" />
          </TouchableOpacity>
        </View>

        <View style={dashStyles.mainCard}>
          <Text style={dashStyles.mainLabel}>LUCRO LÍQUIDO ACUMULADO</Text>
          <Text style={dashStyles.mainValue}>R$ {resumo.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          <View style={dashStyles.badgeLucro}>
            <Ionicons name="trending-up" size={16} color={COLORS.bg} />
            <Text style={dashStyles.badgeText}>DESEMPENHO POSITIVO</Text>
          </View>
        </View>

        <View style={dashStyles.grid}>
          <View style={dashStyles.miniCard}>
            <Ionicons name="cart" size={24} color={COLORS.accent} />
            <Text style={dashStyles.miniLabel}>Total Vendas</Text>
            <Text style={dashStyles.miniValue}>R$ {resumo.totalVendas.toFixed(2)}</Text>
          </View>
          <View style={dashStyles.miniCard}>
            <Ionicons name="cube" size={24} color={COLORS.gold} />
            <Text style={dashStyles.miniLabel}>Capital em Estoque</Text>
            <Text style={dashStyles.miniValue}>R$ {resumo.valorEstoque.toFixed(2)}</Text>
          </View>
        </View>

        <View style={dashStyles.infoBox}>
          <Ionicons name="shirt" size={20} color={COLORS.textSecondary} />
          <Text style={dashStyles.infoText}>
            Você possui <Text style={{ color: COLORS.gold }}>{resumo.qtdProdutos}</Text> peças prontas para venda.
          </Text>
        </View>

        <TouchableOpacity style={dashStyles.actionButton} onPress={carregarDadosIniciais}>
          <Ionicons name="refresh" size={20} color={COLORS.bg} />
          <Text style={dashStyles.actionButtonText}>ATUALIZAR INDICADORES</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const dashStyles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 30 },
  roleTag: { backgroundColor: '#1A2236', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 4, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.gold + '40' },
  roleTagText: { color: COLORS.gold, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  logoutBtn: { backgroundColor: '#1A2236', width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A354F' },
  welcomeText: { color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' },
  mainCard: { backgroundColor: COLORS.cardBg, borderRadius: 20, padding: 25, borderWidth: 1, borderColor: COLORS.gold, marginBottom: 20 },
  mainLabel: { color: COLORS.textSecondary, fontSize: 12, letterSpacing: 1, fontWeight: '600' },
  mainValue: { color: COLORS.gold, fontSize: 32, fontWeight: 'bold', marginVertical: 10 },
  badgeLucro: { backgroundColor: COLORS.accent, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  badgeText: { color: COLORS.bg, fontSize: 10, fontWeight: 'bold', marginLeft: 5 },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  miniCard: { backgroundColor: COLORS.cardBg, width: '48%', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border },
  miniLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 10 },
  miniValue: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2236', padding: 15, borderRadius: 12, marginTop: 20 },
  infoText: { color: COLORS.textSecondary, marginLeft: 10, fontSize: 14 },
  actionButton: { backgroundColor: COLORS.gold, flexDirection: 'row', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  actionButtonText: { color: COLORS.bg, fontWeight: 'bold', marginLeft: 10 }
});