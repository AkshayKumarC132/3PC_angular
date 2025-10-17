import { Injectable } from '@angular/core';
import { Observable, defer, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { AudioFile, ProcessingResult, UploadAudioRequest, SpeakerMapping } from '../models/audio.model';

interface AudioListResponse {
  count: number;
  next: string | null;    // e.g. "http://localhost:8000/api/audio-records/<token>/?page=2"
  previous: string | null;
  results: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  /** Get a page of audio records (defaults to page 1). */
  getAudioRecords(page = 1): Observable<AudioListResponse> {
    const token = this.authService.getToken();
    return this.apiService.get<AudioListResponse>(`/audio-records/${token}/?page=${page}`);
  }

  /** Upload audio (and optional text/doc info) and start processing. */
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

  /** Build URL to download processed DOCX. */
  downloadProcessed(sessionId: string): string {
    const token = this.authService.getToken();
    return `${this.apiService['baseUrl']}/download/${token}/${sessionId}/`;
  }

  /** Build URL to download processed DOCX with diarization. */
  downloadWithDiarization(sessionId: string): string {
    const token = this.authService.getToken();
    return `${this.apiService['baseUrl']}/download/with-diarization/${token}/${sessionId}/`;
  }

  /** Trigger diarization run for an existing audio record. */
  runDiarization(audioId: string): Observable<any> {
    const token = this.authService.getToken();
    return this.apiService.post(
      `/audio/${token}/diarization/run/`,
      { audio_id: audioId }
    );
  }

  /** Map a speaker profile to an audio (speaker labeling). */
  mapSpeakerProfile(mapping: SpeakerMapping): Observable<any> {
    const token = this.authService.getToken();
    return this.apiService.post(
      `/audio/${token}/diarization/map/`,
      mapping
    );
  }

  /** Fetch existing speaker mappings for a given audio record. */
  getSpeakerMappings(audioId: string): Observable<any[]> {
    const token = this.authService.getToken();
    return this.apiService.get<any[]>(
      `/audio/${token}/${audioId}/diarization/map/`
    );
  }

  /**
   * Find a single audio record by ID by paging through getAudioRecords().
   * If not found after exhausting pages, errors out.
   *
   * Usage: audioService.findAudioRecordById(id).subscribe(...)
   */
  findAudioRecordById(id: string): Observable<any> {
    return defer(() => this.fetchPageForId(1, id));
  }

  // -------------------- private helpers --------------------

  /** Recursively fetch pages until the record is found or there are no more pages. */
  private fetchPageForId(page: number, id: string): Observable<any> {
    return this.getAudioRecords(page).pipe(
      switchMap((resp) => {
        const found = (resp.results || []).find((r: any) => r.id === id);
        if (found) return of(found);

        const nextPage = this.extractPageNumber(resp.next);
        if (nextPage) {
          return this.fetchPageForId(nextPage, id);
        }
        return throwError(() => new Error('Record not found'));
      })
    );
  }

  /**
   * Extract ?page=N from a "next" URL like:
   *   http://host/api/audio-records/<token>/?page=2
   * Works with absolute or relative URLs.
   */
  private extractPageNumber(nextUrl: string | null): number | null {
    if (!nextUrl) return null;
    try {
      const url = new URL(nextUrl, window.location.origin);
      const page = url.searchParams.get('page');
      return page ? Number(page) : null;
    } catch {
      const match = nextUrl.match(/[\?&]page=(\d+)/);
      return match ? Number(match[1]) : null;
    }
  }
}
