import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest, LoginResponse, RegisterRequest, AuthState } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });

  public authState$ = this.authState.asObservable();

  constructor(private apiService: ApiService) {
    this.loadAuthState();
  }

  private loadAuthState(): void {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.authState.next({
        user: JSON.parse(user),
        token: token,
        isAuthenticated: true
      });
    }
  }

  register(data: RegisterRequest): Observable<any> {
    return this.apiService.post('/register/', data);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/login/', credentials).pipe(
      tap(response => {
        if (response.token && response.data) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.data));
          this.authState.next({
            user: response.data,
            token: response.token,
            isAuthenticated: true
          });
        }
      })
    );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    return this.apiService.post(`/logout/${token}/`, {}).pipe(
      tap(() => {
        this.clearAuthState();
      })
    );
  }

  getProfile(): Observable<User> {
    const token = this.getToken();
    return this.apiService.get<User>(`/profile/${token}/`);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    const token = this.getToken();
    return this.apiService.put<User>(`/profile/${token}/`, data).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        const currentState = this.authState.value;
        this.authState.next({
          ...currentState,
          user: user
        });
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  private clearAuthState(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.authState.next({
      user: null,
      token: null,
      isAuthenticated: false
    });
  }
}