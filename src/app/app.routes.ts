import { Routes } from '@angular/router';
import { authGuard, adminGuard, redirectIfAuthenticatedGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

// Import all components
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ProfileComponent } from './features/auth/profile/profile.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

import { DocumentUploadComponent } from './features/documents/document-upload/document-upload.component';
import { DocumentListComponent } from './features/documents/document-list/document-list.component';
import { DocumentDetailComponent } from './features/documents/document-detail/document-detail.component';


import { AudioUploadComponent } from './features/audio/audio-upload/audio-upload.component';
import { AudioListComponent } from './features/audio/audio-list/audio-list.component';
import { DownloadTranscriptionComponent } from './features/audio/download-transcription/download-transcription.component';
import { SpeakerMappingComponent } from './features/audio/speaker-mapping/speaker-mapping.component';

import { UserSettingsComponent } from './features/settings/user-settings/user-settings.component';
import { SystemSettingsComponent } from './features/settings/system-settings/system-settings.component';
import { AuditLogsComponent } from './features/settings/audit-logs/audit-logs.component';

import { UserListComponent } from './features/admin/user-list/user-list.component';
import { UserDetailComponent } from './features/admin/user-detail/user-detail.component';
import { DashboardComponent as AdminDashboardComponent } from './features/admin/dashboard/dashboard.component';

export const routes: Routes = [
  // Auth routes with auth layout
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [redirectIfAuthenticatedGuard],
    children: [
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },

  // Protected routes with main layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },

      // Document routes
      { path: 'documents', component: DocumentListComponent },
      { path: 'documents/upload', component: DocumentUploadComponent },
      { path: 'documents/:id', component: DocumentDetailComponent },

      // Audio routes
      { path: 'audio', component: AudioListComponent },
      { path: 'audio/upload', component: AudioUploadComponent },
      { path: 'audio/download', component: DownloadTranscriptionComponent },
      { path: 'audio/speaker-mapping/:id', component: SpeakerMappingComponent },
      { path: 'audio/diarization/:id', loadComponent: () => import('./features/audio/diarization-detail/diarization-detail.component').then(m => m.DiarizationDetailComponent) },


      // Settings routes
      { path: 'settings', redirectTo: '/settings/user', pathMatch: 'full' },
      { path: 'settings/user', component: UserSettingsComponent },
      { path: 'settings/system', component: SystemSettingsComponent },
      { path: 'settings/audit-logs', component: AuditLogsComponent },

      // Admin routes
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: '', component: AdminDashboardComponent },
          { path: 'users', component: UserListComponent },
          { path: 'users/:id', component: UserDetailComponent }
        ]
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '/login' }
];