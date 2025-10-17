import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-speaker-mapping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900" data-testid="speaker-mapping-title">Speaker Profile Mapping</h2>
        <a routerLink="/audio" class="text-indigo-600 hover:text-indigo-700">Back to Audio List</a>
      </div>

      <div *ngIf="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Add Speaker Mapping</h3>
        
        <form [formGroup]="mappingForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" for="speakerLabel">
                Speaker Label
              </label>
              <input
                type="text"
                id="speakerLabel"
                formControlName="speaker_label"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., SPEAKER_01"
                data-testid="speaker-label-input"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" for="speakerName">
                Speaker Name
              </label>
              <input
                type="text"
                id="speakerName"
                formControlName="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., John Doe"
                data-testid="speaker-name-input"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" for="profileId">
                Profile ID (Optional)
              </label>
              <input
                type="number"
                id="profileId"
                formControlName="profile_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Leave empty for new profile"
                data-testid="profile-id-input"
              />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="mappingForm.invalid || loading"
            class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="add-mapping-button"
          >
            <span *ngIf="!loading">Add Speaker Mapping</span>
            <span *ngIf="loading">Adding...</span>
          </button>
        </form>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Existing Mappings</h3>
        
        <div *ngIf="loadingMappings" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p class="mt-2 text-gray-600">Loading mappings...</p>
        </div>

        <div *ngIf="!loadingMappings && mappings.length === 0" class="text-center py-8 text-gray-500">
          No speaker mappings found for this audio file.
        </div>

        <div *ngIf="!loadingMappings && mappings.length > 0" class="space-y-3">
          <div *ngFor="let mapping of mappings" class="flex items-center justify-between p-4 bg-gray-50 rounded-md" [attr.data-testid]="'mapping-' + mapping.speaker_label">
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ mapping.speaker_label }}</p>
              <p class="text-sm text-gray-600">{{ mapping.name }}</p>
              <p class="text-xs text-gray-500" *ngIf="mapping.profile_id">Profile ID: {{ mapping.profile_id }}</p>
            </div>
            <button (click)="deleteMapping(mapping.id)" class="text-red-600 hover:text-red-900 text-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SpeakerMappingComponent implements OnInit {
  mappingForm: FormGroup;
  audioId = '';
  mappings: any[] = [];
  loading = false;
  loadingMappings = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private audioService: AudioService,
    private route: ActivatedRoute
  ) {
    this.mappingForm = this.fb.group({
      speaker_label: ['', Validators.required],
      name: ['', Validators.required],
      profile_id: ['']
    });
  }

  ngOnInit() {
    this.audioId = this.route.snapshot.paramMap.get('id') || '';
    if (this.audioId) {
      this.loadMappings();
    }
  }

  loadMappings() {
    this.loadingMappings = true;
    this.audioService.getSpeakerMappings(this.audioId).subscribe({
      next: (mappings) => {
        this.mappings = mappings;
        this.loadingMappings = false;
      },
      error: (error) => {
        this.loadingMappings = false;
        console.error('Failed to load mappings', error);
      }
    });
  }

  onSubmit() {
    if (this.mappingForm.valid && this.audioId) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const mapping = {
        audio_id: this.audioId,
        ...this.mappingForm.value
      };

      this.audioService.mapSpeakerProfile(mapping).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Speaker mapping added successfully!';
          this.mappingForm.reset();
          this.loadMappings();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.error || 'Failed to add speaker mapping';
        }
      });
    }
  }

  deleteMapping(mappingId: number) {
    if (confirm('Are you sure you want to delete this mapping?')) {
      // Implement delete functionality
      this.loadMappings();
    }
  }
}