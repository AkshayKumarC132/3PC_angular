import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AudioService } from '../../../core/services/audio.service';
import { DocumentService } from '../../../core/services/document.service';
import { ReferenceDocument } from '../../../core/models/document.model';

@Component({
  selector: 'app-audio-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-6" data-testid="audio-upload-title">Upload & Process Audio</h2>

      <div *ngIf="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ successMessage }}
        <div *ngIf="processingResult" class="mt-2 text-sm">
          <p><strong>Session ID:</strong> {{ processingResult.session_id }}</p>
          <p><strong>Coverage:</strong> {{ processingResult.coverage }}%</p>
          <p><strong>Matched Words:</strong> {{ processingResult.matched_words }} / {{ processingResult.total_words }}</p>
        </div>
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
          <!-- Audio File Upload -->
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="audioFile">
              Audio File (MP3, MP4, WAV - Max 150MB) *
            </label>
            <input
              type="file"
              id="audioFile"
              (change)="onAudioFileSelected($event)"
              accept=".mp3,.mp4,.wav"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="audio-file-input"
            />
            <div *ngIf="audioFileError" class="text-red-500 text-sm mt-1">{{ audioFileError }}</div>
            <div *ngIf="selectedAudioFile" class="text-sm text-gray-600 mt-2">
              Selected: {{ selectedAudioFile.name }} ({{ formatFileSize(selectedAudioFile.size) }})
            </div>
          </div>

          <!-- Upload Option Selection -->
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Reference Document Option</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="radio" value="none" formControlName="uploadOption" class="mr-2" />
                <span class="text-sm">No reference document (RAG matching only)</span>
              </label>
              <label class="flex items-center">
                <input type="radio" value="new" formControlName="uploadOption" class="mr-2" />
                <span class="text-sm">Upload new reference document</span>
              </label>
              <label class="flex items-center">
                <input type="radio" value="existing" formControlName="uploadOption" class="mr-2" />
                <span class="text-sm">Use existing document</span>
              </label>
            </div>
          </div>

          <!-- New Document Upload -->
          <div *ngIf="uploadForm.value.uploadOption === 'new'" class="mb-4 p-4 bg-gray-50 rounded-md">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="textFile">
              Text Document (PDF, DOCX - Max 50MB)
            </label>
            <input
              type="file"
              id="textFile"
              (change)="onTextFileSelected($event)"
              accept=".pdf,.docx"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="text-file-input"
            />
            <div *ngIf="textFileError" class="text-red-500 text-sm mt-1">{{ textFileError }}</div>
            <div *ngIf="selectedTextFile" class="text-sm text-gray-600 mt-2">
              Selected: {{ selectedTextFile.name }} ({{ formatFileSize(selectedTextFile.size) }})
            </div>

            <div class="mt-4">
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

            <div class="mt-4">
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
          </div>

          <!-- Existing Document Selection -->
          <div *ngIf="uploadForm.value.uploadOption === 'existing'" class="mb-4 p-4 bg-gray-50 rounded-md">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="existingDocument">
              Select Existing Document
            </label>
            <select
              id="existingDocument"
              formControlName="existing_document_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="existing-document-select"
            >
              <option value="">-- Select a document --</option>
              <option *ngFor="let doc of existingDocuments" [value]="doc.id">{{ doc.name }}</option>
            </select>
          </div>

          <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="mb-4">
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-indigo-600 h-2.5 rounded-full" [style.width.%]="uploadProgress"></div>
            </div>
            <p class="text-sm text-gray-600 mt-2">Processing: {{ uploadProgress }}%</p>
          </div>

          <button
            type="submit"
            [disabled]="!selectedAudioFile || loading"
            class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="audio-upload-button"
          >
            <span *ngIf="!loading">Upload & Process</span>
            <span *ngIf="loading">Processing...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class AudioUploadComponent implements OnInit {
  uploadForm: FormGroup;
  selectedAudioFile: File | null = null;
  selectedTextFile: File | null = null;
  existingDocuments: ReferenceDocument[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  audioFileError = '';
  textFileError = '';
  uploadProgress = 0;
  processingResult: any = null;

  private readonly MAX_AUDIO_SIZE = 150 * 1024 * 1024; // 150MB
  private readonly MAX_TEXT_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.mp4', '.wav'];
  private readonly ALLOWED_TEXT_EXTENSIONS = ['.pdf', '.docx'];

  constructor(
    private fb: FormBuilder,
    private audioService: AudioService,
    private documentService: DocumentService,
    private router: Router
  ) {
    this.uploadForm = this.fb.group({
      uploadOption: ['none', Validators.required],
      document_name: [''],
      document_type: ['sop'],
      existing_document_id: ['']
    });
  }

  ngOnInit() {
    this.loadExistingDocuments();
  }

  loadExistingDocuments() {
    this.documentService.getUserDocuments().subscribe({
      next: (response) => {
        this.existingDocuments = response.documents;
      },
      error: (error) => {
        console.error('Failed to load documents', error);
      }
    });
  }

  onAudioFileSelected(event: any) {
    const file = event.target.files[0];
    this.audioFileError = '';

    if (file) {
      if (file.size > this.MAX_AUDIO_SIZE) {
        this.audioFileError = 'Audio file size must be less than 150MB';
        this.selectedAudioFile = null;
        return;
      }

      const fileName = file.name.toLowerCase();
      const hasValidExtension = this.ALLOWED_AUDIO_EXTENSIONS.some(ext => fileName.endsWith(ext));

      if (!hasValidExtension) {
        this.audioFileError = 'Only MP3, MP4, and WAV files are allowed';
        this.selectedAudioFile = null;
        return;
      }

      this.selectedAudioFile = file;
    }
  }

  onTextFileSelected(event: any) {
    const file = event.target.files[0];
    this.textFileError = '';

    if (file) {
      if (file.size > this.MAX_TEXT_SIZE) {
        this.textFileError = 'Document file size must be less than 50MB';
        this.selectedTextFile = null;
        return;
      }

      const fileName = file.name.toLowerCase();
      const hasValidExtension = this.ALLOWED_TEXT_EXTENSIONS.some(ext => fileName.endsWith(ext));

      if (!hasValidExtension) {
        this.textFileError = 'Only PDF and DOCX files are allowed';
        this.selectedTextFile = null;
        return;
      }

      this.selectedTextFile = file;
    }
  }

  onSubmit() {
    if (!this.selectedAudioFile) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.uploadProgress = 0;
    this.processingResult = null;

    const uploadData: any = { audio_file: this.selectedAudioFile };
    const uploadOption = this.uploadForm.value.uploadOption;

    if (uploadOption === 'new' && this.selectedTextFile) {
      uploadData.text_file = this.selectedTextFile;
      uploadData.document_name = this.uploadForm.value.document_name || this.selectedTextFile.name;
      uploadData.document_type = this.uploadForm.value.document_type;
    } else if (uploadOption === 'existing' && this.uploadForm.value.existing_document_id) {
      uploadData.existing_document_id = this.uploadForm.value.existing_document_id;
    }

    // Simulate progress up to 90% with gentle easing
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        const step =
          this.uploadProgress < 40 ? 4 :
            this.uploadProgress < 70 ? 3 : 2;
        this.uploadProgress = Math.min(this.uploadProgress + step, 90);
      }
    }, 250);

    this.audioService.uploadAndProcess(uploadData).subscribe({
      next: (response) => {
        // API finished; smoothly complete to 100% first
        clearInterval(progressInterval);
        const completeInterval = setInterval(() => {
          if (this.uploadProgress < 100) {
            this.uploadProgress = Math.min(this.uploadProgress + 5, 100);
          } else {
            clearInterval(completeInterval);
            this.loading = false;
            this.processingResult = response;
            this.successMessage = 'Audio processed successfully!';

            // Clear form & files
            this.selectedAudioFile = null;
            this.selectedTextFile = null;
            this.uploadForm.reset({ uploadOption: 'none', document_type: 'sop', existing_document_id: '', document_name: '' });

            // Small delay so user sees 100%, then redirect to Audio
            setTimeout(() => {
              this.router.navigate(['/audio']);
            }, 2000); // 2 seconds (adjust up to 5000 if you prefer)
          }
        }, 80);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.uploadProgress = 0;
        this.loading = false;
        this.errorMessage = error?.error?.error || 'Failed to process audio';
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
