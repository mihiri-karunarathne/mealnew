import { NextRequest, NextResponse } from 'next/server'
import { getStaffById, updateStaff, deleteStaff } from '@/lib/services/staffService'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const staff = await getStaffById(id)
  if (!staff) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(staff)
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const body = await req.json()
    await updateStaff(id, body)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    await deleteStaff(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 })
  }
}