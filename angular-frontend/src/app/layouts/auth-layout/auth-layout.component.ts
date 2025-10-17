import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-indigo-900 mb-2">3PC Platform</h1>
          <p class="text-gray-600">Audio Processing & Document Management</p>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: []
})
export class AuthLayoutComponent {}