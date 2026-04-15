export type StaffRole = 'nurse' | 'doctor' | 'office_clerk' | 'kitchen_clerk'

export interface Staff {
  staff_id:     string
  admin_id?:    string | null
  name:         string
  ward_number:  string | null
  ward_name?:   string | null
  nic:          string
  role:         StaffRole
  address?:     string | null
  created_at:   string
}

export interface CreateStaffInput {
  name:         string
  nic:          string
  role:         StaffRole
  ward:         string
  address:      string
}