import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import type { Staff, CreateStaffInput } from '@/types/user'

const ROLE_PREFIX: Record<string, string> = {
  nurse:          'NS',
  doctor:         'DR',
  office_clerk:   'OC',
  kitchen_clerk:  'KC',
}

async function generateStaffId(role: string): Promise<string> {
  const prefix = ROLE_PREFIX[role] ?? 'ST'
  const result = await getDb()`
    SELECT COUNT(*)::int AS count FROM staff WHERE staff_id LIKE ${prefix + '%'}
  `
  const next = String((result[0].count as number) + 1).padStart(3, '0')
  return `${prefix}${next}`
}
// JOIN ward table → get ward_name for display
export async function getAllStaff(): Promise<Staff[]> {
  try {
    const rows = await getDb()`
      SELECT
        s.staff_id,
        s.admin_id,
        s.name,
        s.ward_number,
        w.ward_name,
        s.nic,
        s.role,
        s.address,
        s.created_at
      FROM staff s
      LEFT JOIN ward w ON w.ward_number = s.ward_number
      ORDER BY s.created_at DESC
    `
    return Array.isArray(rows) ? (rows as unknown as Staff[]) : []
  } catch (error) {
    console.error('getAllStaff error:', error)
    return []
  }
}

export async function getStaffById(staffId: string): Promise<Staff | null> {
  try {
    const rows = await getDb()`
      SELECT
        s.staff_id,
        s.admin_id,
        s.name,
        s.ward_number,
        w.ward_name,
        s.nic,
        s.role,
        s.address,
        s.created_at
      FROM staff s
      LEFT JOIN ward w ON w.ward_number = s.ward_number
      WHERE s.staff_id = ${staffId}
    `
    return Array.isArray(rows) && rows.length > 0 ? (rows[0] as Staff) : null
  } catch (error) {
    console.error('getStaffById error:', error)
    return null
  }
}

export async function createStaff(input: CreateStaffInput, adminId = null) {
  try {
    const staff_id = await generateStaffId(input.role)
    const tempPassword = randomBytes(4).toString('hex').toUpperCase()
    const password_hash = await bcrypt.hash(tempPassword, 10)

    // Single query - handles both adminId present or null
    const result = await getDb()`
      INSERT INTO staff (
        staff_id, ward_number, name, nic, role, 
        address, password_hash, admin_id, created_at
      ) VALUES (
        ${staff_id}, ${input.ward}, ${input.name}, 
        ${input.nic}, ${input.role}, ${input.address}, 
        ${password_hash}, ${adminId}, NOW()
      )
      RETURNING staff_id
    `

    return { 
  staff_id: result[0]?.staff_id || staff_id,  // ✅ CORRECT
  tempPassword 
}
  } catch (error) {
    console.error('createStaff error:', error)
    throw error
  }
}

export async function updateStaff(staffId: string, input: Partial<CreateStaffInput>) {
  await getDb()`
    UPDATE staff SET
      name        = COALESCE(${input.name        ?? null}, name),
      ward_number = COALESCE(${input.ward          ?? null}, ward_number),
      address     = COALESCE(${input.address     ?? null}, address)
    WHERE staff_id = ${staffId}
  `
}

export async function deleteStaff(staffId: string) {
  try {
    await getDb()`DELETE FROM staff WHERE staff_id = ${staffId}`
  } catch (error) {
    console.error('deleteStaff error:', error)
    throw error // Re-throw for API handling
  }
}