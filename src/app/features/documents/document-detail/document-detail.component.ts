import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-5xl mx-auto px-4">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/documents" class="text-indigo-600 hover:text-indigo-800">&larr; Back</a>
        <h2 class="text-2xl font-bold text-gray-900">Document Detail</h2>
      </div>

      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-600">Loading document...</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <ng-container *ngIf="!loading && doc">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div class="min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 truncate" [title]="doc.name">{{ doc.name }}</h3>
              <div class="mt-2 text-sm text-gray-700 space-x-3">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ doc.document_type | uppercase }}
                </span>
                <span><span class="font-medium">Status:</span> {{ doc.upload_status || 'unknown' }}</span>
                <span><span class="font-medium">Size:</span> {{ formatFileSize(doc.file_size) }}</span>
                <span><span class="font-medium">Uploaded:</span> {{ doc.created_at | date:'short' }}</span>
                <span *ngIf="doc.updated_at"><span class="font-medium">Updated:</span> {{ doc.updated_at | date:'short' }}</span>
                <span><span class="font-medium">RAG Enabled:</span> {{ doc.rag_enabled ? 'Yes' : 'No' }}</span>
              </div>

              <div class="mt-1 text-xs text-gray-500 truncate" [title]="doc.original_filename">
                Original: {{ doc.original_filename }}
              </div>
            </div>

            <div class="flex items-center gap-2">
              <a *ngIf="doc.file_path" [href]="doc.file_path" target="_blank" rel="noopener"
                 class="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">
                Download
              </a>
              <button class="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                      (click)="copyMeta()">
                Copy Meta
              </button>
            </div>
          </div>
        </div>

        <!-- Extracted Text -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-md font-semibold text-gray-900">Extracted Text</h4>
            <button class="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                    (click)="copyExtracted()"
                    [disabled]="!doc.extracted_text">
              Copy
            </button>
          </div>
          <div class="text-sm text-gray-800 whitespace-pre-wrap break-words leading-6">
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

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService
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

  copyMeta() {
    if (!this.doc) return;
    const meta = { ...this.doc };
    // extracted_text can be large; keep it but you can omit if you want
    navigator.clipboard.writeText(JSON.stringify(meta, null, 2)).catch(() => {});
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
