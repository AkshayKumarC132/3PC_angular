import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-download-transcription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-6" data-testid="download-transcription-title">Download Processed Document</h2>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="sessionId">
            Session ID
          </label>
          <input
            type="text"
            id="sessionId"
            [(ngModel)]="sessionId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter session ID"
            data-testid="session-id-input"
          />
          <p class="text-sm text-gray-600 mt-2">Enter the session ID you received after uploading and processing an audio file.</p>
        </div>

        <div class="space-y-3">
          <button
            (click)="downloadWithTranscription()"
            [disabled]="!sessionId"
            class="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="download-transcription-button"
          >
            Download with Transcription
          </button>

          <button
            (click)="downloadWithDiarization()"
            [disabled]="!sessionId"
            class="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="download-diarization-button"
          >
            Download with Diarization
          </button>
        </div>

        <div class="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 class="text-sm font-semibold text-blue-900 mb-2">Download Options:</h3>
          <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li><strong>With Transcription:</strong> Downloads the document with highlighted text matching the audio transcription</li>
            <li><strong>With Diarization:</strong> Downloads the document with speaker labels and timing information</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DownloadTranscriptionComponent {
  sessionId = '';
  errorMessage = '';

  constructor(private audioService: AudioService) {}

  downloadWithTranscription() {
    if (this.sessionId) {
      const downloadUrl = this.audioService.downloadProcessed(this.sessionId);
      window.open(downloadUrl, '_blank');
    } else {
      this.errorMessage = 'Please enter a session ID';
    }
  }

  downloadWithDiarization() {
    if (this.sessionId) {
      const downloadUrl = this.audioService.downloadWithDiarization(this.sessionId);
      window.open(downloadUrl, '_blank');
    } else {
      this.errorMessage = 'Please enter a session ID';
    }
  }
}