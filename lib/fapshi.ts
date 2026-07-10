import "server-only";

const FAPSHI_BASE_URL =
  process.env.FAPSHI_ENV === "live"
    ? "https://live.fapshi.com"
    : "https://sandbox.fapshi.com";

function fapshiHeaders() {
  const apiUser = process.env.FAPSHI_API_USER;
  const apiKey = process.env.FAPSHI_API_KEY;
  if (!apiUser || !apiKey) {
    throw new Error("FAPSHI_API_USER / FAPSHI_API_KEY manquants dans .env.local");
  }
  return {
    "Content-Type": "application/json",
    apiuser: apiUser,
    apikey: apiKey,
  };
}

export interface InitiatePayParams {
  amount: number;
  externalId: string;
  redirectUrl: string;
  message?: string;
  email?: string;
}

export interface InitiatePayResponse {
  message: string;
  link: string;
  transId: string;
  dateInitiated: string;
}

/**
 * Crée un lien de paiement hébergé par Fapshi (checkout). L'utilisateur est
 * redirigé vers ce lien, paie par Mobile Money/OM, puis revient sur redirectUrl.
 * Doc: https://docs.fapshi.com/en/api-reference/endpoint/initiate-pay
 */
export async function initiatePay(params: InitiatePayParams): Promise<InitiatePayResponse> {
  const res = await fetch(`${FAPSHI_BASE_URL}/initiate-pay`, {
    method: "POST",
    headers: fapshiHeaders(),
    body: JSON.stringify({
      amount: params.amount,
      externalId: params.externalId,
      redirectUrl: params.redirectUrl,
      message: params.message ?? "Achat de votes",
      ...(params.email ? { email: params.email } : {}),
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fapshi initiate-pay a échoué (${res.status}): ${body}`);
  }

  return res.json();
}

export interface FapshiPaymentStatus {
  transId: string;
  status: "CREATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "EXPIRED";
  amount: number;
  externalId?: string;
  financialTransId?: string;
  dateInitiated?: string;
  dateConfirmed?: string;
}

/**
 * Vérifie le statut d'une transaction par son transId.
 * Utile en secours si le webhook n'a pas encore été reçu.
 * Doc: https://docs.fapshi.com/en/api-reference/endpoint/payment-status
 */
export async function getPaymentStatus(transId: string): Promise<FapshiPaymentStatus> {
  const res = await fetch(`${FAPSHI_BASE_URL}/payment-status/${transId}`, {
    method: "GET",
    headers: fapshiHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fapshi payment-status a échoué (${res.status}): ${body}`);
  }

  return res.json();
}
