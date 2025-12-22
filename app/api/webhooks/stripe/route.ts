import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id

      console.log('Checkout session completed:', { userId, subscription: session.subscription })

      if (userId && session.subscription) {
        // Pobierz szczegóły klienta z adresem
        const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer
        
        const updateData: any = {
          subscription_status: 'active',
          stripe_subscription_id: session.subscription as string,
          updated_at: new Date().toISOString(),
        }

        // Zapisz dane fakturowe jeśli istnieją
        if (customer.address) {
          updateData.billing_name = customer.name || null
          updateData.billing_address_line1 = customer.address.line1 || null
          updateData.billing_address_line2 = customer.address.line2 || null
          updateData.billing_city = customer.address.city || null
          updateData.billing_postal_code = customer.address.postal_code || null
          updateData.billing_country = customer.address.country || null
        }

        // Zapisz NIP jeśli istnieje
        if (customer.tax_ids) {
          const taxIds = await stripe.customers.listTaxIds(customer.id)
          if (taxIds.data.length > 0) {
            updateData.billing_tax_id = `${taxIds.data[0].type}: ${taxIds.data[0].value}`
          }
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('id', userId)

        if (error) {
          console.error('Error updating user profile:', error)
        } else {
          console.log('Successfully updated user profile with billing data:', data)
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Find user by customer ID
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile) {
        const status = subscription.status === 'active' ? 'active' : 
                      subscription.status === 'past_due' ? 'past_due' :
                      subscription.status === 'canceled' ? 'canceled' : 'inactive'

        const { error } = await supabase
          .from('user_profiles')
          .update({
            subscription_status: status,
            subscription_end_date: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)

        if (error) {
          console.error('Error updating subscription:', error)
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile) {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)

        if (error) {
          console.error('Error canceling subscription:', error)
        }
      }
      break
    }

    case 'invoice.created': {
      const invoice = event.data.object as Stripe.Invoice
      
      // Jeśli to faktura subskrypcyjna, dodaj informacje o okresie
      if ((invoice as any).subscription && invoice.lines.data.length > 0) {
        const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
        
        // Dodaj opis z okresem subskrypcji do pierwszej linii
        const line = invoice.lines.data[0]
        const periodStart = new Date((line.period as any)?.start * 1000 || (subscription as any).current_period_start * 1000)
        const periodEnd = new Date((line.period as any)?.end * 1000 || (subscription as any).current_period_end * 1000)
        
        const periodDescription = `Okres subskrypcji: ${periodStart.toLocaleDateString('pl-PL')} - ${periodEnd.toLocaleDateString('pl-PL')}`
        
        // Zaktualizuj linię faktury z opisem okresu
        await stripe.invoiceItems.update(line.id, {
          description: `${line.description}\n${periodDescription}`,
        })
        
        console.log('Updated invoice with period:', periodDescription)
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
