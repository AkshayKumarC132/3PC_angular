import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ReferenceDocument, UploadDocumentRequest, UserDocumentsResponse } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  uploadDocument(data: UploadDocumentRequest): Observable<ReferenceDocument> {
    const token = this.authService.getToken();
    const formData = new FormData();
    formData.append('file_path', data.file_path);
    if (data.document_type) {
      formData.append('document_type', data.document_type);
    }
    if (data.document_name) {
      formData.append('document_name', data.document_name);
    }

    return this.apiService.post<ReferenceDocument>(
      `/documents/upload/${token}/`,
      formData
    );
  }

  getUserDocuments(): Observable<UserDocumentsResponse> {
    const token = this.authService.getToken();
    return this.apiService.get<UserDocumentsResponse>(`/documents/${token}/`);
  }

  deleteDocument(documentId: string): Observable<any> {
    const token = this.authService.getToken();
    return this.apiService.delete(`/documents/${documentId}/${token}/`);
  }
}