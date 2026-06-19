# São João da Fé 2026 — Pacote 01

## Base
Este pacote usa a V1 como base oficial porque foi a versão que confirmou o Pix corretamente na InfinitePay.

## Regra deste pacote
O motor de pagamento foi mantido intacto.

Arquivos preservados da V1:
- `comprar.html`
- `obrigado.html`
- `package.json`
- `api/criar-pagamento.js`
- `api/webhook-infinitepay.js`
- `api/verificar-pagamento.js`

Arquivo atualizado:
- `index.html` — painel da secretaria/controle.

## Melhorias incluídas no painel da secretaria
- Layout mais organizado.
- Botões compactados em `Mais ações`.
- Devolver pedido.
- Excluir pedido, exigindo confirmação.
- Filtro para devolvidos.
- Filtro para tentativas aguardando pagamento.
- Tentativas aguardando pagamento ficam fora dos totais.
- Devolvidos ficam fora dos totais.
- Confirmação manual de pagamento após conferência no app da InfinitePay.
- Relatórios e filtros do painel preservados/melhorados.

## O que não foi alterado
- Criação de checkout da InfinitePay.
- Payload enviado para InfinitePay.
- Redirect da InfinitePay.
- Webhook da InfinitePay.
- Página de compra.
- Página de obrigado.

## Teste recomendado
Depois de subir:
1. Teste a página de compra.
2. Faça um Pix real pequeno.
3. Confirme se a InfinitePay reconhece o pagamento.
4. Confirme se o pedido entra no painel da secretaria.
5. Só depois avançar para o Pacote 02.
