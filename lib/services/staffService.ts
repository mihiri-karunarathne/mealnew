import { db } from '@/lib/db'
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
  const result = await db`
    SELECT COUNT(*)::int AS count FROM staff WHERE staff_id LIKE ${prefix + '%'}
  `
  const next = String((result[0].count as number) + 1).padStart(3, '0')
  return `${prefix}${next}`
}

export async function getAllStaff(): Promise<Staff[]> {
  try {
    const result = await db`
      SELECT staff_id, name, designation, ward, nic, role, created_at
      FROM staff
      ORDER BY created_at DESC
    `
    // ✅ SAFE: Always return array
   return Array.isArray(result) 
      ? (result as unknown as Staff[])
      : []
  } catch (error) {
    console.error('getAllStaff error:', error)
    return []
  }
}
export async function getStaffById(staffId: string): Promise<Staff | null> {
  try {
    const rows = await db`
      SELECT staff_id, name, designation, ward, nic, role, address, created_at
      FROM staff WHERE staff_id = ${staffId}
    `
    return Array.isArray(rows) && rows.length > 0 ? (rows[0] as Staff) : null
  } catch (error) {
    console.error('getStaffById error:', error)
    return null
  }
}

export async function createStaff(input: CreateStaffInput, adminId: string) {
  const staff_id    = await generateStaffId(input.role)
  const tempPassword = randomBytes(4).toString('hex').toUpperCase()
  const password_hash = await bcrypt.hash(tempPassword, 10)

  await db`
    INSERT INTO staff (staff_id, admin_id, name, nic, role, designation, ward, address, password_hash)
    VALUES (
      ${staff_id}, ${adminId}, ${input.name}, ${input.nic},
      ${input.role}, ${input.designation}, ${input.ward},
      ${input.address}, ${password_hash}
    )
  `
  return { staff_id, tempPassword }
}

export async function updateStaff(staffId: string, input: Partial<CreateStaffInput>) {
  await db`
    UPDATE staff SET
      name        = COALESCE(${input.name        ?? null}, name),
      designation = COALESCE(${input.designation ?? null}, designation),
      ward        = COALESCE(${input.ward        ?? null}, ward),
      address     = COALESCE(${input.address     ?? null}, address)
    WHERE staff_id = ${staffId}
  `
}

export async function deleteStaff(staffId: string) {
  try {
    await db`DELETE FROM staff WHERE staff_id = ${staffId}`
  } catch (error) {
    console.error('deleteStaff error:', error)
    throw error // Re-throw for API handling
  }
}