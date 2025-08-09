
export interface PostgresPatient {
  id: string;
  name: string;
  surname: string;
  phone_number: string;
  dob: string;
  email?: string;
  treatment_mode: string;
  manual_type?: string;
  needle_depth?: number;
  frequency?: number;
  pulse_width?: number;
  polarity?: string;
  steps?: string;
  created_at: string;
}

export interface PostgresUser {
  id: string;
  username: string;
  pin: string;
  is_admin: boolean;
  created_at: string;
}

export interface PostgresAppointment {
  id: string;
  client_name: string;
  appointment_time: string;
  appointment_date: string;
  patient_id?: string;
  created_at: string;
}

export interface PostgresSettings {
  id: string;
  ssid?: string;
  wifi_password?: string;
  language_code?: string;
  type: string;
  created_at: string;
}

export interface PostgresLog {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  created_at: string;
}
