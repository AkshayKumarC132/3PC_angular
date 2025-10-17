import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-900 mb-6" data-testid="profile-title">Profile</h1>

      <div *ngIf="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
        
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                formControlName="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                data-testid="profile-name-input"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                formControlName="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                readonly
                data-testid="profile-email-input"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" for="role">
                Role
              </label>
              <input
                type="text"
                id="role"
                [value]="user?.role || ''"
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                readonly
                data-testid="profile-role-input"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" for="theme">
                Theme
              </label>
              <select
                id="theme"
                formControlName="theme"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                data-testid="profile-theme-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          <div class="mb-6">
            <p class="text-sm text-gray-600">
              <strong>Member Since:</strong> {{ user?.date_joined | date:'medium' }}
            </p>
            <p class="text-sm text-gray-600 mt-2" *ngIf="user?.last_login">
              <strong>Last Login:</strong> {{ user?.last_login | date:'medium' }}
            </p>
          </div>

          <button
            type="submit"
            [disabled]="profileForm.invalid || loading"
            class="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="profile-update-button"
          >
            <span *ngIf="!loading">Update Profile</span>
            <span *ngIf="loading">Updating...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{value: '', disabled: true}],
      theme: ['light']
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          theme: user.theme || 'light'
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profile';
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      this.authService.updateProfile(this.profileForm.value).subscribe({
        next: (user) => {
          this.loading = false;
          this.user = user;
          this.successMessage = 'Profile updated successfully!';
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.error || 'Failed to update profile';
        }
      });
    }
  }
}