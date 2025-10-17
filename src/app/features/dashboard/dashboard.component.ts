import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { DashboardService } from '../../core/services/dashboard.service';

interface DashboardSummary {
  total_documents: number;
  total_audio_files: number;
  processed_audio: number;
  pending_diarization: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-4">
      <h1 class="text-3xl font-bold text-gray-900 mb-6" data-testid="dashboard-title">Dashboard</h1>

      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-600">Loading dashboard...</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Documents -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Documents</p>
              <p class="text-2xl font-bold text-indigo-600">{{ summary?.total_documents || 0 }}</p>
            </div>
            <svg class="w-12 h-12 text-indigo-200" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"/>
              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
            </svg>
          </div>
        </div>

        <!-- Total Audio Files -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Audio Files</p>
              <p class="text-2xl font-bold text-green-600">{{ summary?.total_audio_files || 0 }}</p>
            </div>
            <svg class="w-12 h-12 text-green-200" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>

        <!-- Processed Audios (updated label + icon) -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Processed Audios</p>
              <p class="text-2xl font-bold text-purple-600">{{ summary?.processed_audio || 0 }}</p>
            </div>
            <!-- Check-circle icon for "processed/completed" -->
            <svg class="w-12 h-12 text-purple-200" fill="currentColor" viewBox="0 0 24 24">
              <path
                fill-rule="evenodd"
                d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm-1.293 13.293-3-3a1 1 0 1 1 1.414-1.414L11 12.586l4.879-4.879a1 1 0 1 1 1.414 1.414l-5.586 5.586a1 1 0 0 1-1.414 0Z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>

        <!-- Pending Diarization (updated icon) -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Pending Diarization</p>
              <p class="text-2xl font-bold text-blue-600">{{ summary?.pending_diarization || 0 }}</p>
            </div>
            <!-- Clock icon for "pending/in progress" -->
            <svg class="w-12 h-12 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1.75a10.25 10.25 0 1 0 10.25 10.25A10.262 10.262 0 0 0 12 1.75Zm0 18.5A8.25 8.25 0 1 1 20.25 12 8.26 8.26 0 0 1 12 20.25Z"/>
              <path d="M12.75 7.75a.75.75 0 0 0-1.5 0v4.19l-2.47 2.47a.75.75 0 1 0 1.06 1.06l2.91-2.91a.75.75 0 0 0 .22-.53Z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <a routerLink="/documents/upload" class="flex items-center p-4 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors" data-testid="quick-action-upload-document">
              <svg class="w-6 h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <div>
                <p class="text-sm font-semibold text-gray-900">Upload Document</p>
                <p class="text-xs text-gray-600">Add a new reference document</p>
              </div>
            </a>

            <a routerLink="/audio/upload" class="flex items-center p-4 bg-green-50 rounded-md hover:bg-green-100 transition-colors" data-testid="quick-action-upload-audio">
              <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
              </svg>
              <div>
                <p class="text-sm font-semibold text-gray-900">Upload & Process Audio</p>
                <p class="text-xs text-gray-600">Upload audio for transcription</p>
              </div>
            </a>

            <a routerLink="/audio/download" class="flex items-center p-4 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors" data-testid="quick-action-download">
              <svg class="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <div>
                <p class="text-sm font-semibold text-gray-900">Download Processed</p>
                <p class="text-xs text-gray-600">Get processed documents</p>
              </div>
            </a>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div class="space-y-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <div class="w-2 h-2 mt-2 bg-indigo-600 rounded-full"></div>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm text-gray-900">No recent activity</p>
                <p class="text-xs text-gray-500">Your activity will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  loading = false;
  errorMessage = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardSummary();
  }

  private loadDashboardSummary() {
    this.loading = true;

    this.dashboardService.getSummary()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.summary = data;
        },
        error: (error) => {
          console.error('Error fetching dashboard summary:', error);
          this.errorMessage = 'Failed to load dashboard summary';
        }
      });
  }
}
