import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    console.log('🔍 LOGIN ATTEMPT:', { email, passwordLength: password?.length })

    if (!email || !password) {
      console.log('❌ Missing credentials')
      return NextResponse.json({ error: 'Email and password required.' }, { status: 400 })
    }

    // Fetch admin
    console.log('🔍 Querying DB for:', email)
    const rows = await getDb()`
      SELECT admin_id, name, email, password_hash, role
      FROM admin WHERE email = ${email} LIMIT 1
    `
    
    const admin = rows[0]
    console.log('🔍 DB RESULT:', { 
      found: !!admin, 
      count: rows.length,
      adminId: admin?.admin_id,
      emailMatch: admin?.email === email,
      hashPreview: admin?.password_hash?.slice(0, 20)
    })

    if (!admin) {
      console.log('❌ No admin found in DB')
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    // Password check
    const passwordMatch = await bcrypt.compare(password, admin.password_hash)
    console.log('🔍 PASSWORD CHECK:', { 
      inputLength: password.length, 
      hashLength: admin.password_hash.length, 
      match: passwordMatch 
    })

    if (!passwordMatch) {
      console.log('❌ Passwords do not match')
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('de_session', JSON.stringify({
      id: admin.admin_id,
      name: admin.name,
      role: admin.role,
      initials: admin.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
    }), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
    })

    console.log('✅ LOGIN SUCCESS:', admin.admin_id)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('💥 LOGIN ERROR:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}