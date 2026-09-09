import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse } from '../models/types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSignal = signal<User | null>(null);

  currentUser = computed(() => this.currentUserSignal());
  isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');
  isLoggedIn = computed(() => !!this.currentUserSignal());

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const savedUser = localStorage.getItem('it_user');
    const token = localStorage.getItem('it_token');
    if (savedUser && token) {
      try {
        this.currentUserSignal.set(JSON.parse(savedUser));
      } catch (e) {
        this.logout();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('it_token');
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('it_token', res.token);
        localStorage.setItem('it_user', JSON.stringify(res.user));
        this.currentUserSignal.set(res.user);
      })
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((res) => {
        localStorage.setItem('it_token', res.token);
        localStorage.setItem('it_user', JSON.stringify(res.user));
        this.currentUserSignal.set(res.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('it_token');
    localStorage.removeItem('it_user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }
}
