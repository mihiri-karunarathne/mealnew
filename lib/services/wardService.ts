// lib/services/wardService.ts
import { getDb} from '@/lib/db'
//import type { Ward } from '@/types' // Your Ward type

export interface Ward {
  ward_number: string
  ward_name: string
  total_beds: number
}

/*export async function getAllWards(): Promise<Ward[]> {
  try {
    const wards = await db`SELECT ward_number, ward_name, total_beds FROM ward ORDER BY ward_number`
    // ✅ TypeScript happy: unknown first, then Ward[]
    return (wards as unknown as Ward[]) || []
  } catch (error) {
    console.error('getAllWards error:', error)
    return []
  }
}*/
export async function getAllWards(): Promise<Ward[]> {
  const db = getDb()
  const rows = await db`
    SELECT ward_number, ward_name, total_beds
    FROM ward
    ORDER BY ward_number
  `
  
   return rows as unknown as Ward[] // Safe - exact column match
}