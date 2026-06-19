# São João da Fé 2026 — Pacote 06

## Base
Este pacote parte do Pacote 03, validado com pagamento funcionando.

## Objetivo
Proteger o painel da secretaria usando Firebase Authentication com e-mail e senha.

## O que mudou
Apenas o painel da secretaria (`index.html`) foi alterado.

Agora o acesso ao painel usa:
- e-mail;
- senha;
- Firebase Authentication.

## O que NÃO foi alterado
O motor de pagamento não foi mexido:

- `comprar.html`
- `obrigado.html`
- `api/criar-pagamento.js`
- `api/webhook-infinitepay.js`
- `api/verificar-pagamento.js`
- `package.json`

## Passo 1 — ativar login no Firebase

No Firebase Console:

1. Vá em `Authentication`
2. Vá em `Sign-in method`
3. Ative `Email/Password`
4. Vá em `Users`
5. Clique em `Add user`
6. Crie o e-mail e senha da secretaria

Exemplo:
- Email: `secretaria@seudominio.com.br`
- Senha: uma senha forte que será entregue apenas para a secretaria

## Passo 2 — subir este pacote

Suba os arquivos no GitHub mantendo a estrutura:

- `index.html`
- `comprar.html`
- `obrigado.html`
- `package.json`
- `api/criar-pagamento.js`
- `api/webhook-infinitepay.js`
- `api/verificar-pagamento.js`

Depois faça redeploy na Vercel.

## Passo 3 — testar login

Abra:

`https://saojoao26.vercel.app/`

Teste o login com o e-mail e senha criados no Firebase Authentication.

## Passo 4 — fechar regras do Firestore

Só faça isso depois de confirmar que o login funcionou.

No Firestore Rules, use:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /sao_joao_fe_2026_pedidos/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Com isso, apenas usuário autenticado consegue ler e alterar os pedidos pelo painel.

## Observação importante

O backend da Vercel continua conseguindo criar pedidos e confirmar pagamentos, porque usa Firebase Admin SDK.
Essas regras bloqueiam apenas acesso direto pelo navegador sem login.
