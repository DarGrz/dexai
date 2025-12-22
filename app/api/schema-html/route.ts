import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return new NextResponse('<!-- Brak parametru projectId -->', {
      headers: { 'Content-Type': 'text/html' },
    })
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

  if (error || !schemas || schemas.length === 0) {
    return new NextResponse('<!-- Brak aktywnych schematów -->', {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  }

  // Generate HTML with JSON-LD scripts
  const htmlScripts = schemas
    .map(schema => {
      const jsonString = JSON.stringify(schema.json, null, 2)
      return `<script type="application/ld+json">\n${jsonString}\n</script>`
    })
    .join('\n')

  return new NextResponse(htmlScripts, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
