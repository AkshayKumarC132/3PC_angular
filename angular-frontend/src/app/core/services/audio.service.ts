import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { AudioFile, ProcessingResult, UploadAudioRequest, SpeakerMapping } from '../models/audio.model';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  getAudioRecords(): Observable<AudioFile[]> {
    const token = this.authService.getToken();
    return this.apiService.get<AudioFile[]>(`/audio-records/${token}/`);
  }

  uploadAndProcess(data: UploadAudioRequest): Observable<ProcessingResult> {
    const token = this.authService.getToken();
    const formData = new FormData();
    formData.append('audio_file', data.audio_file);
    
    if (data.text_file) {
      formData.append('text_file', data.text_file);
    }
    if (data.existing_document_id) {
      formData.append('existing_document_id', data.existing_document_id);
    }
    if (data.document_type) {
      formData.append('document_type', data.document_type);
    }
    if (data.document_name) {
      formData.append('document_name', data.document_name);
    }

    return this.apiService.post<ProcessingResult>(
      `/upload/${token}/`,
      formData
    );
  }

  downloadProcessed(sessionId: string): string {
    const token = this.authService.getToken();
    return `${this.apiService['baseUrl']}/download/${token}/${sessionId}/`;
  }

  downloadWithDiarization(sessionId: string): string {
    const token = this.authService.getToken();
    return `${this.apiService['baseUrl']}/download/with-diarization/${token}/${sessionId}/`;
  }

  runDiarization(audioId: string): Observable<any> {
    const token = this.authService.getToken();
    return this.apiService.post(
      `/audio/${token}/diarization/run/`,
      { audio_id: audioId }
    );
  }

  mapSpeakerProfile(mapping: SpeakerMapping): Observable<any> {
    const token = this.authService.getToken();
    return this.apiService.post(
      `/audio/${token}/diarization/map/`,
      mapping
    );
  }

  getSpeakerMappings(audioId: string): Observable<any[]> {
    const token = this.authService.getToken();
    return this.apiService.get<any[]>(
      `/audio/${token}/diarization/map/?audio_id=${audioId}`
    );
  }
}