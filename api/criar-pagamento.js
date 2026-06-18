const admin = require("firebase-admin");

const COLLECTION = "sao_joao_fe_2026_pedidos";

function initFirebase() {
  if (admin.apps.length) return admin.firestore();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Variáveis Firebase ausentes.");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
    })
  });

  return admin.firestore();
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function normalizePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return `+${digits}`;
  return `+55${digits}`;
}

function moneyToCents(value) {
  return Math.round(Number(value || 0) * 100);
}

function calculate(qtd) {
  const quantidade = Math.max(1, Math.floor(Number(qtd) || 1));
  const preco = Number(process.env.PRECO_INGRESSO || 35);
  const descontoAposQtd = Number(process.env.DESCONTO_APOS_QTD || 4);
  const descontoExtra = Number(process.env.DESCONTO_EXTRA_POR_INGRESSO || 5);

  const subtotal = quantidade * preco;
  const descontoAutomatico = Math.max(0, quantidade - descontoAposQtd) * descontoExtra;
  const total = Math.max(0, subtotal - descontoAutomatico);

  return {
    quantidade,
    preco,
    subtotal,
    descontoAutomatico,
    total,
    totalCentavos: moneyToCents(total)
  };
}

function makeOrderNsu() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const id = `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-${Math.floor(Math.random()*900 + 100)}`;
  return `SJ26-${id}`;
}

function getBaseUrl(req) {
  return (process.env.PUBLIC_BASE_URL || `https://${req.headers.host}`).replace(/\/$/, "");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Método não permitido." });
  }

  try {
    const db = initFirebase();
    const body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");

    const comprador = String(body.comprador || "").trim();
    const whatsapp = String(body.whatsapp || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const cep = String(body.cep || "").replace(/\D/g, "");
    const rua = String(body.rua || "").trim();
    const bairro = String(body.bairro || "").trim();
    const numero = String(body.numero || "").trim();
    const complemento = String(body.complemento || "").trim();
    const aluno = String(body.aluno || "").trim();
    const turma = String(body.turma || "").trim();
    const quantidade = Math.max(1, Math.floor(Number(body.quantidade) || 1));

    if (!comprador || !whatsapp || !email || !aluno || !turma) {
      return json(res, 400, { error: "Informe comprador, WhatsApp, e-mail, aluno e turma." });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return json(res, 400, { error: "Informe um e-mail válido." });
    }

    if (!cep || cep.length !== 8 || !rua || !bairro || !numero) {
      return json(res, 400, { error: "Informe endereço completo: CEP, rua, bairro e número." });
    }

    const handle = process.env.INFINITEPAY_HANDLE || "piaget";
    const baseUrl = getBaseUrl(req);
    const orderNsu = makeOrderNsu();
    const calc = calculate(quantidade);
    const agora = new Date().toISOString();

    const pedido = {
      idPedido: orderNsu,
      comprador,
      whatsapp,
      email,
      endereco: {
        cep,
        street: rua,
        neighborhood: bairro,
        number: numero,
        complement: complemento
      },
      aluno,
      turma,
      dataCompra: agora,
      produto: "São João da Fé 2026",
      quantidade: calc.quantidade,
      valorUnitario: calc.preco,
      subtotal: calc.subtotal,
      descontoAutomatico: calc.descontoAutomatico,
      descontoAdicional: 0,
      total: calc.total,
      formaRecebimento: "InfinitePay Checkout",
      statusPagamento: "Aguardando pagamento",
      statusEntrega: "Pendente",
      entreguePara: "",
      entreguePor: "",
      dataEntrega: "",
      observacao: "",
      origem: "Checkout Escola",
      criadoEm: agora,
      atualizadoEm: agora,
      historico: [{
        tipo: "pedido_criado_checkout",
        data: agora,
        total: calc.total,
        quantidade: calc.quantidade
      }]
    };

    await db.collection(COLLECTION).doc(orderNsu).set(pedido);

    const payloadInfinite = {
      handle,
      order_nsu: orderNsu,
      redirect_url: `${baseUrl}/obrigado.html`,
      webhook_url: `${baseUrl}/api/webhook-infinitepay`,
      items: [
        {
          quantity: 1,
          price: calc.totalCentavos,
          description: `São João da Fé 2026 - ${calc.quantidade} ingresso(s) - ${aluno} - ${turma}`
        }
      ]
    };

    const phone = normalizePhone(whatsapp);
    if (phone) {
      payloadInfinite.customer = {
        name: comprador,
        phone_number: phone
      };
    } else {
      payloadInfinite.customer = {
        name: comprador
      };
    }

    await db.collection(COLLECTION).doc(orderNsu).set({
      payloadResumoInfinitePay: {
        handle,
        order_nsu: orderNsu,
        redirect_url: payloadInfinite.redirect_url,
        webhook_url: payloadInfinite.webhook_url,
        items: payloadInfinite.items || [],
        customer: {
          name: payloadInfinite.customer?.name || "",
          phone_number: payloadInfinite.customer?.phone_number || ""
        },
        address: payloadInfinite.address || null
      },
      atualizadoEm: new Date().toISOString()
    }, { merge: true });

    const response = await fetch("https://api.checkout.infinitepay.io/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadInfinite)
    });

    const text = await response.text();
    let data = {};
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!response.ok) {
      await db.collection(COLLECTION).doc(orderNsu).set({
        statusPagamento: "Erro ao gerar link",
        erroInfinitePay: data,
        atualizadoEm: new Date().toISOString()
      }, { merge: true });

      return json(res, 502, {
        error: "A InfinitePay não conseguiu gerar o link.",
        details: data
      });
    }

    const checkoutUrl =
      data.checkout_url ||
      data.url ||
      data.link ||
      data.payment_url ||
      data.redirect_url ||
      (data.data && (data.data.checkout_url || data.data.url || data.data.link || data.data.payment_url));

    if (!checkoutUrl) {
      await db.collection(COLLECTION).doc(orderNsu).set({
        statusPagamento: "Link gerado sem URL identificada",
        respostaInfinitePay: data,
        atualizadoEm: new Date().toISOString()
      }, { merge: true });

      return json(res, 502, {
        error: "Resposta da InfinitePay não trouxe uma URL de checkout identificável.",
        details: data
      });
    }

    await db.collection(COLLECTION).doc(orderNsu).set({
      checkoutUrl,
      respostaCriacaoLink: data,
      atualizadoEm: new Date().toISOString()
    }, { merge: true });

    return json(res, 200, {
      ok: true,
      order_nsu: orderNsu,
      checkout_url: checkoutUrl,
      total: calc.total,
      total_centavos: calc.totalCentavos
    });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: error.message || "Erro interno." });
  }
};
