import { NextRequest, NextResponse } from 'next/server'
import { getAllStaff, createStaff } from '@/lib/services/staffService'

export async function GET() {
  try {
    const staff = await getAllStaff()
    return NextResponse.json(staff)
  } catch (error: unknown) {
    console.error('GET /api/staff error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
   console.log('🔥 POST /api/staff - HIT!')
  try {
    const body = await req.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))
    
    console.log('🚀 Calling createStaff...')
    const result = await createStaff(body, null)
    console.log('✅ createStaff result:', result)
    
    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    console.error('💥 POST /api/staff CRASHED!')
    console.error('❌ Full error:', error)
    console.error('❌ Error type:', typeof error)
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error))
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    if (error instanceof Error) {
      const isDuplicate = error.message?.includes('unique') || error.message?.includes('nic')
      return NextResponse.json(
        { error: isDuplicate ? 'NIC already registered.' : error.message },
        { status: isDuplicate ? 409 : 500 }
      )
    }
    return NextResponse.json({ error: 'An unknown error occurred', details: String(error) }, { status: 500 })
  }
}