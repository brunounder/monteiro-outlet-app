# 👕 Monteiro Outlet App

Um aplicativo completo e dinâmico desenvolvido para o gerenciamento de estoque e controle financeiro de uma loja de vestuário esportivo. O projeto foi construído pensando na resiliência e na experiência do usuário, contando com um sistema exclusivo de funcionamento offline.

---

## 🚀 Principais Funcionalidades

* **Autenticação Corporativa:** Sistema de login seguro exigindo CNPJ, identificação de usuário (CPF) e senha numérica para travar acessos não autorizados.
* **Gestão de Estoque:** Cadastro completo de camisas esportivas incluindo grade de tamanhos dinâmica (adulto e infantil), variação de modelos (Jogador, Torcedor, Retrô, Treino) e suporte para até 3 links de imagens por produto.
* **Modo Offline Inteligente:** Se o servidor principal estiver fora do ar ou o dispositivo perder a conexão com a internet, o aplicativo não trava! Os produtos cadastrados são salvos localmente na memória do celular.
* **Sincronização em Nuvem:** Um indicador visual (badge vermelho) avisa quantos itens estão presos no celular. Com um toque no ícone de nuvem, o app dispara todas as camisas salvas direto para o banco de dados quando a rede voltar!
* **Interface Adaptativa:** Layout escuro (Dark Mode) moderno com feedback visual instantâneo e navegação fluida por abas.

---

## 🛠️ Tecnologias Utilizadas

O projeto utiliza a stack JavaScript moderna para entregar performance tanto no celular quanto no servidor:

* **Front-end:** React Native (com Expo Go)
* **Estilização e Ícones:** StyleSheet nativo e Ionicons
* **Persistência Local (Offline):** `@react-native-async-storage/async-storage`
* **Comunicação:** Axios
* **Back-end:** Node.js com Express
* **Banco de Dados:** MongoDB

---

## 🌐 API do Projeto

O código do servidor e a conexão com o banco de dados MongoDB deste aplicativo podem ser encontrados no repositório separado: **[monteiro-outlet-api](https://github.com/brunounder/monteiro-outlet-api)**.

---

## 🧑‍💻 Sobre o Autor

Fala aí! Eu sou o Bruno da Silva Santos e desenvolvi esse projeto do zero como um Dev Full Stack. Além de criar toda a interface do app em React Native, eu também desenvolvi o servidor em Node.js e o banco de dados no MongoDB. O meu maior desafio aqui foi criar a lógica de sincronização para fazer as duas pontas conversarem perfeitamente, mesmo operando no modo offline!!