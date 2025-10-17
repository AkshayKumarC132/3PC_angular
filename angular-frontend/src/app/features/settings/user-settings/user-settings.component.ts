import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { UserSettings } from '../../../core/models/session.model';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-6" data-testid="user-settings-title">User Settings</h2>

      <div *ngIf="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="language">
              Language
            </label>
            <select
              id="language"
              formControlName="language"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="language-select"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Notification Preferences</label>
            <div class="space-y-3">
              <label class="flex items-center">
                <input type="checkbox" formControlName="emailNotifications" class="mr-2" data-testid="email-notifications-checkbox" />
                <span class="text-sm text-gray-700">Email Notifications</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" formControlName="pushNotifications" class="mr-2" data-testid="push-notifications-checkbox" />
                <span class="text-sm text-gray-700">Push Notifications</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" formControlName="smsNotifications" class="mr-2" data-testid="sms-notifications-checkbox" />
                <span class="text-sm text-gray-700">SMS Notifications</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="settingsForm.invalid || loading"
            class="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="save-settings-button"
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
export class UserSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    this.settingsForm = this.fb.group({
      language: ['en', Validators.required],
      emailNotifications: [true],
      pushNotifications: [true],
      smsNotifications: [false]
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.settingsService.getUserSettings().subscribe({
      next: (settings) => {
        const notificationPrefs = settings.notification_prefs || {};
        this.settingsForm.patchValue({
          language: settings.language || 'en',
          emailNotifications: notificationPrefs.email || false,
          pushNotifications: notificationPrefs.push || false,
          smsNotifications: notificationPrefs.sms || false
        });
      },
      error: (error) => {
        console.error('Failed to load settings', error);
      }
    });
  }

  onSubmit() {
    if (this.settingsForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const formValue = this.settingsForm.value;
      const settingsData = {
        language: formValue.language,
        notification_prefs: {
          email: formValue.emailNotifications,
          push: formValue.pushNotifications,
          sms: formValue.smsNotifications
        }
      };

      this.settingsService.updateUserSettings(settingsData).subscribe({
        next: (settings) => {
          this.loading = false;
          this.successMessage = 'Settings saved successfully!';
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Failed to save settings';
        }
      });
    }
  }
}