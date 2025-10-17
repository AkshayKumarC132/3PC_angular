export interface AuditLog {
  id: number;
  action: string;
  user: any;
  timestamp: string;
  session: number;
  object_id: number;
  object_type: string;
  details: any;
}

export interface UserSettings {
  language: string;
  notification_prefs: any;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  default_sop_version: string;
  timeout_threshold: number;
  created_at: string;
  updated_at: string;
}