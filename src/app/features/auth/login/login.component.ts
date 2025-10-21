import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="bg-white rounded-lg shadow-xl p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Welcome Back</h2>
      
      <div
        *ngIf="sessionMessage"
        class="mb-4 flex items-start gap-3 rounded border border-indigo-200 bg-indigo-50 p-3 text-indigo-700"
      >
        <svg class="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="space-y-1">
          <p class="font-medium">Session ended</p>
          <p class="text-sm leading-relaxed">{{ sessionMessage }}</p>
        </div>
      </div>

      <div *ngIf="errorMessage" class="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
        {{ errorMessage }}
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="john@example.com"
            data-testid="login-email-input"
          />
          <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
            <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
            <span *ngIf="loginForm.get('email')?.errors?.['email']">Invalid email format</span>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            formControlName="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
            data-testid="login-password-input"
          />
          <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500 text-sm mt-1">
            Password is required
          </div>
        </div>

        <button
          type="submit"
          [disabled]="loginForm.invalid || loading"
          class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="login-submit-button"
        >
          <span *ngIf="!loading">Login</span>
          <span *ngIf="loading">Logging in...</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <a routerLink="/register" class="text-indigo-600 hover:text-indigo-700 font-medium">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl = '';
  sessionMessage = '';
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.subscription.add(
      this.route.queryParamMap.subscribe(params => {
        this.returnUrl = params.get('returnUrl') || '/dashboard';

        const sessionExpired = params.get('sessionExpired');
        const message = params.get('sessionMessage');
        if (sessionExpired === '1') {
          this.sessionMessage = message || 'For your security we signed you out. Please log in again to continue.';

          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              sessionExpired: null,
              sessionMessage: null
            },
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
        }
      })
    );
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.sessionMessage = '';
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Invalid email or password';
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
