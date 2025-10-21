import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest, LoginResponse, RegisterRequest, AuthState } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user';

  private authStateSubject = new BehaviorSubject<AuthState>(this.restoreAuthState());

  public authState$ = this.authStateSubject.asObservable();

  constructor(private apiService: ApiService) { }

  private restoreAuthState(): AuthState {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = this.getStoredUser();

    return {
      user,
      token,
      isAuthenticated: !!token
    };
  }

  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem(this.USER_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch (error) {
      console.warn('Failed to parse stored user data. Clearing corrupted value.', error);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  private setAuthState(user: User | null, token: string | null): void {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
    }

    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_KEY);
    }

    this.authStateSubject.next({
      user,
      token,
      isAuthenticated: !!token
    });
  }

  register(data: RegisterRequest): Observable<any> {
    return this.apiService.post('/register/', data);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/login/', credentials).pipe(
      tap(response => {
        if (response.token) {
          this.setAuthState(response.data ?? null, response.token);
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
        this.setAuthState(user, this.authStateSubject.value.token);
      })
    );
  }

  getToken(): string | null {
    return this.authStateSubject.value.token ?? localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    const currentUser = this.authStateSubject.value.user;
    return currentUser ?? this.getStoredUser();
  }

  isAuthenticated(): boolean {
    const { isAuthenticated } = this.authStateSubject.value;
    if (isAuthenticated) {
      return true;
    }

    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.setAuthState(this.getStoredUser(), token);
      return true;
    }

    return false;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  private clearAuthState(): void {
    this.setAuthState(null, null);
  }
}
