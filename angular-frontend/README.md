# 3PC Platform - Angular Frontend

A comprehensive Angular 17 application for audio processing and document management with standalone components.

## Features

### Authentication
- User Registration
- User Login
- User Profile Management
- Token-based Authentication (stored in localStorage)

### Document Management
- Upload Documents (PDF, DOCX - max 150MB)
- View Document List
- Document Type Selection (SOP, Script, Guideline, Checklist)
- RAG (Retrieval-Augmented Generation) Support

### Audio Processing
- Upload Audio Files (MP3, MP4, WAV - max 150MB)
- Process Audio with Transcription
- View Audio File List
- Audio Processing Sessions
- Coverage Analysis

### Advanced Features
- Download Processed Documents with Transcription
- Download Processed Documents with Diarization
- Speaker Diarization
- Speaker Profile Mapping
- Real-time Processing Status

### Settings
- User Settings (Language, Notifications)
- System Settings (Admin Only)
- Audit Logs

### Admin Panel
- User Management
- User Details & Editing
- Admin Dashboard
- System Statistics

## Tech Stack

- **Angular 17** - Standalone Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **RxJS** - Reactive programming
- **Angular Router** - Navigation
- **Angular HttpClient** - API communication

## Backend Integration

- Backend API URL: `http://localhost:8000/api/`
- Token-based authentication
- RESTful API endpoints

## Development

### Install Dependencies
```bash
cd /app/angular-frontend
yarn install
```

### Run Development Server
```bash
ng serve
```

Navigate to `http://localhost:4200/`

### Build for Production
```bash
ng build --configuration production
```

## Project Structure

```
src/app/
├── core/              # Core services, guards, interceptors
│   ├── services/      # API, Auth, Document, Audio, Settings, Admin services
│   ├── guards/        # Auth and Admin guards
│   ├── interceptors/  # HTTP interceptors
│   └── models/        # TypeScript interfaces
├── features/          # Feature modules
│   ├── auth/          # Authentication components
│   ├── documents/     # Document management
│   ├── audio/         # Audio processing
│   ├── settings/      # Settings pages
│   └── admin/         # Admin panel
├── layouts/           # Layout components
│   ├── auth-layout/   # Layout for login/register
│   └── main-layout/   # Main app layout
└── shared/            # Shared components and utilities
```

## API Endpoints

### Authentication
- `POST /register/` - Register new user
- `POST /login/` - User login
- `POST /logout/<token>/` - User logout
- `GET /profile/<token>/` - Get user profile
- `PUT /profile/<token>/` - Update user profile

### Documents
- `POST /documents/upload/<token>/` - Upload document
- `GET /documents/<token>/` - Get user documents

### Audio
- `POST /upload/<token>/` - Upload and process audio
- `GET /audio-records/<token>/` - Get audio records
- `GET /download/<token>/<session_id>/` - Download with transcription
- `GET /download/with-diarization/<token>/<session_id>/` - Download with diarization
- `POST /audio/<token>/diarization/run/` - Run diarization
- `POST /audio/<token>/diarization/map/` - Map speaker profile

### Settings
- `GET /settings/user/<token>/` - Get user settings
- `PUT /settings/user/<token>/` - Update user settings
- `GET /settings/system/<token>/` - Get system settings
- `PUT /settings/system/<token>/` - Update system settings
- `GET /audit-logs/<token>/` - Get audit logs

### Admin
- `GET /admin/users/<token>/` - Get all users
- `GET /admin/user/<user_id>/<token>/` - Get user details
- `PUT /admin/user/<user_id>/<token>/` - Update user
- `DELETE /admin/user/<user_id>/<token>/` - Delete user
- `GET /admin/dashboard-summary/<token>/` - Get dashboard summary

## Features Implementation

### 1. Register ✓
- Form validation
- Role selection
- Error handling

### 2. Login ✓
- Email/password authentication
- Token storage
- Redirect to dashboard

### 3. Logout ✓
- Token invalidation
- Clear local storage
- Redirect to login

### 4. Profile ✓
- View user details
- Update name and theme
- Display membership info

### 5. Document Upload ✓
- File type validation
- Size validation (150MB max)
- Progress indicator
- Document type selection

### 6. Document List View ✓
- Table with all documents
- File size display
- Status indicators
- RAG status
- Delete functionality

### 7. Audio Upload ✓
- Audio file validation
- Multiple upload options
- Reference document selection
- Processing feedback

### 8. Audio List ✓
- All audio files with status
- Duration display
- Coverage percentage
- Quick actions

### 9. Download Document with Transcription ✓
- Session ID input
- Direct download link

### 10. Download Document with Diarization ✓
- Session ID input
- Speaker-labeled download

### 11. Re-Run Diarization ✓
- Run diarization on existing audio
- Status updates

### 12. Speaker Profile Mapping ✓
- Map speaker labels to names
- Profile management
- View existing mappings

### Additional Features ✓
- User Settings
- System Settings
- Audit Logs
- Admin Dashboard
- User Management
- Responsive Design

## License

MIT