// lib/services/wardService.ts
import { db } from '@/lib/db'

export interface Ward {
  ward_number: string
  ward_name: string
  total_beds: number
}

export async function getAllWards(): Promise<Ward[]> {
  try {
    const wards = await db`SELECT ward_number, ward_name, total_beds FROM ward ORDER BY ward_number`
    // ✅ TypeScript happy: unknown first, then Ward[]
    return (wards as unknown as Ward[]) || []
  } catch (error) {
    console.error('getAllWards error:', error)
    return []
  }
}