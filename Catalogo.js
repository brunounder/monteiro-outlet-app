import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, StatusBar, Modal, ScrollView } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import styles, { COLORS } from './styles'; 

const { width } = Dimensions.get('window');
// Cálculo para os cards caberem lado a lado com margem
const cardWidth = (width - 50) / 2; 

export default function Catalogo() {
  const [produtos, setProdutos] = useState([]);
  const [filtroSelecionado, setFiltroSelecionado] = useState('Todos');
  
  // Estados para Modal de Visualização de Foto
  const [modalFotoVisivel, setModalFotoVisivel] = useState(false);
  const [fotosParaVisualizar, setFotosParaVisualizar] = useState([]);
  const [indiceFotoAtual, setIndiceFotoAtual] = useState(0);

  const API_URL = 'http://192.168.1.14:3000/produtos'; 

  useFocusEffect(
    useCallback(() => { carregarProdutos(); }, [])
  );

  const carregarProdutos = async () => {
    try {
      const response = await axios.get(API_URL);
      setProdutos(response.data);
      await AsyncStorage.setItem('@catalogo_produtos', JSON.stringify(response.data));
    } catch (error) {
      const dadosLocais = await AsyncStorage.getItem('@catalogo_produtos');
      if (dadosLocais !== null) {
        setProdutos(JSON.parse(dadosLocais));
      }
    }
  };

  const abrirVisualizacaoFoto = (fotos) => {
    const fotosValidas = Array.isArray(fotos) ? fotos.filter(f => f && f.trim() !== '') : [];
    setFotosParaVisualizar(fotosValidas);
    setIndiceFotoAtual(0);
    setModalFotoVisivel(true);
  };

  const renderItem = ({ item }) => {
    const temFoto = Array.isArray(item.fotos) && item.fotos.length > 0 && item.fotos[0].trim() !== '';

    return (
      <View style={specificStyles.cardProduto}>
        {/* ÁREA DA FOTO */}
        <TouchableOpacity onPress={() => abrirVisualizacaoFoto(item.fotos)}>
          {temFoto ? (
            <View>
              <Image source={{ uri: item.fotos[0] }} style={specificStyles.fotoProduto} />
              <Ionicons name="expand-outline" size={16} color={COLORS.gold} style={specificStyles.expandIcon} />
            </View>
          ) : (
            <View style={specificStyles.semFotoCard}>
              <Ionicons name="camera-reverse-outline" size={24} color="#556475" />
              <Text style={specificStyles.semFotoTexto}>Sem Foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ÁREA DE TEXTO (Mantendo todas as suas tags originais) */}
        <View style={specificStyles.infoContainer}>
          <Text style={specificStyles.productTitle} numberOfLines={1}>{item.time}</Text>
          
          <View style={specificStyles.tagVerticalContainer}>
            <View style={{ flexDirection: 'row', marginBottom: 4, flexWrap: 'wrap' }}>
              <View style={specificStyles.tagTamanho}>
                <Text style={specificStyles.tagTamanhoText}>{item.tamanho}</Text>
              </View>
              <View style={specificStyles.tagGenero}>
                <Text style={specificStyles.tagGeneroText}>{item.genero || 'Masculino'}</Text>
              </View>
            </View>

            <View style={specificStyles.tagModelo}>
              <Text style={specificStyles.tagModeloText}>{item.modelo || 'Torcedor'}</Text>
            </View>

            <View style={[specificStyles.tagEstoque, item.quantidade < 3 ? { borderColor: '#FF3366' } : { borderColor: COLORS.gold }]}>
              <Text style={[specificStyles.tagEstoqueText, item.quantidade < 3 ? { color: '#FF3366' } : { color: COLORS.gold }]}>
                Qtd: {item.quantidade}
              </Text>
            </View>
          </View>

          <Text style={specificStyles.productPrice}>R$ {item.preco?.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={specificStyles.fullscreenSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#070A13" />

      <View style={specificStyles.customHeader}>
        <Text style={styles.title}>Estoque Monteiro</Text>
        <TouchableOpacity style={specificStyles.headerIcon} onPress={carregarProdutos}>
          <Ionicons name="refresh" size={22} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {['Todos', 'Masculino', 'Feminino', 'Infantil'].map((categoria) => (
            <TouchableOpacity 
              key={categoria} 
              style={[specificStyles.botaoFiltro, filtroSelecionado === categoria && { backgroundColor: COLORS.gold, borderColor: COLORS.gold }]} 
              onPress={() => setFiltroSelecionado(categoria)}
            >
              <Text style={[specificStyles.textFiltro, filtroSelecionado === categoria && { color: '#070A13' }]}>{categoria}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <FlatList
        data={filtroSelecionado === 'Todos' ? produtos : produtos.filter(p => p.genero === filtroSelecionado)}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        numColumns={2} // Isso faz ficar um do lado do outro
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      {/* MODAL FOTO GRANDE */}
      <Modal visible={modalFotoVisivel} transparent={true}>
         <View style={specificStyles.modalFotoContainer}>
            <TouchableOpacity style={specificStyles.closeFotoBtn} onPress={() => setModalFotoVisivel(false)}>
               <Ionicons name="close" size={40} color="#FFF" />
            </TouchableOpacity>
            {fotosParaVisualizar.length > 0 && (
               <Image source={{ uri: fotosParaVisualizar[indiceFotoAtual] }} style={specificStyles.fotoGrande} resizeMode="contain" />
            )}
         </View>
      </Modal>

    </SafeAreaView>
  );
}

const specificStyles = StyleSheet.create({
  fullscreenSafeArea: { flex: 1, backgroundColor: '#070A13' },
  customHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginVertical: 15 },
  headerIcon: { backgroundColor: '#1A2236', padding: 10, borderRadius: 10 },
  
  // ESTILO DO CARD EM GRADE
  cardProduto: { 
    backgroundColor: '#10141E', 
    borderRadius: 16, 
    padding: 10, 
    marginBottom: 15, 
    width: cardWidth, // Largura calculada para 2 colunas
    borderWidth: 1, 
    borderColor: '#1A2236',
    flexDirection: 'column' // Itens empilhados dentro do card
  },
  
  fotoProduto: { width: '100%', height: 140, borderRadius: 12 },
  expandIcon: { position: 'absolute', bottom: 5, right: 5 },
  semFotoCard: { width: '100%', height: 140, borderRadius: 12, backgroundColor: '#1A2236', justifyContent: 'center', alignItems: 'center' },
  semFotoTexto: { color: '#556475', fontSize: 10 },
  
  infoContainer: { marginTop: 10 },
  productTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  productPrice: { color: COLORS.gold, fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  
  tagVerticalContainer: { marginTop: 5 },
  tagTamanho: { backgroundColor: '#2A354F', paddingHorizontal: 6, borderRadius: 4, marginRight: 5, marginBottom: 4 },
  tagTamanhoText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  tagGenero: { backgroundColor: '#1A2236', paddingHorizontal: 6, borderRadius: 4, borderWidth: 1, borderColor: '#3b5998', marginBottom: 4 },
  tagGeneroText: { color: '#8b9dc3', fontSize: 10 },
  tagModelo: { marginTop: 2 },
  tagModeloText: { color: COLORS.gold, fontSize: 10 },
  tagEstoque: { marginTop: 6, borderWidth: 1, paddingHorizontal: 6, borderRadius: 4, alignSelf: 'flex-start' },
  tagEstoqueText: { fontSize: 10, fontWeight: 'bold' },
  
  botaoFiltro: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#1A2236', backgroundColor: '#1A2236' },
  textFiltro: { color: '#FFF', fontWeight: 'bold' },
  modalFotoContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  closeFotoBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10 },
  fotoGrande: { width: '100%', height: '80%' }
});