import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles, { COLORS } from './styles';

export default function Login({ navigation }) {
  const [cnpj, setCnpj] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [ocultarSenha, setOcultarSenha] = useState(true);

  const niveisAcesso = {
    '12345678901': { nome: 'Bruno', cargo: 'ADMIN' },
    '98765432100': { nome: 'Carlos', cargo: 'GERENTE' },
    '11122233344': { nome: 'Marcos', cargo: 'SUPERVISOR' },
    '55544433322': { nome: 'Lucas', cargo: 'COLABORADOR' }
  };

  useEffect(() => {
    verificarLoginExistente();
  }, []);

  const verificarLoginExistente = async () => {
    const logado = await AsyncStorage.getItem('@usuario_logado');
    if (logado === 'true') navigation.navigate('Tabs');
  };

  const lidarComLogin = async () => {
    const cnpjCorreto = '58895531000170';
    const senhaCorreta = '2026';

    if (!cnpj || !usuario || !senha) {
      Alert.alert('Aviso', 'Preencha todos os campos!');
      return;
    }

    const usuarioLogado = niveisAcesso[usuario];

    if (cnpj !== cnpjCorreto) {
      Alert.alert('Erro', 'CNPJ inválido!');
      return;
    }

    if (!usuarioLogado) {
      Alert.alert('Erro', 'Usuário não autorizado!');
      return;
    }

    if (senha !== senhaCorreta) {
      Alert.alert('Erro', 'Senha incorreta!');
      return;
    }

    try {
      await AsyncStorage.setItem('@usuario_logado', 'true');
      await AsyncStorage.setItem('@cargo_usuario', usuarioLogado.cargo);
      await AsyncStorage.setItem('@nome_usuario', usuarioLogado.nome); // SALVA O NOME AQUI
      
      Alert.alert('Sucesso', `Bem-vindo, ${usuarioLogado.nome} (${usuarioLogado.cargo})`);
      navigation.navigate('Tabs');
    } catch (error) {
      console.log('Erro ao salvar login');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#070A13' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={specificStyles.scrollContainer}>
        <View style={specificStyles.logoContainer}>
          <View style={specificStyles.iconWrapper}>
             <Ionicons name="layers" size={50} color={COLORS.gold} />
          </View>
          <View style={specificStyles.brandRow}>
            <Text style={specificStyles.textWhite}>BOX</Text>
            <Text style={[specificStyles.textGold, { fontWeight: 'bold' }]}>HUB</Text>
          </View>
          <View style={specificStyles.badgeSGI}>
            <Text style={specificStyles.badgeText}>SISTEMA DE GESTÃO INTEGRADA</Text>
          </View>
        </View>

        <View style={specificStyles.formContainer}>
          <TextInput style={specificStyles.input} placeholder="CNPJ" placeholderTextColor="#556475" value={cnpj} onChangeText={setCnpj} keyboardType="numeric" />
          <TextInput style={specificStyles.input} placeholder="CPF (Usuário)" placeholderTextColor="#556475" value={usuario} onChangeText={setUsuario} keyboardType="numeric" maxLength={11} />
          <View style={specificStyles.senhaWrapper}>
            <TextInput style={[specificStyles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]} placeholder="Senha" placeholderTextColor="#556475" secureTextEntry={ocultarSenha} value={senha} onChangeText={setSenha} keyboardType="numeric" />
            <TouchableOpacity onPress={() => setOcultarSenha(!ocultarSenha)} style={specificStyles.eyeBtn}>
              <Ionicons name={ocultarSenha ? "eye-off" : "eye"} size={20} color={COLORS.gold} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={specificStyles.btnLogin} onPress={lidarComLogin}>
            <Text style={specificStyles.btnLoginText}>ENTRAR NO SISTEMA</Text>
          </TouchableOpacity>
        </View>

        <View style={specificStyles.footer}>
          <Text style={specificStyles.footerMain}>Monteiro Outlet LTDA</Text>
          <Text style={specificStyles.footerSub}>Brasília/DF - Versão 2.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const specificStyles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  iconWrapper: { marginBottom: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'baseline' },
  textWhite: { color: '#FFF', fontSize: 40, fontWeight: '300', letterSpacing: 2 },
  textGold: { color: COLORS.gold, fontSize: 40, letterSpacing: 2 },
  badgeSGI: { backgroundColor: '#1A2236', paddingVertical: 6, paddingHorizontal: 20, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#2A354F' },
  badgeText: { color: COLORS.gold, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  formContainer: { width: '100%' },
  input: { height: 55, backgroundColor: '#1A2236', borderRadius: 12, paddingHorizontal: 15, color: '#FFF', marginBottom: 15, borderWidth: 1, borderColor: '#2A354F' },
  senhaWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2236', borderRadius: 12, borderWidth: 1, borderColor: '#2A354F', marginBottom: 25 },
  eyeBtn: { paddingHorizontal: 15 },
  btnLogin: { backgroundColor: COLORS.gold, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnLoginText: { color: '#070A13', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  footer: { marginTop: 40, alignItems: 'center' },
  footerMain: { color: '#FFF', fontSize: 12, opacity: 0.7 },
  footerSub: { color: '#556475', fontSize: 10, marginTop: 4 }
});