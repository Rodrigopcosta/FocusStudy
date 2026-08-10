import { PlanType, Prisma, SubscriptionStatus } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const paidPlanTypes = [
  PlanType.PRO_MONTHLY,
  PlanType.PRO_ANNUAL,
  PlanType.PREMIUM,
] as const

export type PaidPlanType = (typeof paidPlanTypes)[number]

export interface AuthorizedPlanUser {
  userId: string
  planType: PaidPlanType
  subscriptionStatus: SubscriptionStatus
}

export class PlanAccessError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string
  ) {
    super(message)
    this.name = 'PlanAccessError'
  }
}

/**
 * Requires an authenticated user with an active paid plan.
 * Call this before executing any PRO/AI API logic.
 */
export async function requirePaidPlan(): Promise<AuthorizedPlanUser> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new PlanAccessError(401, 'Não autorizado.')
  }

  let profile
  try {
    profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: {
        planType: true,
        subscriptionStatus: true,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error(`Não foi possível consultar o plano do usuário: ${error.message}`)
    }
    throw error
  }

  if (!profile || !paidPlanTypes.includes(profile.planType as PaidPlanType)) {
    throw new PlanAccessError(403, 'Recurso exclusivo para planos pagos.')
  }

  const activeStatuses: SubscriptionStatus[] = [
    SubscriptionStatus.AUTHORIZED,
    SubscriptionStatus.ACTIVE,
  ]

  if (!activeStatuses.includes(profile.subscriptionStatus)) {
    throw new PlanAccessError(403, 'Sua assinatura não está ativa.')
  }

  return {
    userId: user.id,
    planType: profile.planType as PaidPlanType,
    subscriptionStatus: profile.subscriptionStatus,
  }
}

/** Converts a plan error into a NextResponse-compatible JSON payload. */
export function planAccessResponse(error: unknown) {
  if (error instanceof PlanAccessError) {
    return Response.json({ error: error.message }, { status: error.status })
  }

  return Response.json(
    { error: 'Não foi possível validar a assinatura.' },
    { status: 500 }
  )
}
