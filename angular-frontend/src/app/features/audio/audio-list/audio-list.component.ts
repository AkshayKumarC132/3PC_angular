import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AudioService } from '../../../core/services/audio.service';
import { AudioFile } from '../../../core/models/audio.model';

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
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let audio of audioFiles" class="hover:bg-gray-50" [attr.data-testid]="'audio-row-' + audio.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ audio.original_filename }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span [ngClass]="getStatusClass(audio.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ audio.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDuration(audio.duration) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span *ngIf="audio.coverage">{{ audio.coverage }}%</span>
                  <span *ngIf="!audio.coverage" class="text-gray-400">N/A</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ audio.created_at | date:'short' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button (click)="runDiarization(audio.id)" class="text-indigo-600 hover:text-indigo-900" [attr.data-testid]="'run-diarization-' + audio.id">
                    Diarization
                  </button>
                  <a [routerLink]="['/audio/speaker-mapping', audio.id]" class="text-green-600 hover:text-green-900" [attr.data-testid]="'speaker-mapping-' + audio.id">
                    Speakers
                  </a>
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
  audioFiles: AudioFile[] = [];
  loading = false;
  errorMessage = '';

  constructor(private audioService: AudioService) {}

  ngOnInit() {
    this.loadAudioFiles();
  }

  loadAudioFiles() {
    this.loading = true;
    this.audioService.getAudioRecords().subscribe({
      next: (files) => {
        this.audioFiles = files;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load audio files';
        this.loading = false;
      }
    });
  }

  runDiarization(audioId: string) {
    if (confirm('Run diarization on this audio file?')) {
      this.audioService.runDiarization(audioId).subscribe({
        next: (response) => {
          alert('Diarization started successfully!');
          this.loadAudioFiles();
        },
        error: (error) => {
          this.errorMessage = 'Failed to start diarization';
        }
      });
    }
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}