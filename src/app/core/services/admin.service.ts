import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  getUsers(): Observable<User[]> {
    const token = this.authService.getToken();
    return this.apiService.get<User[]>(`/admin/users/${token}/`);
  }

  getUserDetail(userId: number): Observable<User> {
    const token = this.authService.getToken();
    return this.apiService.get<User>(`/admin/user/${userId}/${token}/`);
  }

  updateUser(userId: number, data: Partial<User>): Observable<User> {
    const token = this.authService.getToken();
    return this.apiService.put<User>(
      `/admin/user/${userId}/${token}/`,
      data
    );
  }

  deleteUser(userId: number): Observable<any> {
    const token = this.authService.getToken();
    return this.apiService.delete(`/admin/user/${userId}/${token}/`);
  }

  getDashboardSummary(): Observable<any> {
    const token = this.authService.getToken();
    return this.apiService.get<any>(`/admin/dashboard-summary/${token}/`);
  }
}