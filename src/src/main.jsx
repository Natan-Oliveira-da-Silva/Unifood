// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Estilos globais
import "./reset.css";
import "./index.css";

// --- Importação de Todas as Páginas ---

// Páginas Gerais
import TelaInicial from "./pages/TelaInicial/TelaInicial.jsx";

// Páginas de Cliente
import LoginCliente from "./pages/Cliente/LoginCliente/LoginCliente.jsx";
import CadastroCliente from "./pages/Cliente/CadastroCliente/CadastroCliente.jsx";
import InicioCliente from "./pages/Cliente/InicioCliente/InicioCliente.jsx"; // <<< Verifique este import
import ConsultarPedidos from "./pages/Cliente/ConsultarPedidos/ConsultarPedidos.jsx";
import Perfil from "./pages/Cliente/Perfil/Perfil.jsx";
import Carrinho from "./pages/Cliente/Carrinho/Carrinho.jsx";
import EsqueciSenha from "./pages/Cliente/EsqueciSenha/EsqueciSenha.jsx";
// TODO: import ResetarSenha from "./pages/Cliente/ResetarSenha/ResetarSenha.jsx";

// Páginas de Restaurante
import LoginRestaurante from "./pages/Restaurante/LoginRestaurante/LoginRestaurante.jsx";
import CadastroRestaurante from "./pages/Restaurante/CadastroRestaurante/CadastroRestaurante.jsx";
import InicioRestaurante from "./pages/Restaurante/InicioRestaurante/InicioRestaurante.jsx";
import CadastrarDetalhesRestaurante from "./pages/Restaurante/CadastrarDetalhesRestaurante/CadastrarDetalhesRestaurante.jsx";
import CriarProduto from "./pages/Restaurante/CriarProduto/CriarProduto.jsx";
import MeusProdutos from "./pages/Restaurante/MeusProdutos/MeusProdutos.jsx";

// --- Configuração do Roteador ---
const router = createBrowserRouter([
  // Rota Principal
  {
    path: "/",
    element: <TelaInicial />,
  },

  // Rotas de Cliente
  {
    path: "/cliente/login",
    element: <LoginCliente />,
  },
  {
    path: "/cliente/cadastro",
    element: <CadastroCliente />,
  },
  {
    path: "/cliente/inicio", // <<< A ROTA QUE ESTAVA FALTANDO
    element: <InicioCliente />,
  },
  {
    path: "/cliente/consultarpedidos",
    element: <ConsultarPedidos />,
  },
  {
    path: "/cliente/perfil",
    element: <Perfil />,
  },
  {
    path: "/cliente/carrinho",
    element: <Carrinho />,
  },
  {
    path: "/cliente/esqueci-senha",
    element: <EsqueciSenha />,
  },
  
  
  // Rotas de Restaurante
  {
    path: "/restaurante/login",
    element: <LoginRestaurante />,
  },
  {
    path: "/restaurante/cadastro",
    element: <CadastroRestaurante />,
  },
  {
    path: "/restaurante/inicio",
    element: <InicioRestaurante />,
  },
  {
    path: "/restaurante/cadastrar-detalhes",
    element: <CadastrarDetalhesRestaurante />,
  },
  {
    path: "/restaurante/criarproduto",
    element: <CriarProduto />,
  },
  {
    path: "/restaurante/meusprodutos",
    element: <MeusProdutos />,
  },
]);

// Renderização da Aplicação
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);