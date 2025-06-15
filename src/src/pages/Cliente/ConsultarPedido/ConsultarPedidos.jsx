import React from "react";

function CardPedido({ pedido, token, atualizarListaPedidos }) {
  async function alterarStatusPedido(id_pedido, novoStatus) {
    const confirmar = window.confirm(`Deseja realmente alterar o status para "${novoStatus}"?`);
    if (!confirmar) return;

    // Se cliente está tentando cancelar
    if (novoStatus.toLowerCase() === "cancelado") {
      const motivo = prompt("Por favor, informe o motivo do cancelamento:");
      if (!motivo || motivo.trim() === "") {
        alert("O motivo do cancelamento é obrigatório.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/api/pedidos/cancelar/${id_pedido}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ motivo }),
        });

        if (!response.ok) {
          const erro = await response.json();
          throw new Error(erro.message || "Erro ao cancelar o pedido.");
        }

        alert("Pedido cancelado com sucesso!");
        atualizarListaPedidos();
      } catch (error) {
        console.error("Erro ao cancelar pedido:", error);
        alert("Erro ao tentar cancelar o pedido.");
      }

      return;
    }

    // Para status diferentes de "cancelado", segue fluxo normal (PATCH)
    fetch(`http://localhost:3001/api/pedidos/${id_pedido}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: novoStatus })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Erro ao atualizar o status do pedido.");
        }
        return response.json();
      })
      .then(data => {
        alert("Status atualizado com sucesso!");
        atualizarListaPedidos();
      })
      .catch(error => {
        console.error("Erro ao atualizar status:", error);
        alert("Erro ao tentar atualizar o status.");
      });
  }

  return (
    <div className="cardPedido">
      <div className="cabecalho">
        <h2>Pedido #{pedido.id_pedido}</h2>
        <span className="status">{pedido.status?.toUpperCase()}</span>
      </div>

      <p><strong>Cliente:</strong> {pedido.nome_cliente}</p>
      <p><strong>Pagamento:</strong> {pedido.forma_pagamento_nome}</p>
      <p><strong>Endereço:</strong> {pedido.endereco_logradouro || "-"}, {pedido.endereco_numero || "-"}</p>
      <p><strong>Data:</strong> {new Date(pedido.data_pedido).toLocaleString()}</p>
      <p><strong>Total:</strong> R$ {pedido.valor_total?.toFixed(2) || "0,00"}</p>

      <p><strong>Itens:</strong></p>
      {pedido.itens.map((item, index) => (
        <div key={item.id_item_pedido || index} style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
          <img src={item.url_imagem} alt={item.nome_produto} width={40} />
          <span style={{ marginLeft: "0.5rem" }}>{item.quantidade}x {item.nome_produto}</span>
        </div>
      ))}

      <div style={{ marginTop: '1rem' }}>
        <label><strong>Alterar Status:</strong></label>{" "}
        <select
          value={pedido.status}
          onChange={(e) => alterarStatusPedido(pedido.id_pedido, e.target.value)}
        >
          <option value="pendente">Pendente</option>
          <option value="recebido">Recebido</option>
          <option value="em preparo">Em Preparo</option>
          <option value="finalizado">Finalizado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
    </div>
  );
}

export default CardPedido;
