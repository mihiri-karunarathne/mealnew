import { NextResponse } from 'next/server'
import { getAllWards } from '@/lib/services/wardService'

// Generic error handler
function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)
  
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export async function GET(): Promise<NextResponse> {
  try {
    const wards = await getAllWards()
    return NextResponse.json(wards)
  } catch (error: unknown) {
    console.error('GET /api/wards:', error)
    return handleApiError(error)
  }
}