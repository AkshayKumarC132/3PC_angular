import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { UserSettings, SystemSettings, AuditLog } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  getUserSettings(): Observable<UserSettings> {
    const token = this.authService.getToken();
    return this.apiService.get<UserSettings>(`/settings/user/${token}/`);
  }

  updateUserSettings(settings: Partial<UserSettings>): Observable<UserSettings> {
    const token = this.authService.getToken();
    return this.apiService.put<UserSettings>(
      `/settings/user/${token}/`,
      settings
    );
  }

  getSystemSettings(): Observable<SystemSettings> {
    const token = this.authService.getToken();
    return this.apiService.get<SystemSettings>(`/settings/system/${token}/`);
  }

  updateSystemSettings(settings: Partial<SystemSettings>): Observable<SystemSettings> {
    const token = this.authService.getToken();
    return this.apiService.put<SystemSettings>(
      `/settings/system/${token}/`,
      settings
    );
  }

  getAuditLogs(): Observable<AuditLog[]> {
    const token = this.authService.getToken();
    return this.apiService.get<AuditLog[]>(`/audit-logs/${token}/`);
  }
}