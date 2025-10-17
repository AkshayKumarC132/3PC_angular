import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-6" data-testid="system-settings-title">System Settings</h2>

      <div *ngIf="!isAdmin" class="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        Only administrators can modify system settings.
      </div>

      <div *ngIf="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="defaultSopVersion">
              Default SOP Version
            </label>
            <input
              type="text"
              id="defaultSopVersion"
              formControlName="default_sop_version"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 1.0"
              [readOnly]="!isAdmin"
              data-testid="default-sop-version-input"
            />
          </div>

          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="timeoutThreshold">
              Timeout Threshold (seconds)
            </label>
            <input
              type="number"
              id="timeoutThreshold"
              formControlName="timeout_threshold"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 300"
              [readOnly]="!isAdmin"
              data-testid="timeout-threshold-input"
            />
          </div>

          <button
            *ngIf="isAdmin"
            type="submit"
            [disabled]="settingsForm.invalid || loading"
            class="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="save-system-settings-button"
          >
            <span *ngIf="!loading">Save Settings</span>
            <span *ngIf="loading">Saving...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class SystemSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private authService: AuthService
  ) {
    this.settingsForm = this.fb.group({
      default_sop_version: ['', Validators.required],
      timeout_threshold: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.loadSettings();
  }

  loadSettings() {
    this.settingsService.getSystemSettings().subscribe({
      next: (settings) => {
        this.settingsForm.patchValue({
          default_sop_version: settings.default_sop_version || '',
          timeout_threshold: settings.timeout_threshold || 300
        });
      },
      error: (error) => {
        console.error('Failed to load settings', error);
      }
    });
  }

  onSubmit() {
    if (this.settingsForm.valid && this.isAdmin) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      this.settingsService.updateSystemSettings(this.settingsForm.value).subscribe({
        next: (settings) => {
          this.loading = false;
          this.successMessage = 'System settings saved successfully!';
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Failed to save system settings';
        }
      });
    }
  }
}