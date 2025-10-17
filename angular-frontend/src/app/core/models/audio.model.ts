export interface AudioFile {
  id: string;
  original_filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration?: number;
  coverage?: number;
  created_at: string;
  updated_at: string;
}

export interface ProcessingSession {
  id: string;
  matched_words: number;
  total_words: number;
  coverage: number;
  created_at: string;
  expires_at: string;
  reference_document: any;
  audio_file: AudioFile;
}

export interface UploadAudioRequest {
  audio_file: File;
  text_file?: File;
  existing_document_id?: string;
  document_type?: string;
  document_name?: string;
}

export interface ProcessingResult {
  session_id: string;
  matched_words: number;
  total_words: number;
  coverage: number;
  reference_document_id: string;
  audio_file_id: string;
  matched_content: string;
  missing_content: string;
  entire_document: string;
  processing_time: number;
}

export interface SpeakerProfile {
  id: number;
  name: string;
  embedding?: any;
  created_at: string;
  updated_at: string;
}

export interface SpeakerMapping {
  audio_id: string;
  speaker_label: string;
  name: string;
  profile_id?: number;
}