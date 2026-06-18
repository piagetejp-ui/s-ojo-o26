# São João da Fé 2026 - Sistema integrado

Arquivos:

- `index.html`: controle interno da secretaria
- `comprar.html`: página pública de venda
- `obrigado.html`: retorno após pagamento
- `api/criar-pagamento.js`: cria pedido no Firebase e gera link InfinitePay
- `api/webhook-infinitepay.js`: recebe confirmação automática da InfinitePay
- `api/verificar-pagamento.js`: confirma pagamento quando o cliente retorna ao site
- `package.json`: dependência do Firebase Admin

## Variáveis de ambiente no Vercel

Configure em Project Settings > Environment Variables:

```txt
INFINITEPAY_HANDLE=piaget
PUBLIC_BASE_URL=https://saojoao26.vercel.app
FIREBASE_PROJECT_ID=saojoao26-fc92c
FIREBASE_CLIENT_EMAIL=cole_aqui_o_client_email_da_service_account
FIREBASE_PRIVATE_KEY=cole_aqui_a_private_key_da_service_account
PRECO_INGRESSO=35
DESCONTO_APOS_QTD=4
DESCONTO_EXTRA_POR_INGRESSO=5
```

A `FIREBASE_PRIVATE_KEY` deve ser copiada do JSON da Service Account. Se o Vercel pedir uma linha só, mantenha os `\n` como aparecem no JSON.

## Rotas

- Secretaria: `https://saojoao26.vercel.app/`
- Venda pública: `https://saojoao26.vercel.app/comprar.html`
- Webhook InfinitePay: `https://saojoao26.vercel.app/api/webhook-infinitepay`

## Teste

1. Publique o projeto no Vercel.
2. Abra `/comprar.html`.
3. Faça um pedido de teste.
4. Confira se ele aparece no `index.html` como `Aguardando pagamento`.
5. Depois de pagar, o webhook ou a página de obrigado deve atualizar para `Pago`.


## Ajustes da versão 2

- Tentativas de pagamento não aparecem na secretaria e não entram nos totais.
- O pedido só aparece no controle quando o pagamento estiver confirmado como Pago/Aprovado/Confirmado.
- A página de compra continua criando o pedido como Aguardando pagamento, mas ele fica oculto no painel.
- O backend não envia `customer` nem `address` para a InfinitePay, para tentar reduzir campos extras no checkout.
- Os itens agora são enviados com quantidade e preço unitário, separando ingressos com preço cheio e ingressos com desconto.


## Ajustes da versão 3

- Botão `Devolver` para marcar pedido como devolvido/cancelado no controle.
- Pedido devolvido não conta como ingresso vendido, não conta como pendente e não conta como entregue.
- Botão `Excluir` para apagar definitivamente pedidos de teste ou lançamentos errados.
- Exclusão exige digitar `EXCLUIR`.
- Filtro `Devolvidos` para consultar pedidos devolvidos.
- Filtro `Tentativas aguardando pagamento` para localizar tentativas não concluídas.
- Atenção: marcar como devolvido no sistema não estorna automaticamente a InfinitePay; o estorno financeiro deve ser feito pelo app/painel da InfinitePay.
