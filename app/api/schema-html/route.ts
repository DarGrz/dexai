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

  // Generate HTML with JSON-LD scripts and Open Graph meta tags
  const htmlParts = schemas
    .map(schema => {
      // If it's an OpenGraph schema, generate meta tags
      if (schema.type === 'OpenGraph') {
        const og = schema.json
        const metaTags: string[] = []
        
        // Open Graph tags
        if (og.og_title) metaTags.push(`<meta property="og:title" content="${escapeHtml(og.og_title)}" />`)
        if (og.og_description) metaTags.push(`<meta property="og:description" content="${escapeHtml(og.og_description)}" />`)
        if (og.og_image) metaTags.push(`<meta property="og:image" content="${escapeHtml(og.og_image)}" />`)
        if (og.og_url) metaTags.push(`<meta property="og:url" content="${escapeHtml(og.og_url)}" />`)
        if (og.og_type) metaTags.push(`<meta property="og:type" content="${escapeHtml(og.og_type)}" />`)
        if (og.og_site_name) metaTags.push(`<meta property="og:site_name" content="${escapeHtml(og.og_site_name)}" />`)
        if (og.og_locale) metaTags.push(`<meta property="og:locale" content="${escapeHtml(og.og_locale)}" />`)
        
        // Twitter Card tags
        if (og.twitter_card) metaTags.push(`<meta name="twitter:card" content="${escapeHtml(og.twitter_card)}" />`)
        if (og.twitter_title) metaTags.push(`<meta name="twitter:title" content="${escapeHtml(og.twitter_title)}" />`)
        if (og.twitter_description) metaTags.push(`<meta name="twitter:description" content="${escapeHtml(og.twitter_description)}" />`)
        if (og.twitter_image) metaTags.push(`<meta name="twitter:image" content="${escapeHtml(og.twitter_image)}" />`)
        if (og.twitter_site) metaTags.push(`<meta name="twitter:site" content="${escapeHtml(og.twitter_site)}" />`)
        
        return metaTags.join('\n')
      } else {
        // Regular JSON-LD schema
        const jsonString = JSON.stringify(schema.json, null, 2)
        return `<script type="application/ld+json">\n${jsonString}\n</script>`
      }
    })
    .join('\n')

  return new NextResponse(htmlParts, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}
