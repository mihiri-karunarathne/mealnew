import { NextRequest, NextResponse } from 'next/server'
import { getStaffById, updateStaff, deleteStaff } from '@/lib/services/staffService'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const staff = await getStaffById(params.id)
  if (!staff) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(staff)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    await updateStaff(params.id, body)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteStaff(params.id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 })
  }
}