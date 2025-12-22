import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-12-15.clover',
    })
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse billing details from request
    const { billingDetails, isCompany } = await request.json()

    // Get or create user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Prepare customer data
    const customerName = isCompany 
      ? billingDetails.companyName 
      : `${billingDetails.firstName} ${billingDetails.lastName}`

    const customerData: any = {
      email: user.email!,
      name: customerName,
      address: {
        line1: billingDetails.addressLine1,
        line2: billingDetails.addressLine2 || undefined,
        city: billingDetails.city,
        postal_code: billingDetails.postalCode,
        country: billingDetails.country,
      },
      metadata: {
        supabase_user_id: user.id,
        first_name: billingDetails.firstName,
        last_name: billingDetails.lastName,
        is_company: isCompany ? 'true' : 'false',
      },
      preferred_locales: ['pl'],
    }

    if (billingDetails.phone) {
      customerData.phone = billingDetails.phone
    }

    // Create or update Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create(customerData)
      customerId = customer.id

      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    } else {
      // Update existing customer with new details
      await stripe.customers.update(customerId, customerData)
    }

    // Add Tax ID if provided
    if (isCompany && billingDetails.taxId) {
      try {
        // Remove existing tax IDs
        const existingTaxIds = await stripe.customers.listTaxIds(customerId)
        for (const taxId of existingTaxIds.data) {
          await stripe.customers.deleteTaxId(customerId, taxId.id)
        }

        // Add new tax ID
        await stripe.customers.createTaxId(customerId, {
          type: 'eu_vat',
          value: billingDetails.taxId,
        })
      } catch (error) {
        console.error('Error setting tax ID:', error)
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
        default_tax_rates: ['txr_1SgslsLs10TydPrLVk2aLROv'],
      },
      locale: 'pl',
      billing_address_collection: 'auto',
      customer_update: {
        address: 'never',
        name: 'never',
      },
    })

    console.log('Checkout session created:', { sessionId: session.id, userId: user.id })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
