import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json(
      { error: 'Brak parametru projectId' },
      { status: 400 }
    )
  }

  // Rate limiting - IP based
  const clientIP = getClientIP(request)
  const ipLimitPerMin = checkRateLimit(clientIP, RATE_LIMITS.PUBLIC_PER_MINUTE.limit, RATE_LIMITS.PUBLIC_PER_MINUTE.window)
  
  if (!ipLimitPerMin.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMITS.PUBLIC_PER_MINUTE.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(ipLimitPerMin.resetAt / 1000)),
          'Retry-After': String(Math.ceil((ipLimitPerMin.resetAt - Date.now()) / 1000)),
        }
      }
    )
  }

  // Rate limiting - Project based
  const projectLimit = checkRateLimit(projectId, RATE_LIMITS.PROJECT_PER_DAY.limit, RATE_LIMITS.PROJECT_PER_DAY.window, 'project')
  
  if (!projectLimit.allowed) {
    return NextResponse.json(
      { error: 'Project rate limit exceeded. Contact support if you need higher limits.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMITS.PROJECT_PER_DAY.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(projectLimit.resetAt / 1000)),
        }
      }
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

  // Fetch enabled schemas for this project through pages
  const { data: schemas, error } = await supabase
    .from('schemas')
    .select(`
      *,
      page:pages!inner(project_id)
    `)
    .eq('page.project_id', projectId)
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
      'X-RateLimit-Limit': String(RATE_LIMITS.PUBLIC_PER_MINUTE.limit),
      'X-RateLimit-Remaining': String(ipLimitPerMin.remaining),
      'X-RateLimit-Reset': String(Math.ceil(ipLimitPerMin.resetAt / 1000)),
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
