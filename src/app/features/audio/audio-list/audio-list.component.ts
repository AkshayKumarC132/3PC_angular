import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-audio-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900" data-testid="audio-list-title">Audio Files</h2>
        <a routerLink="/audio/upload" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700" data-testid="upload-audio-link">
          Upload Audio
        </a>
      </div>

      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-600">Loading audio files...</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div *ngIf="!loading" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div *ngIf="audioFiles.length === 0" class="p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No audio files</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by uploading an audio file.</p>
          <div class="mt-6">
            <a routerLink="/audio/upload" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Upload Audio
            </a>
          </div>
        </div>

        <div *ngIf="audioFiles.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Filename</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Coverage</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Uploaded</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let audio of audioFiles; trackBy: trackById" class="hover:bg-gray-50" [attr.data-testid]="'audio-row-' + audio.id">
                <!-- Filename (clickable to open diarization detail) -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    type="button"
                    class="text-indigo-600 hover:text-indigo-800 hover:underline max-w-xs truncate text-left"
                    [title]="audio.original_filename"
                    (click)="viewDiarization(audio.id)"
                    [attr.data-testid]="'open-from-filename-' + audio.id"
                  >
                    {{ audio.original_filename }}
                  </button>
                  <div class="text-xs text-gray-500 truncate" *ngIf="audio.processing_session" [title]="audio.processing_session">
                    Session: {{ audio.processing_session }}
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span [ngClass]="getStatusClass(audio.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize">
                    <ng-container [ngSwitch]="audio.status">
                      <span *ngSwitchCase="'processing'" class="inline-flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> {{ audio.status }}
                      </span>
                      <span *ngSwitchDefault>{{ audio.status || 'unknown' }}</span>
                    </ng-container>
                  </span>
                </td>

                <!-- Duration -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ formatDuration(audio.duration) }}
                </td>

                <!-- Coverage -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span *ngIf="audio.coverage !== null && audio.coverage !== undefined; else noCoverage">
                    {{ formatCoverage(audio.coverage) }}%
                  </span>
                  <ng-template #noCoverage>
                    <span class="text-gray-400">N/A</span>
                  </ng-template>
                </td>

                <!-- Uploaded -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ audio.created_at | date:'short' }}
                </td>

                <!-- Actions: icon buttons -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div class="inline-flex items-center gap-2">
                    <!-- View (eye) -->
                    <button
                      class="p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                      (click)="viewDiarization(audio.id)"
                      title="View diarization"
                      aria-label="View diarization detail"
                      [attr.data-testid]="'view-diarization-' + audio.id"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                      </svg>
                    </button>

                    <!-- Speakers (users) -->
                    <!-- <a
                      class="p-2 rounded-md border border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                      [routerLink]="['/audio/speaker-mapping', audio.id]"
                      title="Speaker mapping"
                      aria-label="Speaker mapping"
                      [attr.data-testid]="'speaker-mapping-' + audio.id"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7 7a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm10 4a3 3 0 1 0-2.83-4h-.34A6 6 0 1 0 5 13.9V16a2 2 0 0 0 2 2h5.26A7 7 0 0 1 17 11Z"/>
                      </svg>
                    </a> -->

                    <!-- Run (play) -->
                    <button
                      class="p-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      (click)="runDiarization(audio.id)"
                      [disabled]="!canRunDiarization(audio.status)"
                      title="Run diarization"
                      aria-label="Run diarization"
                      [attr.data-testid]="'run-diarization-' + audio.id"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5.14v13.72a1 1 0 0 0 1.52.86l10.1-6.86a1 1 0 0 0 0-1.72L9.52 4.28A1 1 0 0 0 8 5.14Z"/>
                      </svg>
                    </button>
                  </div>
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
export class AudioListComponent implements OnInit {
  audioFiles: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(private audioService: AudioService, private router: Router) { }

  ngOnInit() {
    this.loadAudioFiles();
  }

  trackById = (_: number, row: any) => row.id;

  loadAudioFiles() {
    this.loading = true;
    this.audioService.getAudioRecords().subscribe({
      next: (response: any) => {
        this.audioFiles = response?.results ?? [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load audio files';
        this.loading = false;
      }
    });
  }

  viewDiarization(audioId: string) {
    this.router.navigate(['/audio/diarization', audioId]);
  }

  runDiarization(audioId: string) {
    if (confirm('Run diarization on this audio file?')) {
      this.audioService.runDiarization(audioId).subscribe({
        next: () => {
          alert('Diarization started successfully!');
          this.loadAudioFiles();
        },
        error: () => {
          this.errorMessage = 'Failed to start diarization';
        }
      });
    }
  }

  formatDuration(seconds?: number): string {
    if (seconds === null || seconds === undefined) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatCoverage(value: number): string {
    if (value === null || value === undefined) return '0.0';
    const pct = value <= 1 ? value * 100 : value;
    return pct.toFixed(1);
  }

  canRunDiarization(status: string): boolean {
    return (status || '').toLowerCase() !== 'processing';
  }

  getStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
