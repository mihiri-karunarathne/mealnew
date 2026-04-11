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
  try {
    const body = await req.json()
    // TODO: replace 'ADMIN01' with session.user.id from NextAuth
    const result = await createStaff(body, 'ADMIN01')
    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error) {
      const isDuplicate = error.message?.includes('unique') || error.message?.includes('nic')
      return NextResponse.json(
        { error: isDuplicate ? 'NIC already registered.' : error.message },
        { status: isDuplicate ? 409 : 500 }
      )
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 })
  }
}