# São João da Fé 2026 — Pacote 05

## Base
Este pacote parte do Pacote 03, que já estava validado com o pagamento funcionando.

## Alteração principal
A página de venda foi redesenhada de forma mais compacta e mobile-friendly.

## Ajustes feitos em `comprar.html`
- Header mais compacto.
- Sem bandeirinhas/decorativos exagerados.
- O formulário aparece mais rápido no celular.
- O resumo da compra fica antes do botão de pagamento.
- O resumo não fica solto depois do botão.
- Campos e botão ajustados para celular.
- Mensagem de desconto com linguagem comercial.
- Dados do formulário são salvos no aparelho via `localStorage`.
- Ao voltar da InfinitePay, o botão destrava e os dados são restaurados.

## O que NÃO foi alterado
- `api/criar-pagamento.js`
- `api/webhook-infinitepay.js`
- `api/verificar-pagamento.js`
- `obrigado.html`
- `index.html`
- `package.json`

## Observação
Se o usuário voltar do checkout para alterar quantidade ou trocar Pix por cartão, a página deve reabilitar o botão e recuperar os dados preenchidos.
