import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    
    if (!decodedClaims.admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ 
      uid: decodedClaims.uid,
      admin: decodedClaims.admin,
    })
  } catch (error) {
    console.error('Error verifying admin session:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
} 