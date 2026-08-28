export interface AttendanceLog {
  id: number;
  employee_id: number;
  employeeName?: string;
  date: string;       // YYYY-MM-DD
  check_in?: string;  // HH:MM
  check_out?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
}

export interface Employee {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role_id?: number;
  is_active: boolean;
  role?: {
    id: number;
    name: string;
  };
}
