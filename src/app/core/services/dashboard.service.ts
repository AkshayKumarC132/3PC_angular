import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface DashboardSummary {
  total_documents: number;
  total_audio_files: number;
  processed_audio: number;
  pending_diarization: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  getSummary(): Observable<DashboardSummary> {
    const token = this.auth.getToken();
    // Matches the pattern used in AdminService (ApiService likely prefixes with /api)
    return this.api.get<DashboardSummary>(`/dashboard/summary/${token}/`);
  }
}
