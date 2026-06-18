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

    const orderNsu = String(body.order_nsu || body.orderNsu || "").trim();

    if (!orderNsu) {
      return json(res, 400, { error: "order_nsu ausente." });
    }

    const agora = new Date().toISOString();

    await db.collection(COLLECTION).doc(orderNsu).set({
      statusPagamento: "Pago",
      statusEntrega: "Pendente",
      pagamentoConfirmadoEm: agora,
      transactionNsu: body.transaction_nsu || "",
      invoiceSlug: body.invoice_slug || body.slug || "",
      captureMethod: body.capture_method || "",
      amountCentavos: body.amount || null,
      paidAmountCentavos: body.paid_amount || null,
      receiptUrl: body.receipt_url || "",
      webhookRecebidoEm: agora,
      webhookPayload: body,
      atualizadoEm: agora,
      historico: admin.firestore.FieldValue.arrayUnion({
        tipo: "pagamento_confirmado_webhook",
        data: agora,
        transactionNsu: body.transaction_nsu || "",
        captureMethod: body.capture_method || "",
        paidAmountCentavos: body.paid_amount || null
      })
    }, { merge: true });

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error(error);
    return json(res, 400, { error: error.message || "Erro ao processar webhook." });
  }
};
