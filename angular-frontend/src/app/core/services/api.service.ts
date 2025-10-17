import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, options?: any): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, options) as Observable<T>;
  }

  post<T>(endpoint: string, data: any, options?: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, options) as Observable<T>;
  }

  put<T>(endpoint: string, data: any, options?: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, options) as Observable<T>;
  }

  delete<T>(endpoint: string, options?: any): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, options) as Observable<T>;
  }

  patch<T>(endpoint: string, data: any, options?: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, data, options) as Observable<T>;
  }
}