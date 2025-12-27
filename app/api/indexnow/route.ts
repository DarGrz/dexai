import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// IndexNow API endpoint for submitting URLs to Bing/AI search engines
// https://www.indexnow.org/documentation

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { projectId, urls, domain } = body

    if (!projectId || !urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, urls' },
        { status: 400 }
      )
    }

    if (!domain) {
      return NextResponse.json(
        { error: 'Missing domain parameter' },
        { status: 400 }
      )
    }

    // Get project and verify ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, indexnow_key, indexnow_enabled, indexnow_verified_at, domain')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    if (!project.indexnow_enabled) {
      return NextResponse.json(
        { error: 'IndexNow is not enabled for this project. Please verify your domain first.' },
        { status: 403 }
      )
    }

    if (!project.indexnow_key) {
      return NextResponse.json(
        { error: 'IndexNow key not found. Please regenerate the key.' },
        { status: 500 }
      )
    }

    // Verify domain hasn't changed
    if (!project.indexnow_verified_at) {
      return NextResponse.json(
        { error: 'Domain not verified. Please verify your domain first.' },
        { status: 403 }
      )
    }

    // Prepare IndexNow API request
    const indexNowPayload = {
      host: domain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      key: project.indexnow_key,
      keyLocation: `https://${domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}/${project.indexnow_key}.txt`,
      urlList: urls.map(url => {
        // Ensure absolute URLs
        if (url.startsWith('http')) return url
        const cleanDomain = domain.replace(/\/$/, '')
        const cleanUrl = url.startsWith('/') ? url : `/${url}`
        return `${cleanDomain}${cleanUrl}`
      })
    }

    console.log('Submitting to IndexNow:', indexNowPayload)

    // Submit to IndexNow API
    const indexNowResponse = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(indexNowPayload),
    })

    const responseCode = indexNowResponse.status
    let status: 'success' | 'failed' = 'success'
    let errorMessage: string | null = null

    // IndexNow returns 200 or 202 for success
    if (responseCode !== 200 && responseCode !== 202) {
      status = 'failed'
      const errorText = await indexNowResponse.text()
      errorMessage = `HTTP ${responseCode}: ${errorText}`
      console.error('IndexNow API error:', errorMessage)
    }

    // Log submission
    const { error: logError } = await supabase
      .from('indexnow_submissions')
      .insert({
        project_id: projectId,
        urls: indexNowPayload.urlList,
        status,
        response_code: responseCode,
        error_message: errorMessage,
      })

    if (logError) {
      console.error('Failed to log IndexNow submission:', logError)
    }

    // Update project last submitted timestamp
    await supabase
      .from('projects')
      .update({ indexnow_last_submitted_at: new Date().toISOString() })
      .eq('id', projectId)

    // Update last_indexed_at for pages/schemas (optional, could be done in background)
    if (status === 'success') {
      // Mark all pages as indexed
      await supabase
        .from('pages')
        .update({ last_indexed_at: new Date().toISOString() })
        .eq('project_id', projectId)
    }

    if (status === 'failed') {
      return NextResponse.json(
        { 
          error: 'IndexNow submission failed',
          details: errorMessage,
          responseCode 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      urlCount: indexNowPayload.urlList.length,
      status: responseCode,
      message: responseCode === 202 ? 'URLs queued for indexing' : 'URLs submitted successfully'
    })

  } catch (error) {
    console.error('IndexNow API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
