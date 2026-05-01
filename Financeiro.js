import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import axios from 'axios';
import styles, { COLORS } from './styles'; 

const { width } = Dimensions.get('window');

export default function Financeiro() {
  const [produtosReais, setProdutosReais] = useState([]);
  const [vendas, setVendas] = useState([]);

  const [valorVenda, setValorVenda] = useState('');
  const [custoVenda, setCustoVenda] = useState('');
  const [timeVendido, setTimeVendido] = useState('');
  const [modeloSelecionado, setModeloSelecionado] = useState('Jogador');
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState('Pix');

  const API_URL = 'http://192.168.1.14:3000/produtos'; 

  useFocusEffect(
    useCallback(() => {
      carregarProdutosDoEstoque();
      carregarVendasSalvas(); 
    }, [])
  );

  const carregarProdutosDoEstoque = async () => {
    try {
      const response = await axios.get(API_URL);
      setProdutosReais(response.data);
    } catch (error) {
      console.log('Backend offline. Mostrando apenas dados locais.');
    }
  };

  const carregarVendasSalvas = async () => {
    try {
      const vendasSalvas = await AsyncStorage.getItem('@vendas_monteiro');
      if (vendasSalvas !== null) {
        setVendas(JSON.parse(vendasSalvas));
      }
    } catch (error) {
      console.log('Erro ao carregar vendas locais');
    }
  };

  const adicionarVenda = async () => {
    if (!valorVenda || !custoVenda || !timeVendido) {
      Alert.alert('Atenção', 'Preencha o valor, o custo e o time para registrar a venda!');
      return;
    }

    const novaVenda = {
      id: Math.random().toString(),
      time: timeVendido,
      modelo: modeloSelecionado,
      valor: parseFloat(valorVenda),
      custo: parseFloat(custoVenda),
      pagamento: pagamentoSelecionado,
      data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    };

    const listaAtualizada = [novaVenda, ...vendas];
    setVendas(listaAtualizada);
    
    try {
      await AsyncStorage.setItem('@vendas_monteiro', JSON.stringify(listaAtualizada));
    } catch (error) {
      console.log('Erro ao salvar venda no celular');
    }

    setValorVenda('');
    setCustoVenda('');
    setTimeVendido('');
  };

  const confirmarLimpezaHistorico = () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja apagar todas as vendas e zerar os gráficos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim, Apagar Tudo', 
          style: 'destructive', 
          onPress: async () => {
            setVendas([]);
            try {
              await AsyncStorage.removeItem('@vendas_monteiro'); 
            } catch (error) {
              console.log('Erro ao limpar memória');
            }
          } 
        }
      ]
    );
  };

  const faturamentoTotal = vendas.reduce((acc, item) => acc + item.valor, 0);
  const custoTotal = vendas.reduce((acc, item) => acc + item.custo, 0);
  const lucroTotal = faturamentoTotal - custoTotal;

  const valorInvestidoEstoque = produtosReais.reduce((acc, item) => {
    const qtd = parseInt(item.quantidade) || 0;
    const preco = parseFloat(item.preco) || 0;
    return acc + (preco * qtd);
  }, 0);

  const contarPagamentos = (tipo) => vendas.filter(v => v.pagamento === tipo).length;
  
  const dataPizza = [
    { name: 'Pix', population: contarPagamentos('Pix'), color: COLORS.accent, legendFontColor: '#FFF', legendFontSize: 12 },
    { name: 'Cartão', population: contarPagamentos('Cartão'), color: COLORS.gold, legendFontColor: '#FFF', legendFontSize: 12 },
    { name: 'Dinheiro', population: contarPagamentos('Dinheiro'), color: '#00E676', legendFontColor: '#FFF', legendFontSize: 12 },
  ];

  const ultimasVendas = [...vendas].reverse().slice(-4);
  const dataLinha = ultimasVendas.length > 0 ? ultimasVendas.map(v => v.valor) : [0];
  const labelsLinha = ultimasVendas.length > 0 ? ultimasVendas.map(v => v.data) : ['-'];

  const chartConfig = {
    backgroundGradientFrom: '#1A2236',
    backgroundGradientTo: '#1A2236',
    color: (opacity = 1) => `rgba(218, 165, 32, ${opacity})`, 
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
  };

  const renderVenda = ({ item }) => {
    const lucroVenda = item.valor - item.custo;
    return (
      <View style={specificStyles.cardVenda}>
        <View style={specificStyles.vendaIconArea}>
          <Ionicons name={item.pagamento === 'Pix' ? 'flash' : item.pagamento === 'Cartão' ? 'card' : 'cash'} size={20} color={COLORS.gold} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={specificStyles.vendaTitle}>{item.time} ({item.modelo})</Text>
          <Text style={specificStyles.vendaSub}>{item.data} • via {item.pagamento}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={specificStyles.vendaValor}>R$ {item.valor.toFixed(2)}</Text>
          <Text style={[specificStyles.vendaLucro, { color: lucroVenda >= 0 ? '#00E676' : '#FF3B30' }]}>Lucro: R$ {lucroVenda.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={specificStyles.fullscreenSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#070A13" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        
        <Text style={styles.title}></Text>
        
        <View style={specificStyles.formCard}>
          <Text style={specificStyles.formTitle}>Registrar Nova Venda</Text>
          <TextInput style={specificStyles.input} placeholder="Nome do Time/Camisa" placeholderTextColor="#556475" value={timeVendido} onChangeText={setTimeVendido} />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TextInput style={[specificStyles.input, { width: '48%' }]} placeholder="Valor (R$)" placeholderTextColor="#556475" keyboardType="numeric" value={valorVenda} onChangeText={setValorVenda} />
            <TextInput style={[specificStyles.input, { width: '48%' }]} placeholder="Custo (R$)" placeholderTextColor="#556475" keyboardType="numeric" value={custoVenda} onChangeText={setCustoVenda} />
          </View>

          <Text style={specificStyles.labelPequeno}>Tipo de Camisa:</Text>
          <View style={specificStyles.selectorContainer}>
            {['Jogador', 'Torcedor', 'Retrô', 'Kit'].map((m) => (
              <TouchableOpacity key={m} style={[specificStyles.selectItem, modeloSelecionado === m && specificStyles.selectItemActive]} onPress={() => setModeloSelecionado(m)}>
                <Text style={[specificStyles.selectText, modeloSelecionado === m && specificStyles.selectTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={specificStyles.labelPequeno}>Forma de Pagamento:</Text>
          <View style={specificStyles.selectorContainer}>
            {['Pix', 'Cartão', 'Dinheiro'].map((p) => (
              <TouchableOpacity key={p} style={[specificStyles.selectItem, pagamentoSelecionado === p && specificStyles.selectItemActive]} onPress={() => setPagamentoSelecionado(p)}>
                <Text style={[specificStyles.selectText, pagamentoSelecionado === p && specificStyles.selectTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={specificStyles.btnAdicionar} onPress={adicionarVenda}>
            <Text style={{ color: '#070A13', fontWeight: 'bold' }}>Salvar Venda</Text>
          </TouchableOpacity>
        </View>

        <View style={specificStyles.metricasContainer}>
          <View style={specificStyles.cardMetrica}>
            <Ionicons name="arrow-up-circle" size={20} color="#00E676" />
            <Text style={specificStyles.metricaLabel}>Faturamento</Text>
            <Text style={[specificStyles.metricaValor, { color: '#00E676' }]}>R$ {faturamentoTotal.toFixed(2)}</Text>
          </View>
          <View style={[specificStyles.cardMetrica, { borderColor: COLORS.gold }]}>
            <Ionicons name="star" size={20} color={COLORS.gold} />
            <Text style={specificStyles.metricaLabel}>Lucro Real</Text>
            <Text style={[specificStyles.metricaValor, { color: COLORS.gold }]}>R$ {lucroTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={[specificStyles.cardMetricaFull, { marginTop: 10 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="cube-outline" size={22} color={COLORS.accent} />
            <Text style={[specificStyles.metricaLabel, { marginLeft: 8, marginTop: 0, marginBottom: 0 }]}>Capital em Estoque</Text>
          </View>
          <Text style={[specificStyles.metricaValor, { color: COLORS.accent, fontSize: 18 }]}>R$ {valorInvestidoEstoque.toFixed(2)}</Text>
        </View>

        {vendas.length > 0 && (
          <>
            <Text style={specificStyles.sectionTitle}>Evolução de Entradas</Text>
            <View style={specificStyles.chartCard}>
              <LineChart data={{ labels: labelsLinha, datasets: [{ data: dataLinha }] }} width={width - 40} height={180} chartConfig={chartConfig} bezier style={{ borderRadius: 12, marginLeft: -15 }} />
            </View>
          </>
        )}

        {vendas.length > 0 && (
          <>
            <Text style={specificStyles.sectionTitle}>Formas de Pagamento</Text>
            <View style={specificStyles.chartCard}>
              <PieChart data={dataPizza} width={width - 40} height={150} chartConfig={chartConfig} accessor={'population'} backgroundColor={'transparent'} paddingLeft={'15'} absolute />
            </View>
          </>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 10 }}>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Histórico de Vendas</Text>
          {vendas.length > 0 && (
            <TouchableOpacity onPress={confirmarLimpezaHistorico} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              <Text style={{ color: '#FF3B30', fontSize: 13, fontWeight: 'bold', marginLeft: 5 }}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>

        {vendas.length === 0 ? (
          <View style={specificStyles.cardVenda}>
            <Text style={{ color: '#556475', textAlign: 'center', width: '100%' }}>Nenhuma venda registrada ainda.</Text>
          </View>
        ) : (
          <FlatList data={vendas} keyExtractor={(item) => item.id} renderItem={renderVenda} scrollEnabled={false} contentContainerStyle={{ paddingBottom: 20 }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const specificStyles = StyleSheet.create({
  fullscreenSafeArea: { flex: 1, backgroundColor: '#070A13' },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 10 },
  metricasContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cardMetrica: { width: '48%', backgroundColor: '#1A2236', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2A354F' },
  metricaLabel: { color: '#556475', fontSize: 11, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  
  // CORREÇÃO AQUI: Removi a cor verde fixa do StyleSheet
  metricaValor: { fontSize: 16, fontWeight: 'bold' }, 

  cardMetricaFull: { width: '100%', backgroundColor: '#1A2236', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#2A354F', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartCard: { backgroundColor: '#1A2236', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#2A354F', alignItems: 'center' },
  cardVenda: { backgroundColor: '#1A2236', borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2A354F' },
  vendaIconArea: { backgroundColor: '#070A13', padding: 8, borderRadius: 8 },
  vendaTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  vendaSub: { color: '#556475', fontSize: 12, marginTop: 2 },
  vendaValor: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  vendaLucro: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  formCard: { backgroundColor: '#1A2236', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#2A354F' },
  formTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#070A13', color: '#FFF', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#2A354F' },
  labelPequeno: { color: '#556475', fontSize: 12, fontWeight: 'bold', marginTop: 5, marginBottom: 5 },
  selectorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  selectItem: { flex: 1, backgroundColor: '#070A13', padding: 8, borderRadius: 8, alignItems: 'center', marginHorizontal: 2, borderWidth: 1, borderColor: '#2A354F' },
  selectItemActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  selectText: { color: '#556475', fontSize: 11, fontWeight: 'bold' },
  selectTextActive: { color: '#070A13' },
  btnAdicionar: { backgroundColor: COLORS.gold, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 }
});