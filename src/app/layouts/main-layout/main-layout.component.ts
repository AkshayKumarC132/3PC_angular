import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navbar -->
      <nav class="bg-white shadow border-b border-gray-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
          
            <!-- Left: Brand -->
            <div class="flex items-center space-x-1">
              <span class="text-indigo-600 font-extrabold text-xl">3PC</span>
              <span class="text-gray-800 font-semibold text-xl">Platform</span>
            </div>

            <!-- Center: Nav Links -->
            <div class="hidden sm:flex items-center space-x-2">
              <a routerLink="/dashboard"
                routerLinkActive="text-indigo-600 bg-indigo-50"
                [routerLinkActiveOptions]="{ exact: true }"
                class="group inline-flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 text-sm font-medium transition">
                <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition"
                    fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4a1 1 0 001-1V14a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 001 1h2a1 1 0 001-1V10" />
                </svg>
                <span>Dashboard</span>
              </a>

              <a routerLink="/documents" routerLinkActive="text-indigo-600 bg-indigo-50"
                class="group inline-flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 text-sm font-medium transition">
                <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition"
                    fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 3h6l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 3v4h4"/>
                </svg>
                <span>Documents</span>
              </a>

              <a routerLink="/audio" routerLinkActive="text-indigo-600 bg-indigo-50"
                class="group inline-flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 text-sm font-medium transition">
                <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition"
                    fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 19V7a3 3 0 116 0v8a3 3 0 11-6 0"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 13h6"/>
                </svg>
                <span>Audios</span>
              </a>
            </div>


            <!-- Right: Profile -->
            <div class="relative">
              <button
                (click)="toggleUserMenu()"
                class="flex items-center space-x-2 focus:outline-none group"
              >
                <!-- Default avatar if user has no image -->
                <div
                  class="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-100 border border-gray-300 text-indigo-600 font-bold text-sm group-hover:ring-2 group-hover:ring-indigo-500 transition"
                >
                  {{ getUserInitials(user?.name) }}
                </div>
                <div class="hidden sm:block text-left">
                  <p class="text-sm font-medium text-gray-900">{{ user?.name || 'User' }}</p>
                  <p class="text-xs text-gray-500">{{ user?.email || 'user@example.com' }}</p>
                </div>
                <svg
                  class="w-5 h-5 text-gray-500 group-hover:text-indigo-500 transition"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown -->
              <div
                *ngIf="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10 animate-fadeIn"
              >
                <a routerLink="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                  Profile
                </a>
                <a routerLink="/settings"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                  Settings
                </a>
                <button
                  (click)="logout()"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.15s ease-out;
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  user: User | null = null;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.authState$.subscribe(state => {
      this.user = state.user;
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('button') && !target.closest('.absolute')) {
      this.showUserMenu = false;
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }

  getUserInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
}
