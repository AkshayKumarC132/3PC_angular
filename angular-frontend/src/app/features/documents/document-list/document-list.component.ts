import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { ReferenceDocument } from '../../../core/models/document.model';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900" data-testid="document-list-title">Documents</h2>
        <a routerLink="/documents/upload" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700" data-testid="upload-document-link">
          Upload Document
        </a>
      </div>

      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-600">Loading documents...</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div *ngIf="!loading" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900">Total Documents</h3>
              <p class="text-3xl font-bold text-indigo-600">{{ totalDocuments }}</p>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900">Total Audio Files</h3>
              <p class="text-3xl font-bold text-green-600">{{ totalAudioFiles }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="documents.length === 0 && !loading" class="p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by uploading a document.</p>
          <div class="mt-6">
            <a routerLink="/documents/upload" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Upload Document
            </a>
          </div>
        </div>

        <div *ngIf="documents.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Size</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RAG Enabled</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let doc of documents" class="hover:bg-gray-50" [attr.data-testid]="'document-row-' + doc.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ doc.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ doc.document_type | uppercase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatFileSize(doc.file_size) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span [ngClass]="getStatusClass(doc.upload_status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ doc.upload_status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span *ngIf="doc.rag_enabled" class="text-green-600">✓ Yes</span>
                  <span *ngIf="!doc.rag_enabled" class="text-gray-400">✗ No</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ doc.created_at | date:'short' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button (click)="deleteDocument(doc.id)" class="text-red-600 hover:text-red-900" [attr.data-testid]="'delete-document-' + doc.id">
                    Delete
                  </button>
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
export class DocumentListComponent implements OnInit {
  documents: ReferenceDocument[] = [];
  totalDocuments = 0;
  totalAudioFiles = 0;
  loading = false;
  errorMessage = '';

  constructor(private documentService: DocumentService) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.loading = true;
    this.documentService.getUserDocuments().subscribe({
      next: (response) => {
        this.documents = response.documents;
        this.totalDocuments = response.total_documents;
        this.totalAudioFiles = response.total_audio_files;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load documents';
        this.loading = false;
      }
    });
  }

  deleteDocument(documentId: string) {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(documentId).subscribe({
        next: () => {
          this.loadDocuments();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete document';
        }
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}