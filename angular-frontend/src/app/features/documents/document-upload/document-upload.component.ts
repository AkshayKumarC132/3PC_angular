import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-6" data-testid="document-upload-title">Upload Document</h2>

      <div *ngIf="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="documentName">
              Document Name (Optional)
            </label>
            <input
              type="text"
              id="documentName"
              formControlName="document_name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter document name"
              data-testid="document-name-input"
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="documentType">
              Document Type
            </label>
            <select
              id="documentType"
              formControlName="document_type"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="document-type-select"
            >
              <option value="sop">SOP</option>
              <option value="script">Script</option>
              <option value="guideline">Guideline</option>
              <option value="checklist">Checklist</option>
            </select>
          </div>

          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="file">
              Document File (PDF, DOCX - Max 150MB)
            </label>
            <input
              type="file"
              id="file"
              (change)="onFileSelected($event)"
              accept=".pdf,.docx"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="document-file-input"
            />
            <div *ngIf="fileError" class="text-red-500 text-sm mt-1">
              {{ fileError }}
            </div>
            <div *ngIf="selectedFile" class="text-sm text-gray-600 mt-2">
              Selected: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
            </div>
          </div>

          <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="mb-4">
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-indigo-600 h-2.5 rounded-full" [style.width.%]="uploadProgress"></div>
            </div>
            <p class="text-sm text-gray-600 mt-2">Uploading: {{ uploadProgress }}%</p>
          </div>

          <button
            type="submit"
            [disabled]="!selectedFile || loading"
            class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="document-upload-button"
          >
            <span *ngIf="!loading">Upload Document</span>
            <span *ngIf="loading">Uploading...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class DocumentUploadComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';
  fileError = '';
  uploadProgress = 0;

  private readonly MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB
  private readonly ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService
  ) {
    this.uploadForm = this.fb.group({
      document_name: [''],
      document_type: ['sop', Validators.required]
    });
  }

  ngOnInit() {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.fileError = '';

    if (file) {
      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        this.fileError = 'File size must be less than 150MB';
        this.selectedFile = null;
        return;
      }

      // Check file extension
      const fileName = file.name.toLowerCase();
      const hasValidExtension = this.ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        this.fileError = 'Only PDF and DOCX files are allowed';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.selectedFile && this.uploadForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';
      this.uploadProgress = 0;

      const uploadData = {
        file_path: this.selectedFile,
        document_type: this.uploadForm.value.document_type,
        document_name: this.uploadForm.value.document_name || this.selectedFile.name
      };

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        if (this.uploadProgress < 90) {
          this.uploadProgress += 10;
        }
      }, 200);

      this.documentService.uploadDocument(uploadData).subscribe({
        next: (response) => {
          clearInterval(progressInterval);
          this.uploadProgress = 100;
          this.loading = false;
          this.successMessage = 'Document uploaded successfully!';
          this.selectedFile = null;
          this.uploadForm.reset({ document_type: 'sop' });
          setTimeout(() => this.uploadProgress = 0, 2000);
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.uploadProgress = 0;
          this.loading = false;
          this.errorMessage = error.error?.error || 'Failed to upload document';
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
}