import { StyleSheet } from 'react-native';

// 🏆 PALETA PREMIUM COPA 2026
export const COLORS = {
  bg: '#070A13', // Fundo Carbono ultra escuro
  cardBg: '#111625', // Azul/Preto fechado para os cards
  textPrimary: '#FFFFFF', // Branco puro
  textSecondary: '#7A8B9E', // Cinza fosco elegante
  accent: '#00E676', // Verde Esmeralda (Sucesso/Botões)
  border: '#1A233A', // Divisórias discretas
  gold: '#FFD700', // Dourado taça da copa
};

export default StyleSheet.create({
  // Fundo principal de TODAS as telas (Garante que não fica borda branca)
  fullscreen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 15,
  },

  // Título da Tela
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },

  // O Card onde ficam os formulários (Sem bordas brancas!)
  cardFormulario: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border, // Borda sutil escura
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  // Campos de digitação
  input: {
    backgroundColor: '#1A2236',
    color: COLORS.textPrimary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Botão Salvar
  button: {
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#070A13',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
