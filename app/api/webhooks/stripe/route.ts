import { stripe } from "../../../../lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`❌ Erro de Assinatura: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;
  console.log("🔔 Evento Recebido:", event.type);

  try {
    switch (event.type) {
      // EVENTO PRINCIPAL: Ocorre quando o usuário termina o checkout com sucesso
      case "checkout.session.completed":
        const userId = session.metadata?.supabase_user_id;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0].price.id;
          
          // Defina aqui os IDs reais do seu dashboard para diferenciar os planos
          const planType = priceId === "price_ID_ANUAL_AQUI" ? "ultimate" : "pro";

          console.log(`🚀 Ativando plano ${planType} para o usuário: ${userId}`);

          const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({
              stripe_customer_id: session.customer as string,
              subscription_status: subscription.status, // Será 'trialing'
              plan_type: planType,
            })
            .eq("id", userId);

          if (updateError) throw updateError;
          console.log("✅ Banco de dados atualizado!");
        }
        break;

      // EVENTO DE ATUALIZAÇÃO: Ocorre quando o trial vira 'active' ou muda o status
      case "customer.subscription.updated":
        const updatedSub = event.data.object as any;
        console.log("🔄 Assinatura atualizada:", updatedSub.status);
        
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: updatedSub.status,
          })
          .eq("stripe_customer_id", updatedSub.customer as string);
        break;

      // EVENTO DE CANCELAMENTO: Ocorre quando o usuário cancela ou o pagamento falha
      case "customer.subscription.deleted":
        console.log("❌ Assinatura removida");
        await supabaseAdmin
          .from("profiles")
          .update({ 
            subscription_status: "canceled", 
            plan_type: "free" 
          })
          .eq("stripe_customer_id", session.customer as string);
        break;

      default:
        console.log(`🟡 Evento ignorado: ${event.type}`);
    }

    return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: any) {
    console.error("❌ Erro interno no Webhook:", error.message);
    return new NextResponse(`Erro Interno: ${error.message}`, { status: 500 });
  }
}