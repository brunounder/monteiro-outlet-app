import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, KeyboardAvoidingView } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useNavigation } from '@react-navigation/native'; 
import styles, { COLORS } from './styles'; 

export default function Cadastro() {
  const navigation = useNavigation();

  const [time, setTime] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  
  const [genero, setGenero] = useState('Masculino'); 
  const [modelo, setModelo] = useState('Torcedor'); 
  const [tamanho, setTamanho] = useState('M'); 
  
  const [foto1, setFoto1] = useState('');
  const [foto2, setFoto2] = useState('');
  const [foto3, setFoto3] = useState('');

  const [itensPendentes, setItensPendentes] = useState(0);

  const API_URL = 'http://192.168.1.14:3000/produtos'; 

  const tamanhosAdulto = ['PP', 'P', 'M', 'G', 'GG', 'EXG'];
  const tamanhosInfantil = ['2 anos', '4 anos', '6 anos', '8 anos', '10 anos', '12 anos', '14 anos'];
  
  const obterGradeTamanhos = () => {
    if (genero === 'Infantil') return tamanhosInfantil;
    return tamanhosAdulto; 
  };

  useEffect(() => {
    verificarFilaOffline();
  }, []);

  const verificarFilaOffline = async () => {
    const fila = await AsyncStorage.getItem('@fila_cadastro_produtos');
    if (fila) {
      const produtosFila = JSON.parse(fila);
      setItensPendentes(produtosFila.length);
    }
  };

  // Função para converter links do Google Drive em links diretos de imagem
  const converterLinkDrive = (url) => {
    if (url.includes('drive.google.com')) {
      const id = url.split('/d/')[1]?.split('/')[0];
      return `https://lh3.googleusercontent.com/u/0/d/${id}`;
    }
    return url;
  };

  const fazerLogout = async () => {
    Alert.alert('Sair 🚪', 'Deseja voltar para a tela de login?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
          await AsyncStorage.clear(); 
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }}
    ]);
  };

  const cadastrarProduto = async () => {
    if (!time || !preco || !quantidade || !tamanho) {
      Alert.alert('Atenção ⚠️', 'Preencha os campos obrigatórios!');
      return;
    }

    // Aplica a conversão de links do Drive antes de salvar
    const fotosArray = [
      converterLinkDrive(foto1), 
      converterLinkDrive(foto2), 
      converterLinkDrive(foto3)
    ].filter(link => link.trim() !== '');

    const novoProduto = {
      time,
      tamanho,
      preco: parseFloat(preco),
      quantidade: parseInt(quantidade),
      modelo,
      genero,
      fotos: fotosArray
    };

    try {
      await axios.post(API_URL, novoProduto);
      Alert.alert('Sucesso 🎉', 'Produto cadastrado!');
      limparCampos(); 
    } catch (error) {
      const filaAtual = await AsyncStorage.getItem('@fila_cadastro_produtos');
      const produtosFila = filaAtual ? JSON.parse(filaAtual) : [];
      produtosFila.push(novoProduto);
      await AsyncStorage.setItem('@fila_cadastro_produtos', JSON.stringify(produtosFila));
      setItensPendentes(produtosFila.length);
      Alert.alert('Offline 📲', 'Salvo no celular!');
      limparCampos(); 
    }
  };

  const sincronizarFila = async () => {
    const fila = await AsyncStorage.getItem('@fila_cadastro_produtos');
    if (!fila) return;
    const produtosFila = JSON.parse(fila);
    if (produtosFila.length === 0) return;

    try {
      for (const prod of produtosFila) { await axios.post(API_URL, prod); }
      await AsyncStorage.removeItem('@fila_cadastro_produtos');
      setItensPendentes(0);
      Alert.alert('Sucesso! 🎉', 'Sincronizado!');
    } catch (error) {
      Alert.alert('Erro ❌', 'Servidor não encontrado.');
    }
  };

  const limparCampos = () => {
    setTime(''); setPreco(''); setQuantidade('');
    setFoto1(''); setFoto2(''); setFoto3('');
    setGenero('Masculino'); setModelo('Torcedor'); setTamanho('M');
  };

  return (
    <SafeAreaView style={specificStyles.fullscreenSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#070A13" />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Novo Cadastro</Text>
              <Text style={{ color: COLORS.textSecondary }}>Monteiro Outlet</Text>
            </View>
            
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                style={[specificStyles.syncButton, { backgroundColor: itensPendentes > 0 ? COLORS.gold : '#1A2236', marginRight: 10 }]} 
                onPress={sincronizarFila}
              >
                <Ionicons name="cloud-upload-outline" size={20} color={itensPendentes > 0 ? '#070A13' : '#556475'} />
                {itensPendentes > 0 && (
                  <View style={specificStyles.badgeFila}><Text style={specificStyles.badgeText}>{itensPendentes}</Text></View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={[specificStyles.syncButton, { backgroundColor: '#1A2236' }]} onPress={fazerLogout}>
                <Ionicons name="log-out-outline" size={20} color="#FF3366" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={specificStyles.inputLabel}>Nome do Time</Text>
          <TextInput style={specificStyles.input} value={time} onChangeText={setTime} placeholder="Ex: Flamengo..." placeholderTextColor="#556475" />

          <Text style={specificStyles.inputLabel}>Gênero</Text>
          <View style={specificStyles.selectorContainer}>
            {['Masculino', 'Feminino', 'Infantil'].map((item) => (
              <TouchableOpacity key={item} style={[specificStyles.selectorButton, genero === item && { backgroundColor: COLORS.gold, borderColor: COLORS.gold }]} onPress={() => setGenero(item)}>
                <Text style={[specificStyles.selectorText, genero === item && { color: '#070A13' }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={specificStyles.inputLabel}>Tamanho</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {obterGradeTamanhos().map((item) => (
              <TouchableOpacity key={item} style={[specificStyles.sizeButton, tamanho === item && { backgroundColor: COLORS.gold, borderColor: COLORS.gold }]} onPress={() => setTamanho(item)}>
                <Text style={[specificStyles.sizeText, tamanho === item && { color: '#070A13' }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '48%' }}>
              <Text style={specificStyles.inputLabel}>Preço</Text>
              <TextInput style={specificStyles.input} value={preco} onChangeText={setPreco} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#556475" />
            </View>
            <View style={{ width: '48%' }}>
              <Text style={specificStyles.inputLabel}>Qtd</Text>
              <TextInput style={specificStyles.input} value={quantidade} onChangeText={setQuantidade} keyboardType="numeric" placeholder="0" placeholderTextColor="#556475" />
            </View>
          </View>

          <Text style={specificStyles.inputLabel}>URLs das Fotos (Google Drive ou Web)</Text>
          <TextInput style={specificStyles.input} value={foto1} onChangeText={setFoto1} placeholder="Cole o link da Foto 1 aqui" placeholderTextColor="#556475" />
          <TextInput style={specificStyles.input} value={foto2} onChangeText={setFoto2} placeholder="Cole o link da Foto 2 aqui" placeholderTextColor="#556475" />
          <TextInput style={specificStyles.input} value={foto3} onChangeText={setFoto3} placeholder="Cole o link da Foto 3 aqui" placeholderTextColor="#556475" />

          <TouchableOpacity style={specificStyles.btnCadastrar} onPress={cadastrarProduto}>
            <Ionicons name="cube-outline" size={22} color="#070A13" style={{ marginRight: 10 }} />
            <Text style={specificStyles.btnTextCadastrar}>Salvar no Estoque</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const specificStyles = StyleSheet.create({
  fullscreenSafeArea: { flex: 1, backgroundColor: '#070A13' },
  inputLabel: { color: COLORS.gold, fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  input: { height: 50, backgroundColor: '#1A2236', borderRadius: 10, paddingHorizontal: 15, color: '#FFF', fontSize: 14, borderWidth: 1, borderColor: '#2A354F', marginBottom: 20 },
  selectorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  selectorButton: { flex: 1, height: 45, backgroundColor: '#1A2236', justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#2A354F', marginHorizontal: 4 },
  selectorText: { color: '#556475', fontSize: 13, fontWeight: 'bold' },
  sizeButton: { width: 60, height: 45, backgroundColor: '#1A2236', justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#2A354F', marginRight: 10 },
  sizeText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  btnCadastrar: { flexDirection: 'row', backgroundColor: COLORS.gold, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 15, marginBottom: 30 },
  btnTextCadastrar: { color: '#070A13', fontSize: 16, fontWeight: 'bold' },
  syncButton: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A354F' },
  badgeFila: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FF3366', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});