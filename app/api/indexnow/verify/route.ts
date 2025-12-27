import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Verify domain ownership by checking if the IndexNow key file exists
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
    const { projectId, domain } = body

    if (!projectId || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, domain' },
        { status: 400 }
      )
    }

    // Get project and verify ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, indexnow_key, domain')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    if (!project.indexnow_key) {
      return NextResponse.json(
        { error: 'IndexNow key not generated. Please try again.' },
        { status: 500 }
      )
    }

    // Clean domain URL
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const verificationUrl = `https://${cleanDomain}/${project.indexnow_key}.txt`

    console.log('Verifying IndexNow key at:', verificationUrl)

    // Attempt to fetch the key file from user's domain
    try {
      const response = await fetch(verificationUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'DexAI-IndexNow-Verifier/1.0',
        },
        // Short timeout
        signal: AbortSignal.timeout(10000), // 10 seconds
      })

      if (!response.ok) {
        return NextResponse.json(
          { 
            error: 'Verification failed',
            details: `File not found at ${verificationUrl}. Please make sure the file is uploaded to your domain root.`,
            status: response.status 
          },
          { status: 400 }
        )
      }

      const content = await response.text()
      const expectedKey = project.indexnow_key.trim()
      const actualKey = content.trim()

      if (actualKey !== expectedKey) {
        return NextResponse.json(
          { 
            error: 'Verification failed',
            details: `Key mismatch. Expected: ${expectedKey}, but got: ${actualKey}` 
          },
          { status: 400 }
        )
      }

      // Success! Update project
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          indexnow_enabled: true,
          indexnow_verified_at: new Date().toISOString(),
          domain: `https://${cleanDomain}` // Store verified domain
        })
        .eq('id', projectId)

      if (updateError) {
        console.error('Failed to update project:', updateError)
        return NextResponse.json(
          { error: 'Failed to save verification status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Domain verified successfully! IndexNow is now enabled.',
        verifiedAt: new Date().toISOString()
      })

    } catch (fetchError) {
      console.error('Verification fetch error:', fetchError)
      return NextResponse.json(
        { 
          error: 'Verification failed',
          details: fetchError instanceof Error ? fetchError.message : 'Unable to reach your domain. Please check the URL and try again.' 
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Verify API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
