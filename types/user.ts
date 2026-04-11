export type StaffRole = 'nurse' | 'doctor' | 'office_clerk' | 'kitchen_clerk'

export interface Staff {
  staff_id:    string
  admin_id?:   string
  name:        string
  designation: string
  ward:        string
  nic:         string
  role:        StaffRole
  address?:    string
  created_at:  string
}

export interface CreateStaffInput {
  name:        string
  nic:         string
  role:        StaffRole
  designation: string
  ward:        string
  address:     string
}