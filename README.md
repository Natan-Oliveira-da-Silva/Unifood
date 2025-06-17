
# 🍔 Unifood — Sistema de Delivery Universitário

Seja Bem-Vindo ao **UNIFOOD**, um MVC de delivery de comida desenvolvido pelos estudantes:  
**Diogo Souza**, **Nathan Oliveira**, **Elvis Reis**, **Danilo Queiroz**, **Caue Luz**, **Pedro Bispo**, **Gustavo Lima**  
para a realização da A3 de Usabilidade ministrada pelos professores **Lucas (Teórica)** e **Thiago (Prática)**  
da **Universidade Salvador (UNIFACS)**.  
O aplicativo foi criado tendo como base as **leis da Usabilidade de Jakob Nielsen**.

---

## 📦 Tecnologias Utilizadas

### 🔧 Frontend
- React
- React Router DOM
- React Icons
- CSS Modules
- localStorage para autenticação simples

### 🖥️ Backend
- Node.js
- Express
- SQLite3
- JWT (jsonwebtoken)
- bcrypt
- dotenv

---

## 📁 Estrutura de Pastas

```
📦src
 ┣ 📂pages
 ┃ ┣ 📂Cliente
 ┃ ┃ ┣ LoginCliente.jsx
 ┃ ┃ ┣ CadastroCliente.jsx
 ┃ ┃ ┣ Carrinho.jsx
 ┃ ┃ ┣ ConsultarPedidos.jsx
 ┃ ┃ ┗ ...
 ┃ ┣ 📂Restaurante
 ┃ ┃ ┣ LoginRestaurante.jsx
 ┃ ┃ ┣ CadastroRestaurante.jsx
 ┃ ┃ ┣ CriarProduto.jsx
 ┃ ┃ ┣ MeusProdutos.jsx
 ┃ ┃ ┣ InicioRestaurante.jsx
 ┃ ┃ ┗ PedidosRestaurante.jsx
 ┗ 📂components
   ┗ CabecalhoCliente.jsx / CabecalhoRestaurante.jsx
```

---

## ⚙️ Funcionalidades por Acesso

### 👤 Cliente
- Cadastro e login
- Visualização de restaurantes
- Adição de produtos ao carrinho
- Finalização de pedidos
- Consulta de pedidos realizados
- Cancelamento de pedidos pendentes

### 🍽️ Restaurante
- Cadastro de restaurante
- Login e gerenciamento do próprio restaurante
- Cadastro e edição de produtos
- Visualização de pedidos recebidos
- Alteração de status do pedido: `pendente`, `em preparo`, `saiu para entrega`, `finalizado`, `cancelado`

---

## 🛠️ Como Executar o Projeto

### 🔽 Pré-requisitos

- Node.js instalado
- SQLite3 disponível
- Terminal e navegador web

### 🚀 Rodando o backend

```bash
cd backend
npm install
cp .env.exemplo .env  
node server.js
```

```Via Terminal VsCode

Criar 1 terminal
npm install
cd Prototipo/backend
npm start

```

### 🌐 Rodando o frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`

```Via Terminal VsCode

Criar 1 terminal
npm install
cd src/src
npm run dev
```

---

## 📌 Observações

- O sistema usa **SQLite**, então o banco de dados é leve e já embarcado no projeto.
- A autenticação é feita com **JWT** e armazenada em `localStorage`.
- Interfaces 100% responsivas com CSS Modules.

---

## 🧑‍💻 Desenvolvido por

**Danilo Queiroz**, **Diogo Souza**, **Nathan Oliveira**, **Elvis Reis**,  
**Caue Luz**, **Pedro Bispo**, **Gustavo Lima**  
**UNIFACS - 2025**
