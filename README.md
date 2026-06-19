# São João da Fé 2026 — Pacote 03

## Base
Este pacote parte do Pacote 02.

## Objetivo
Enviar também o e-mail para a InfinitePay, mantendo o restante do checkout igual.

## Alteração feita
Apenas `api/criar-pagamento.js` foi alterado para incluir no payload da InfinitePay:

- `customer.name`
- `customer.email`
- `customer.phone_number`

## O que foi mantido
- `redirect_url` igual
- `webhook_url` igual
- item único com valor total
- sem `address`
- `comprar.html` igual ao Pacote 02
- `index.html` igual ao Pacote 02
- `obrigado.html` igual
- `api/webhook-infinitepay.js` igual
- `api/verificar-pagamento.js` igual

## Risco conhecido
Se o checkout parar de reconhecer o Pix automaticamente, já sabemos que a variável nova foi o envio de `customer.email` para a InfinitePay.
