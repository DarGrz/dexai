import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json(
      { error: 'Brak parametru projectId' },
      { status: 400 }
    )
  }

  // Use service role client for public API access
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Fetch enabled schemas for this project
  const { data: schemas, error } = await supabase
    .from('schemas')
    .select('*')
    .eq('project_id', projectId)
    .eq('enabled', true)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Błąd pobierania danych' },
      { status: 500 }
    )
  }

  // Return JSON-LD schemas
  const jsonLdSchemas = schemas?.map(schema => schema.json) || []

  return NextResponse.json(jsonLdSchemas, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
