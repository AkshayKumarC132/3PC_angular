import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../../core/services/settings.service';
import { AuditLog } from '../../../core/models/session.model';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-6" data-testid="audit-logs-title">Audit Logs</h2>

      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-600">Loading audit logs...</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div *ngIf="!loading" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div *ngIf="auditLogs.length === 0" class="p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No audit logs</h3>
          <p class="mt-1 text-sm text-gray-500">No activity has been logged yet.</p>
        </div>

        <div *ngIf="auditLogs.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Object Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Object ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let log of auditLogs" class="hover:bg-gray-50" [attr.data-testid]="'audit-log-' + log.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ log.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span [ngClass]="getActionClass(log.action)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ log.action }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.user?.name || 'N/A' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.object_type }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.object_id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.timestamp | date:'medium' }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <button (click)="viewDetails(log)" class="text-indigo-600 hover:text-indigo-900">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AuditLogsComponent implements OnInit {
  auditLogs: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.loadAuditLogs();
  }

  loadAuditLogs() {
    this.loading = true;
    this.settingsService.getAuditLogs().subscribe({
      next: (response: any) => {
        this.auditLogs = response.results;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load audit logs';
        this.loading = false;
      }
    });
  }

  viewDetails(log: AuditLog) {
    alert(JSON.stringify(log.details, null, 2));
  }

  getActionClass(action: string): string {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('create')) return 'bg-green-100 text-green-800';
    if (lowerAction.includes('update') || lowerAction.includes('edit')) return 'bg-blue-100 text-blue-800';
    if (lowerAction.includes('delete')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  }
}