// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./reset.css";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Seus outros imports de página
import TelaInicial from "./pages/TelaInicial/TelaInicial.jsx";
import LoginCliente from "./pages/Cliente/LoginCliente/LoginCliente.jsx";
import CadastroCliente from "./pages/Cliente/CadastroCliente/CadastroCliente.jsx";
import InicioCliente from "./pages/Cliente/InicioCliente/InicioCliente.jsx";
import EsqueciSenha from "./pages/Cliente/EsqueciSenha/EsqueciSenha.jsx"; // <<< NOVO IMPORT
// ... etc

const router = createBrowserRouter([
  {
    path: "/",
    element: <TelaInicial />,
  },
  {
    path: "/cliente/login",
    element: <LoginCliente />,
  },
  {
    path: "/cliente/esqueci-senha", // <<< NOVA ROTA
    element: <EsqueciSenha />,
  },
  // ... (suas outras rotas)
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);