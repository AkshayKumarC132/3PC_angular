import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../../core/services/audio.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-diarization-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/audio/list" class="text-indigo-600 hover:text-indigo-800">&larr; Back</a>
        <h2 class="text-2xl font-bold text-gray-900">Diarization Detail</h2>
      </div>

      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-600">Loading diarization...</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <ng-container *ngIf="!loading && record">
        <!-- Header / Meta -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 truncate" [title]="record?.original_filename">
                {{ record?.original_filename }}
              </h3>

              <div class="mt-3 flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      [ngClass]="statusBadgeClass(record?.status)">
                  <span class="mr-1 inline-block h-2 w-2 rounded-full" [ngClass]="statusDotClass(record?.status)"></span>
                  {{ (record?.status || 'unknown') | titlecase }}
                </span>

                <span class="text-sm text-gray-700">
                  <span class="font-medium">Duration:</span> {{ formatDuration(record?.duration) }}
                </span>
                <span class="text-sm text-gray-700">
                  <span class="font-medium">Coverage:</span> {{ formatCoverage(record?.coverage) }}%
                </span>
                <span class="text-sm text-gray-700">
                  <span class="font-medium">Uploaded:</span> {{ record?.created_at | date:'short' }}
                </span>
                <span *ngIf="record?.reference_document" class="text-sm text-gray-700">
                  <span class="font-medium">Reference Doc:</span>
                  {{ record?.reference_document?.name }}
                  <span class="text-gray-500">({{ record?.reference_document?.document_type || '—' }})</span>
                </span>
                <span *ngIf="record?.processing_session" class="text-sm text-gray-700">
                  <span class="font-medium">Session:</span> {{ record?.processing_session }}
                </span>
              </div>
            </div>

            <div class="w-full md:w-96">
              <audio *ngIf="record?.file_path" class="w-full" controls [src]="record?.file_path"></audio>

              <!-- Optional downloads if session_id exists -->
              <div class="mt-3 flex flex-wrap gap-2" *ngIf="record?.processing_session">
                <a
                  class="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                  [href]="buildDownloadUrl(record.processing_session)"
                  target="_blank" rel="noopener"
                  title="Download processed document"
                >
                  Download
                </a>
                <a
                  class="px-3 py-1.5 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  [href]="buildDownloadWithDiarizationUrl(record.processing_session)"
                  target="_blank" rel="noopener"
                  title="Download with diarization"
                >
                  Download + Diarization
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Speakers Summary -->
          <div class="bg-white rounded-lg shadow p-6 xl:col-span-1">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-md font-semibold text-gray-900">Speakers</h4>
              <span class="text-xs text-gray-500">{{ (record?.diarization?.speakers || []).length }} total</span>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Label</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Segments</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let s of record?.diarization?.speakers">
                    <td class="px-3 py-2 text-sm font-medium text-gray-900">{{ s.speaker_label }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700">{{ s.speaker_name || '—' }}</td>
                    <td class="px-3 py-2 text-sm text-right text-gray-700">{{ s.segment_count ?? '—' }}</td>
                    <td class="px-3 py-2 text-sm text-right text-gray-700">{{ formatDuration(s.total_duration) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Segments & Transcript -->
          <div class="xl:col-span-2 space-y-6">
            <!-- Segments -->
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-md font-semibold text-gray-900">Segments</h4>
                <input
                  type="text"
                  class="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64"
                  placeholder="Filter by text or speaker…"
                  [(ngModel)]="query"
                />
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Speaker</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Start → End</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Text</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let seg of filteredSegments()">
                      <td class="px-3 py-2 text-sm font-medium text-gray-900 align-top whitespace-nowrap">
                        <div class="flex items-center gap-2">
                          <span class="inline-block w-2 h-2 rounded-full bg-indigo-400"></span>
                          {{ seg.speaker_name || seg.speaker_label || '—' }}
                        </div>
                      </td>
                      <td class="px-3 py-2 text-sm text-gray-700 align-top whitespace-nowrap">
                        {{ toTime(seg.start) }} → {{ toTime(seg.end ?? (seg.start + seg.duration)) }}
                      </td>
                      <!-- FULL TEXT (no clamp), nicely wrapped -->
                      <td class="px-3 py-2 text-sm text-gray-700 align-top whitespace-pre-wrap break-words">
                        {{ seg.text || '—' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div *ngIf="!record?.diarization?.segments?.length" class="text-sm text-gray-500 mt-4">
                No segments found.
              </div>
            </div>

            <!-- Transcript (from segments) -->
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-md font-semibold text-gray-900">Transcript</h4>
                <button
                  class="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
                  (click)="copyTranscript()"
                  [disabled]="!transcript"
                  title="Copy transcript to clipboard"
                >
                  Copy
                </button>
              </div>
              <div class="text-sm text-gray-700 whitespace-pre-wrap break-words leading-6">
                {{ transcript || '—' }}
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: []
})
export class DiarizationDetailComponent implements OnInit {
  loading = false;
  errorMessage = '';
  record: any;
  query = '';
  transcript = '';

  constructor(
    private route: ActivatedRoute,
    private audioService: AudioService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.fetchRecord(id);
  }

  fetchRecord(id: string) {
    this.loading = true;
    this.audioService.findAudioRecordById(id).subscribe({
      next: (rec: any) => {
        this.record = rec;
        this.transcript = this.buildTranscript(rec);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load diarization details (record not found)';
        this.loading = false;
      }
    });
  }

  filteredSegments() {
    const segs = this.record?.diarization?.segments || [];
    if (!this.query.trim()) return segs;
    const q = this.query.toLowerCase();
    return segs.filter((s: any) =>
      (s.text || '').toLowerCase().includes(q) ||
      (s.speaker_name || s.speaker_label || '').toLowerCase().includes(q)
    );
  }

  // === Status badge classes (more vivid colors) ===
  statusBadgeClass(status?: string) {
    switch ((status || '').toLowerCase()) {
      case 'completed':  return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending':    return 'bg-amber-100 text-amber-800';
      case 'failed':     return 'bg-red-100 text-red-800';
      default:           return 'bg-gray-100 text-gray-800';
    }
  }
  statusDotClass(status?: string) {
    switch ((status || '').toLowerCase()) {
      case 'completed':  return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'pending':    return 'bg-amber-500';
      case 'failed':     return 'bg-red-500';
      default:           return 'bg-gray-400';
    }
  }

  formatDuration(seconds?: number): string {
    if (seconds === null || seconds === undefined) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  toTime(seconds?: number): string {
    if (seconds === null || seconds === undefined) return '—';
    const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
    const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  formatCoverage(value?: number): string {
    if (value === null || value === undefined) return '0.0';
    const pct = value <= 1 ? value * 100 : value;
    return pct.toFixed(1);
  }

  // Build transcript text from diarization segments
  buildTranscript(rec: any): string {
    const segs = rec?.diarization?.segments || [];
    if (!segs.length) return '';
    // Format: [mm:ss - mm:ss] Speaker: text
    return segs.map((s: any) => {
      const start = this.toTime(s.start);
      const end = this.toTime(s.end ?? (s.start + s.duration));
      const who = s.speaker_name || s.speaker_label || '—';
      const text = s.text || '';
      return `[${start} - ${end}] ${who}: ${text}`;
    }).join('\n');
  }

  copyTranscript() {
    if (!this.transcript) return;
    navigator.clipboard.writeText(this.transcript).catch(() => {});
  }

  // Build download URLs using the same pattern your service uses
  private get token() { return this.auth.getToken(); }
  buildDownloadUrl(sessionId: string) {
    return `/api/download/${this.token}/${sessionId}/`;
  }
  buildDownloadWithDiarizationUrl(sessionId: string) {
    return `/api/download/with-diarization/${this.token}/${sessionId}/`;
  }
}
