import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./reset.css";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import TelaInicial from "./pages/TelaInicial/TelaInicial.jsx";
import LoginCliente from "./pages/Cliente/LoginCliente/LoginCliente.jsx";
import CadastroCliente from "./pages/Cliente/CadastroCliente/CadastroCliente.jsx";
import InicioCliente from "./pages/Cliente/InicioCliente/InicioCliente.jsx";
import LoginRestaurante from "./pages/Restaurante/LoginRestaurante/LoginRestaurante.jsx";
import CadastroRestaurante from "./pages/Restaurante/CadastroRestaurante/CadastroRestaurante.jsx";
import InicioRestaurante from "./pages/Restaurante/InicioRestaurante/InicioRestaurante.jsx";
import CriarProduto from "./pages/Restaurante/CriarProduto/CriarProduto.jsx";
import MeusProdutos from "./pages/Restaurante/MeusProdutos/MeusProdutos.jsx";
import ConsultarPedidos from "./pages/Cliente/ConsultarPedidos/ConsultarPedidos.jsx";
import Perfil from "./pages/Cliente/Perfil/Perfil.jsx";
import Carrinho from "./pages/Cliente/Carrinho/Carrinho.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <TelaInicial />,
  },
  {
    path: "/TelaInicial/TelaInicial",
    element: <TelaInicial />,
  },
  {
    path: "/cliente/login",
    element: <LoginCliente />,
  },
  {
    path: "/cliente/inicio",
    element: <InicioCliente />,
  },
  {
    path: "/cliente/cadastro",
    element: <CadastroCliente />,
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
    path: "/restaurante/login",
    element: <LoginRestaurante />,
  },
  {
    path: "/restaurante/inicio",
    element: <InicioRestaurante />,
  },
  {
    path: "/restaurante/cadastro",
    element: <CadastroRestaurante />,
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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
