import { randomUUID } from 'crypto'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'

export function getPreApprovalClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) throw new Error('MP_ACCESS_TOKEN não configurado.')
  return new PreApproval(new MercadoPagoConfig({ accessToken }))
}

export const mercadoPagoAmounts = {
  monthly: Number(process.env.MP_MONTHLY_AMOUNT || '39.9'),
  yearly: Number(process.env.MP_YEARLY_AMOUNT || '297'),
}

export async function createMercadoPagoSubscription(body: Record<string, unknown>) {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) throw new Error('MP_ACCESS_TOKEN não configurado.')

  const idempotencyKey = randomUUID()
  let response: Response | undefined
  let data: any = {}
  let rawText = ''

  // Log do payload enviado (sem expor dados sensíveis completos)
  console.log('[MP] Enviando preapproval. Idempotency-Key:', idempotencyKey)
  console.log('[MP] Payload:', JSON.stringify({
    ...body,
    card_token_id: body.card_token_id ? '***' : undefined,
  }))

  for (let attempt = 1; attempt <= 3; attempt++) {
    response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
        ...(accessToken.startsWith('TEST-') ? { 'X-scope': 'stage' } : {}),
      },
      body: JSON.stringify(body),
    })

    rawText = await response.clone().text()
    console.log(
      `[MP] Tentativa ${attempt} — status: ${response.status}, content-type: ${response.headers.get('content-type')}, request-id: ${response.headers.get('x-request-id')}`
    )
    console.log('[MP] Raw body:', rawText)

    data = await response.json().catch(() => ({}))
    if (response.ok) return data

    if (![502, 503, 504].includes(response.status) || attempt === 3) break
    await new Promise(resolve => setTimeout(resolve, attempt * 750))
  }

  const cause = Array.isArray(data.cause) ? data.cause[0]?.description : undefined
  const requestId = response?.headers.get('x-request-id')
  throw new Error(
    cause ||
      data.message ||
      `Mercado Pago retornou HTTP ${response?.status || 500}${requestId ? ` (request-id: ${requestId})` : ''}. Raw: ${rawText.slice(0, 300)}`
  )
}