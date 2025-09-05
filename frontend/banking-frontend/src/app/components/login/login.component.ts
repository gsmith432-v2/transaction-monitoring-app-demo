import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="absolute inset-0 bg-black opacity-20"></div>
      <div class="relative max-w-md w-full space-y-8">
        <!-- Logo and Branding -->
        <div class="text-center">
          <h2 class="text-4xl font-bold text-white mb-2">
            SecureBank
          </h2>
          <p class="text-blue-200 text-lg">
            Your trusted financial partner
          </p>
        </div>

        <!-- Login Card -->
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-semibold text-gray-800 mb-2">Welcome Back</h3>
            <p class="text-gray-600">Sign in to access your account</p>
          </div>

          <form class="space-y-6" (ngSubmit)="onSubmit()">
            <div class="space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  [(ngModel)]="credentials.email"
                  class="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  [(ngModel)]="credentials.password"
                  class="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>

            <button
              type="submit"
              [disabled]="isLoading"
              class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span *ngIf="isLoading">Signing in...</span>
              <span *ngIf="!isLoading">Sign In Securely</span>
            </button>

            <!-- Demo Credentials -->
            <div class="bg-blue-50 border border-blue-300 rounded-xl p-4">
              <h4 class="text-sm font-medium text-blue-900">Demo Account</h4>
              <div class="mt-1 text-sm text-blue-800">
                <p><strong>Email:</strong> demo@bank.com</p>
                <p><strong>Password:</strong> password123</p>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="text-center">
          <p class="text-blue-200 text-sm">
            Protected by 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Login failed. Please try again.';
      }
    });
  }
}
