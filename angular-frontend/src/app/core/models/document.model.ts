export interface ReferenceDocument {
  id: string;
  name: string;
  document_type: 'sop' | 'script' | 'guideline' | 'checklist';
  original_filename: string;
  file_size: number;
  content_type: string;
  upload_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  rag_enabled: boolean;
  rag_vector_store_id?: string;
  rag_document_id?: string;
  rag_status?: string;
  rag_uploaded_at?: string;
  rag_ingested_at?: string;
  rag_last_error?: string;
  rag_metadata?: any;
}

export interface UploadDocumentRequest {
  file_path: File;
  document_type?: string;
  document_name?: string;
}

export interface UserDocumentsResponse {
  documents: ReferenceDocument[];
  audio_files: any[];
  total_documents: number;
  total_audio_files: number;
}