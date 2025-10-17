import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900" data-testid="user-detail-title">User Details</h2>
        <a routerLink="/admin/users" class="text-indigo-600 hover:text-indigo-700">Back to Users</a>
      </div>

      <div *ngIf="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-600">Loading user details...</p>
      </div>

      <div *ngIf="!loading && user" class="bg-white rounded-lg shadow-md p-6">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
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
                data-testid="user-name-input"
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
                data-testid="user-email-input"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" for="role">
                Role
              </label>
              <select
                id="role"
                formControlName="role"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                data-testid="user-role-select"
              >
                <option value="user">User</option>
                <option value="reviewer">Reviewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Status
              </label>
              <label class="flex items-center">
                <input type="checkbox" formControlName="is_active" class="mr-2" data-testid="user-active-checkbox" />
                <span class="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div class="mb-6">
            <p class="text-sm text-gray-600">
              <strong>Member Since:</strong> {{ user.date_joined | date:'medium' }}
            </p>
            <p class="text-sm text-gray-600 mt-2" *ngIf="user.last_login">
              <strong>Last Login:</strong> {{ user.last_login | date:'medium' }}
            </p>
          </div>

          <button
            type="submit"
            [disabled]="userForm.invalid || updating"
            class="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="update-user-button"
          >
            <span *ngIf="!updating">Update User</span>
            <span *ngIf="updating">Updating...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class UserDetailComponent implements OnInit {
  userForm: FormGroup;
  user: User | null = null;
  userId: number = 0;
  loading = false;
  updating = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: [{value: '', disabled: true}],
      role: ['user', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = parseInt(id);
      this.loadUser();
    }
  }

  loadUser() {
    this.loading = true;
    this.adminService.getUserDetail(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: user.is_active
        });
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load user details';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.updating = true;
      this.successMessage = '';
      this.errorMessage = '';

      this.adminService.updateUser(this.userId, this.userForm.value).subscribe({
        next: (user) => {
          this.updating = false;
          this.user = user;
          this.successMessage = 'User updated successfully!';
        },
        error: (error) => {
          this.updating = false;
          this.errorMessage = error.error?.error || 'Failed to update user';
        }
      });
    }
  }
}