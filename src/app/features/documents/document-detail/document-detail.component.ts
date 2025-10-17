import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-6xl mx-auto px-4">
      <!-- Top bar -->
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/documents" class="text-indigo-600 hover:text-indigo-800">&larr; Back</a>
        <h2 class="text-2xl font-bold text-gray-900">Document Detail</h2>
      </div>

      <!-- Loading / Error -->
      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-600">Loading document...</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <!-- Content -->
      <ng-container *ngIf="!loading && doc">
        <!-- Card -->
        <div class="bg-white rounded-2xl shadow p-6 mb-6">
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <!-- Left: Title & meta -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-3xl font-semibold text-gray-900 truncate" [title]="doc.name">
                  {{ doc.name }}
                </h3>
                <span
                  class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  [ngClass]="statusPillClass(doc.upload_status)"
                >
                  <span class="inline-block h-2 w-2 rounded-full" [ngClass]="statusDotClass(doc.upload_status)"></span>
                  {{ (doc.upload_status || 'processed') | titlecase }}
                </span>
              </div>

              <div class="text-sm text-indigo-700/80 truncate" *ngIf="doc.id">
                ID: {{ doc.id }}
              </div>

              <!-- Stat tiles (compact) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                <!-- Uploaded -->
                <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div class="flex items-center gap-2.5">
                    <div class="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center">
                      <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div class="leading-tight">
                      <div class="text-[11px] text-gray-500">Uploaded</div>
                      <div class="text-sm font-semibold text-gray-900">
                        {{ doc.created_at | date:'medium' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Type -->
                <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div class="flex items-center gap-2.5">
                    <div class="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 3h6l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 3v4h4"/>
                      </svg>
                    </div>
                    <div class="leading-tight">
                      <div class="text-[11px] text-gray-500">Type</div>
                      <div class="text-sm font-semibold text-gray-900">
                        {{ doc.document_type | uppercase }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Size -->
                <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div class="flex items-center gap-2.5">
                    <div class="h-8 w-8 rounded-md bg-emerald-100 flex items-center justify-center">
                      <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16"/>
                      </svg>
                    </div>
                    <div class="leading-tight">
                      <div class="text-[11px] text-gray-500">Size</div>
                      <div class="text-sm font-semibold text-gray-900">
                        {{ formatFileSize(doc.file_size) }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- RAG -->
                <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div class="flex items-center gap-2.5">
                    <div class="h-8 w-8 rounded-md" [ngClass]="doc.rag_enabled ? 'bg-green-100' : 'bg-gray-100'">
                      <div class="h-full w-full flex items-center justify-center">
                        <svg *ngIf="doc.rag_enabled" class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        <svg *ngIf="!doc.rag_enabled" class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </div>
                    </div>
                    <div class="leading-tight">
                      <div class="text-[11px] text-gray-500">RAG Enabled</div>
                      <div class="text-sm font-semibold" [ngClass]="doc.rag_enabled ? 'text-green-700' : 'text-gray-500'">
                        {{ doc.rag_enabled ? 'Yes' : 'No' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <!-- Original file name -->
              <div class="mt-3 text-sm text-gray-600 truncate" [title]="doc.original_filename">
                <span class="font-medium">Original File Name:</span> {{ doc.original_filename }}
              </div>
            </div>

            <!-- Right: icon actions -->
            <div class="flex items-center gap-3 self-start">
              <!-- Preview -->
              <button
                (click)="togglePreview()"
                class="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
                [class.opacity-50]="!doc.file_path"
                [disabled]="!doc.file_path"
                [title]="showPreview ? 'Hide preview' : 'Preview document'"
                aria-label="Preview document">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>

              <!-- Download -->
              <a *ngIf="doc.file_path"
                 [href]="doc.file_path"
                 target="_blank"
                 rel="noopener"
                 class="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
                 title="Download file"
                 aria-label="Download file">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v10m0 0l-4-4m4 4l4-4M4 20h16"/>
                </svg>
              </a>

              <!-- Copy meta -->
              <button
                (click)="copyMeta()"
                class="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
                title="Copy metadata"
                aria-label="Copy metadata">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12M8 11h12M8 15h12M4 7h.01M4 11h.01M4 15h.01"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Preview panel -->
        <div *ngIf="showPreview" class="bg-white rounded-2xl shadow p-4 mb-6">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="text-md font-semibold text-gray-900">Preview</h4>
            <span class="text-xs text-gray-500" *ngIf="doc.content_type">{{ doc.content_type }}</span>
          </div>

          <div class="w-full overflow-hidden rounded-xl border border-gray-200">
            <iframe
              *ngIf="safePreviewUrl"
              [src]="safePreviewUrl"
              class="w-full h-[75vh]"
              loading="lazy"
              referrerpolicy="no-referrer"
            ></iframe>
          </div>

          <p *ngIf="!safePreviewUrl" class="text-sm text-gray-500 mt-3">
            Preview is not available for this file type.
          </p>
        </div>

        <!-- Extracted text -->
        <div class="bg-white rounded-2xl shadow p-6">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-lg font-semibold text-gray-900">Extracted Text</h4>
            <button
              (click)="copyExtracted()"
              [disabled]="!doc.extracted_text"
              class="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Copy extracted text"
              aria-label="Copy extracted text">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5h6a2 2 0 012 2v13a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 3h6a1 1 0 011 1v1H8V4a1 1 0 011-1z"/>
                <path stroke-linecap="round" stroke-linejoin="round" class="opacity-70" d="M9 12l2 2 4-4"/>
              </svg>
            </button>
          </div>

          <div class="text-sm text-gray-800 whitespace-pre-wrap break-words leading-6 border border-gray-100 rounded-md p-4 bg-gray-50">
            {{ doc.extracted_text || '—' }}
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: []
})
export class DocumentDetailComponent implements OnInit {
  loading = false;
  errorMessage = '';
  doc: any;

  showPreview = false;
  safePreviewUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.fetchDocument(id);
  }

  fetchDocument(id: string) {
    this.loading = true;
    this.documentService.getUserDocuments().subscribe({
      next: (response) => {
        const match = (response.documents || []).find((d: any) => d.id === id);
        if (match) {
          this.doc = match;
          if (this.showPreview) this.safePreviewUrl = this.buildSafePreviewUrl(this.doc);
          this.loading = false;
        } else {
          this.loading = false;
          this.errorMessage = 'Document not found';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load document';
      }
    });
  }

  // --- UI helpers (status styles) ---
  statusPillClass(status?: string) {
    const s = (status || 'processed').toLowerCase();
    if (s === 'processed' || s === 'completed')
      return 'bg-gray-100 text-gray-800';
    if (s === 'processing')
      return 'bg-blue-100 text-blue-800';
    if (s === 'pending')
      return 'bg-amber-100 text-amber-800';
    if (s === 'failed')
      return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
    }
  statusDotClass(status?: string) {
    const s = (status || 'processed').toLowerCase();
    if (s === 'processed' || s === 'completed') return 'bg-gray-400';
    if (s === 'processing') return 'bg-blue-500';
    if (s === 'pending') return 'bg-amber-500';
    if (s === 'failed') return 'bg-red-500';
    return 'bg-gray-400';
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
    if (this.showPreview) {
      this.safePreviewUrl = this.buildSafePreviewUrl(this.doc);
    }
  }

  buildSafePreviewUrl(doc: any): SafeResourceUrl | null {
    if (!doc?.file_path) return null;
    const url = doc.file_path as string;
    const ct = (doc.content_type || '').toLowerCase();
    const isPdf = ct.startsWith('application/pdf') || url.toLowerCase().endsWith('.pdf');
    const isDocx = ct.includes('officedocument.wordprocessingml.document') || url.toLowerCase().endsWith('.docx');
    const isDoc = ct === 'application/msword' || url.toLowerCase().endsWith('.doc');

    let previewUrl: string;
    if (isPdf) {
      previewUrl = url;
    } else if (isDocx || isDoc) {
      const encoded = encodeURIComponent(url);
      previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encoded}`;
    } else {
      const encoded = encodeURIComponent(url);
      previewUrl = `https://docs.google.com/gview?embedded=1&url=${encoded}`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);
  }

  copyMeta() {
    if (!this.doc) return;
    navigator.clipboard.writeText(JSON.stringify(this.doc, null, 2)).catch(() => {});
  }

  copyExtracted() {
    if (!this.doc?.extracted_text) return;
    navigator.clipboard.writeText(this.doc.extracted_text).catch(() => {});
  }

  formatFileSize(bytes: number): string {
    if (!bytes && bytes !== 0) return '—';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
