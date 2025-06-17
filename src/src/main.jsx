import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";

// Estilos globais
import "./reset.css";
import "./index.css";

import TelaInicial from "./pages/TelaInicial/TelaInicial.jsx";
import LoginCliente from "./pages/Cliente/LoginCliente/LoginCliente.jsx";
import CadastroCliente from "./pages/Cliente/CadastroCliente/CadastroCliente.jsx";
import InicioCliente from "./pages/Cliente/InicioCliente/InicioCliente.jsx";
import ConsultarPedidos from "./pages/Cliente/ConsultarPedidos/ConsultarPedidos.jsx"; 
import Perfil from "./pages/Cliente/Perfil/Perfil.jsx";
import Carrinho from "./pages/Cliente/Carrinho/Carrinho.jsx";
import EsqueciSenha from "./pages/Cliente/EsqueciSenha/EsqueciSenha.jsx";
import LoginRestaurante from "./pages/Restaurante/LoginRestaurante/LoginRestaurante.jsx";
import CadastroRestaurante from "./pages/Restaurante/CadastroRestaurante/CadastroRestaurante.jsx";
import InicioRestaurante from "./pages/Restaurante/InicioRestaurante/InicioRestaurante.jsx";
import CadastrarDetalhesRestaurante from "./pages/Restaurante/CadastrarDetalhesRestaurante/CadastrarDetalhesRestaurante.jsx";
import CriarProduto from "./pages/Restaurante/CriarProduto/CriarProduto.jsx";
import MeusProdutos from "./pages/Restaurante/MeusProdutos/MeusProdutos.jsx";
import PedidosRestaurante from "./pages/Restaurante/PedidosRestaurante/PedidosRestaurante.jsx";


const router = createBrowserRouter([

  { path: "/", element: <TelaInicial /> },

  // Rotas de Cliente
  { path: "/cliente/login", element: <LoginCliente /> },
  { path: "/cliente/cadastro", element: <CadastroCliente /> },
  { path: "/cliente/inicio", element: <InicioCliente /> },
  { path: "/cliente/consultarpedidos", element: <ConsultarPedidos /> },
  { path: "/cliente/perfil", element: <Perfil /> },
  { path: "/cliente/carrinho", element: <Carrinho /> },
  { path: "/cliente/esqueci-senha", element: <EsqueciSenha /> },

  // Rotas de Restaurante
  { path: "/restaurante/login", element: <LoginRestaurante /> },
  { path: "/restaurante/cadastro", element: <CadastroRestaurante /> },
  { path: "/restaurante/inicio", element: <InicioRestaurante /> },
  { path: "/restaurante/cadastrar-detalhes", element: <CadastrarDetalhesRestaurante /> },
  { path: "/restaurante/criarproduto", element: <CriarProduto /> },
  { path: "/restaurante/meusprodutos", element: <MeusProdutos /> },
  { path: "/restaurante/pedidos", element: <PedidosRestaurante /> },
  
]);

// Renderização da Aplicação
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  </StrictMode>
);