import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-12-15.clover',
    })
    
    const { invoiceId } = await request.json()
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No customer found' }, { status: 404 })
    }

    // Verify invoice belongs to this customer
    const invoice = await stripe.invoices.retrieve(invoiceId)
    
    if (invoice.customer !== profile.stripe_customer_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Void the old invoice and create a new one with updated details
    if (invoice.status === 'paid') {
      // Get customer with updated details
      const customer = await stripe.customers.retrieve(profile.stripe_customer_id)
      
      // Create a credit note for the old invoice
      await stripe.creditNotes.create({
        invoice: invoiceId,
        lines: invoice.lines.data.map(line => ({
          type: 'invoice_line_item',
          invoice_line_item: line.id,
          quantity: line.quantity || 1,
        })),
        memo: 'Korekta danych fakturowych',
      })

      // The subscription will generate a new invoice with current customer details
      return NextResponse.json({ 
        success: true,
        message: 'Utworzono notę kredytową. Nowa faktura zostanie wygenerowana przy następnej płatności.'
      })
    }

    return NextResponse.json({ 
      error: 'Invoice cannot be corrected' 
    }, { status: 400 })
  } catch (error) {
    console.error('Error correcting invoice:', error)
    return NextResponse.json(
      { error: 'Failed to correct invoice' },
      { status: 500 }
    )
  }
}
