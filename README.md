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


## Ajustes da versão 4

- Ações da lista foram compactadas:
  - botão principal: Dar baixa, Editar ou Verificar pagamento;
  - demais opções ficam em `Mais ações`.
- Tentativas aguardando pagamento podem ser consultadas pelo filtro.
- Em tentativas aguardando pagamento, há botão `Verificar pagamento`.
- Se o pagamento caiu na InfinitePay, mas webhook/retorno não atualizou, use `Mais ações > Confirmar pagamento manualmente` após conferir no app.


## Ajustes da versão 5

- Página de compra agora coleta e-mail obrigatório.
- WhatsApp também ficou obrigatório.
- Backend envia `customer` para a InfinitePay com:
  - `name`
  - `email`
  - `phone_number`
- Não enviamos `address`.
- O checkout voltou a enviar 1 item com o valor total, modelo mais simples/estável.
- Quantidade, desconto e total continuam salvos corretamente no Firebase.
- E-mail agora aparece no controle e no relatório CSV.


## Ajustes da versão 6

- `redirect_url` agora leva `order_nsu` já fixo na URL de obrigado.
- A página de compra salva o último `order_nsu` no navegador antes de redirecionar para a InfinitePay.
- A página `obrigado.html` tenta confirmar o pagamento automaticamente várias vezes.
- A página `obrigado.html` tem botão `Verificar novamente`.
- A verificação de pagamento ficou mais conservadora: só marca como pago quando `paid === true` ou status equivalente aprovado/pago.
- Isso melhora a chance de confirmação quando a InfinitePay demora para retornar ou quando volta sem todos os parâmetros.


## Ajustes da versão 7

- Checkout voltou a amarrar a descrição completa do produto no payload:
  - São João da Fé 2026
  - quantidade de ingressos
  - nome do aluno
  - turma
- Mantém `customer` com nome, e-mail e telefone para pré-preenchimento.
- Não envia endereço.
- Mantém item único com valor total, modelo mais simples que funcionou melhor no primeiro teste.
- Salva `payloadResumoInfinitePay` no Firestore para auditoria do que foi enviado para a InfinitePay.
- Mantém reforço de confirmação da V6.
