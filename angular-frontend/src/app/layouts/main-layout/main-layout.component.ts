import { Component, OnInit } from '@angular/core';
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
      <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-indigo-600">3PC Platform</h1>
            </div>
            <div class="flex items-center space-x-4">
              <a routerLink="/dashboard" routerLinkActive="text-indigo-600" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
              <a routerLink="/documents" routerLinkActive="text-indigo-600" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Documents</a>
              <a routerLink="/audio" routerLinkActive="text-indigo-600" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Audio</a>
              <a routerLink="/settings" routerLinkActive="text-indigo-600" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Settings</a>
              <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="text-indigo-600" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Admin</a>
              <div class="relative">
                <button (click)="toggleUserMenu()" class="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 focus:outline-none">
                  <span class="text-sm font-medium">{{ user?.name || 'User' }}</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div *ngIf="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <a routerLink="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                  <button (click)="logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
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
  styles: []
})
export class MainLayoutComponent implements OnInit {
  user: User | null = null;
  isAdmin = false;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.authState$.subscribe(state => {
      this.user = state.user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}