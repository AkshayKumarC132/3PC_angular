import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen">
      <div *ngIf="invalidating$ | async" class="session-overlay">
        <div class="session-overlay__card">
          <span class="session-overlay__spinner"></span>
          <p class="session-overlay__title">Signing you out securely…</p>
          <p class="session-overlay__subtitle">
            {{ (invalidationMessage$ | async) || 'We’ll have you back at the login page in a moment.' }}
          </p>
        </div>
      </div>

      <router-outlet></router-outlet>
    </div>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = '3PC Platform';
  invalidating$: Observable<boolean>;
  invalidationMessage$: Observable<string>;

  constructor(private authService: AuthService) {
    this.invalidating$ = this.authService.invalidatingSession$;
    this.invalidationMessage$ = this.authService.invalidationMessage$;
  }
}
