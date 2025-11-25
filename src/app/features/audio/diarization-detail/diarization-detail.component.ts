import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../../core/services/audio.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface DownloadApiResponse {
  processed_docx_url?: string; // primary (as per your sample)
  url?: string;                // fallback name some backends use
  s3_url?: string;             // another common fallback
  filename?: string;           // preferred filename if provided (used server-side via Content-Disposition)
  message?: string;
  session_id?: string;
  three_pc_entries?: Array<{
    speaker: string;
    start: number;
    end: number;
    content: string;
    status: string;
    reference: string | null;
    similarity: number;
  }>;
}

@Component({
  selector: 'app-diarization-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4">
      <!-- Top Bar -->
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/audio" class="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back
        </a>
        <h2 class="text-2xl font-bold text-gray-900">Diarization Detail</h2>
      </div>

      <!-- Loading / Error -->
      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-600">Loading diarization...</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <ng-container *ngIf="!loading && record">
        <!-- Header / Meta -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <!-- Title + Actions -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-xl sm:text-2xl font-semibold text-gray-900 truncate"
                    [title]="record?.original_filename">
                  {{ record?.original_filename || '—' }}
                </h3>
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      [ngClass]="statusBadgeClass(record?.status)">
                  <span class="mr-1 inline-block h-2 w-2 rounded-full"
                        [ngClass]="statusDotClass(record?.status)"></span>
                  {{ (record?.status || 'unknown') | titlecase }}
                </span>
              </div>

              <div class="text-xs text-gray-500" *ngIf="record?.processing_session">
                Session: <span class="font-mono">{{ record.processing_session }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <!-- Download processed -->
              <button *ngIf="record?.processing_session"
                      class="inline-flex items-center gap-2 p-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition disabled:opacity-60"
                      [disabled]="downloadingProcessed"
                      (click)="downloadProcessed(record.processing_session)"
                      title="Download processed document"
                      aria-label="Download processed document">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v10m0 0l-4-4m4 4l4-4M4 20h16" />
                </svg>
                <span class="min-w-[4rem]">
                  <ng-container *ngIf="!downloadingProcessed; else procLoading">Processed</ng-container>
                  <ng-template #procLoading>Loading…</ng-template>
                </span>
              </button>

              <!-- Download with diarization -->
              <button *ngIf="record?.processing_session"
                      class="inline-flex items-center gap-2 p-2 rounded-md text-sm transition border disabled:opacity-50 disabled:cursor-not-allowed"
                      [class.border-indigo-300]="hasDiarization()"
                      [class.text-indigo-600]="hasDiarization()"
                      [class.hover:bg-indigo-50]="hasDiarization()"
                      [class.border-gray-300]="!hasDiarization()"
                      [class.text-gray-400]="!hasDiarization()"
                      [disabled]="!hasDiarization() || downloadingDiarized"
                      (click)="downloadDiarized(record.processing_session)"
                      title="Download with diarization"
                      aria-label="Download with diarization">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M7 8h10M7 12h6m5 2v6H6a2 2 0 01-2-2V6a2 2 0 012-2h8l4 4z" />
                </svg>
                <span class="min-w-[5.5rem]">
                  <ng-container *ngIf="!downloadingDiarized; else diaLoading">Diarization</ng-container>
                  <ng-template #diaLoading>Loading…</ng-template>
                </span>
              </button>
            </div>
          </div>

          <!-- Stat Chips -->
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div class="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3M5 11h14M5 19h14M5 15h14" />
                </svg>
              </div>
              <div class="min-w-0">
                <div class="text-xs text-gray-500">Uploaded</div>
                <div class="text-sm font-medium text-gray-900 truncate">{{ record?.created_at | date:'medium' }}</div>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div class="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20l9-5-9-5-9 5z" />
                </svg>
              </div>
              <div class="min-w-0">
                <div class="text-xs text-gray-500">Duration</div>
                <div class="text-sm font-medium text-gray-900">{{ formatDuration(record?.duration) }}</div>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div class="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-gray-500">Coverage</div>
                <div class="text-sm font-medium text-gray-900">{{ formatCoverage(record?.coverage) }}%</div>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 rounded-lg bg-purple-100 flex-1">
              <div class="h-8 w-8 rounded-md bg-purple-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                </svg>
              </div>
              <div class="min-w-0">
                <div class="text-xs text-gray-500">Reference Doc</div>
                <div class="text-sm font-medium text-gray-900 truncate">
                  {{ record?.reference_document?.name || '—' }}
                  <span class="text-gray-500" *ngIf="record?.reference_document?.document_type">
                    ({{ record?.reference_document?.document_type }})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Audio Player -->
          <div class="mt-4">
            <audio *ngIf="record?.file_path" class="w-full" controls [src]="record?.file_path"></audio>
          </div>
        </div>

        <!-- Content -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Speakers Summary -->
          <div class="bg-white rounded-xl shadow p-6 xl:col-span-1">
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
            <div class="bg-white rounded-xl shadow p-6">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h4 class="text-md font-semibold text-gray-900">Segments</h4>
                <div class="relative">
                  <input
                    type="text"
                    class="border border-gray-300 rounded-md pl-9 pr-3 py-1.5 text-sm w-72"
                    placeholder="Filter by speaker or text…"
                    [(ngModel)]="query"
                  />
                  <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none"
                       stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
                  </svg>
                </div>
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
                      <td class="px-3 py-2 text-sm text-gray-700 align-top whitespace-pre-wrap break-words">
                        {{ seg.text || '—' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div *ngIf="!record?.diarization?.segments?.length" class="text-center py-8">
                <!-- Pending -->
                <div *ngIf="record?.diarization_status === 'pending'" class="flex flex-col items-center gap-3">
                  <div class="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Diarization Queued</p>
                    <p class="text-xs text-gray-500 mt-1">Processing will begin shortly</p>
                  </div>
                </div>

                <!-- Processing -->
                <div *ngIf="record?.diarization_status === 'processing'" class="flex flex-col items-center gap-3">
                  <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Processing Diarization</p>
                    <p class="text-xs text-gray-500 mt-1">This may take a few minutes</p>
                  </div>
                </div>

                <!-- Failed -->
                <div *ngIf="record?.diarization_status === 'failed'" class="flex flex-col items-center gap-3">
                  <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Diarization Failed</p>
                    <p class="text-xs text-gray-500 mt-1">Please try running diarization again from the audio list</p>
                  </div>
                </div>

                <!-- Not Started / Completed but no segments -->
                <div *ngIf="!record?.diarization_status || (record?.diarization_status === 'completed' && !record?.diarization?.segments?.length)" class="flex flex-col items-center gap-3">
                  <div class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">No Segments Available</p>
                    <p class="text-xs text-gray-500 mt-1">
                      <span *ngIf="!record?.diarization_status">Run diarization from the audio list to generate speaker segments</span>
                      <span *ngIf="record?.diarization_status === 'completed'">Diarization completed but no segments were found</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transcript -->
            <div class="bg-white rounded-xl shadow p-6">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-md font-semibold text-gray-900">Full Transcript</h4>
                <button
                  class="p-2 rounded-md border border-gray-300 text-gray-600 hover:text-indigo-600 hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  (click)="copyTranscript()"
                  [disabled]="!transcript"
                  title="Copy transcript"
                  aria-label="Copy transcript"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M9 5h6a2 2 0 012 2v13a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z"/>
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M9 3h6a1 1 0 011 1v1H8V4a1 1 0 011-1z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" class="opacity-70"
                          d="M9 12l2 2 4-4"/>
                  </svg>
                </button>
              </div>
              <div class="text-sm text-gray-700 break-words leading-6">
                {{record.transcription?.text || 'No transcript available.'}}
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .pointer-events-none { pointer-events: none; cursor: not-allowed; }
  `]
})
export class DiarizationDetailComponent implements OnInit {
  loading = false;
  errorMessage = '';
  record: any;
  query = '';
  transcript = '';

  // per-button loading flags
  downloadingProcessed = false;
  downloadingDiarized = false;

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

  // UX helpers
  hasDiarization(): boolean {
    const d = this.record?.diarization;
    if (!d) return false;
    const hasSegments = Array.isArray(d.segments) && d.segments.length > 0;
    const hasText = typeof d === 'string' && d.trim().length > 0;
    const hasTranscript = !!this.record?.transcription?.text;
    return hasSegments || hasText || hasTranscript;
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

  // Status styles
  statusBadgeClass(status?: string) {
    switch ((status || '').toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  statusDotClass(status?: string) {
    switch ((status || '').toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'pending': return 'bg-amber-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }

  // Formatting
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

  // Build transcript from segments
  buildTranscript(rec: any): string {
    const segs = rec?.diarization?.segments || [];
    if (!segs.length) return '';
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
    navigator.clipboard.writeText(this.transcript).catch(() => { });
  }

  // Token helper
  private get token() { return this.auth.getToken(); }

  // Download URL builders (robust)
  buildDownloadUrl(sessionId: string) {
    return `${environment.apiUrl}/download/${this.token}/${sessionId}/`;
  }
  buildDownloadWithDiarizationUrl(sessionId: string) {
    return `${environment.apiUrl}/download/with-diarization/${this.token}/${sessionId}/`;
  }

  // Public click handlers
  async downloadProcessed(sessionId: string) {
    this.errorMessage = '';
    this.downloadingProcessed = true;
    try {
      const apiUrl = this.buildDownloadUrl(sessionId);
      await this.fetchBackendThenDownload(apiUrl, `processed-${sessionId}`);
    } catch (e: any) {
      this.errorMessage = 'Download failed: ' + (e?.message || e);
    } finally {
      this.downloadingProcessed = false;
    }
  }

  async downloadDiarized(sessionId: string) {
    if (!this.hasDiarization()) {
      this.errorMessage = 'Diarization not ready';
      return;
    }
    this.errorMessage = '';
    this.downloadingDiarized = true;
    try {
      const apiUrl = this.buildDownloadWithDiarizationUrl(sessionId);
      await this.fetchBackendThenDownload(apiUrl, `diarized-${sessionId}`);
    } catch (e: any) {
      this.errorMessage = 'Download failed: ' + (e?.message || e);
    } finally {
      this.downloadingDiarized = false;
    }
  }

  /**
   * Core download helper (Option A):
   * - Call backend to get a pre-signed S3/CloudFront URL
   * - Navigate to that URL (no CORS required)
   * - Filename is controlled server-side via Content-Disposition on the signed URL
   */
  private async fetchBackendThenDownload(apiUrl: string, _defaultBaseName: string) {
    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      if (resp.status === 401 || resp.status === 403) {
        throw new Error('Unauthorized – your session/token may be invalid or expired.');
      }
      throw new Error(`API request failed: ${resp.status} ${resp.statusText}`);
    }

    const json = (await resp.json()) as DownloadApiResponse;
    const s3Url = json.processed_docx_url || json.url || json.s3_url;
    if (!s3Url) {
      throw new Error('Server did not return a download URL');
    }

    // trigger download by navigating to the pre-signed URL
    // a.download is ignored cross-origin unless your backend sets Content-Disposition on the signed URL
    const a = document.createElement('a');
    a.href = s3Url;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();

    // optional Safari fallback if pop-up blocking interferes:
    // try { window.open(s3Url, '_blank', 'noopener'); } catch {}
  }
}
