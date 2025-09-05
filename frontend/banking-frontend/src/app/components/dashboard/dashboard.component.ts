import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BankingService } from '../../services/banking.service';
import { Account, Transaction, Analytics } from '../../models/account.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <!-- Header -->
      <header class="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">SecureBank</h1>
              <p class="text-sm text-gray-600">Personal Banking Dashboard</p>
            </div>
            <div class="flex items-center space-x-6">
              <div class="text-right">
                <p class="text-sm text-gray-500">Welcome back,</p>
                <p class="font-semibold text-gray-900">{{ currentUser?.firstName }}</p>
              </div>
              <button
                (click)="logout()"
                class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0 space-y-8">
          
          <!-- Account Overview -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl overflow-hidden" *ngIf="selectedAccount">
            <div class="px-8 py-8 text-white">
              <div class="flex items-center justify-between">
                <div class="space-y-2">
                  <h3 class="text-2xl font-bold">Primary Account</h3>
                  <p class="text-blue-200 text-lg">Account #{{ selectedAccount.accountNumber }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-blue-200 mb-1">Available Balance</p>
                  <p class="text-4xl font-bold text-white">\${{ selectedAccount.balance.toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Analytics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6" *ngIf="analytics">
            <!-- Total Income -->
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div class="px-6 py-8">
                <div class="flex items-center justify-between">
                  <div class="space-y-2">
                    <div>
                      <p class="text-sm font-medium text-gray-600">Total Income</p>
                      <p class="text-2xl font-bold text-gray-900">\${{ analytics.totalIncome.toFixed(2) }}</p>
                    </div>
                  </div>
                  <div class="text-green-500 text-sm font-medium">
                    +12.5%
                  </div>
                </div>
              </div>
            </div>

            <!-- Total Expenses -->
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div class="px-6 py-8">
                <div class="flex items-center justify-between">
                  <div class="space-y-2">
                    <div>
                      <p class="text-sm font-medium text-gray-600">Total Expenses</p>
                      <p class="text-2xl font-bold text-gray-900">\${{ analytics.totalExpenses.toFixed(2) }}</p>
                    </div>
                  </div>
                  <div class="text-red-500 text-sm font-medium">
                    +8.2%
                  </div>
                </div>
              </div>
            </div>

            <!-- Net Amount -->
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div class="px-6 py-8">
                <div class="flex items-center justify-between">
                  <div class="space-y-2">
                    <div>
                      <p class="text-sm font-medium text-gray-600">Net Amount</p>
                      <p class="text-2xl font-bold" [class]="analytics.netAmount >= 0 ? 'text-green-600' : 'text-red-600'">
                        \${{ analytics.netAmount.toFixed(2) }}
                      </p>
                    </div>
                  </div>
                  <div [class]="analytics.netAmount >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm font-medium">
                    {{ analytics.netAmount >= 0 ? '+4.3%' : '-2.1%' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div class="px-8 py-6 border-b border-gray-200/50">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">Recent Transactions</h3>
                  <p class="text-sm text-gray-600">Last 30 days of account activity</p>
                </div>
                <button
                  (click)="loadTransactions()"
                  class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200/50">
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200/50">
                  <tr *ngFor="let transaction of transactions" class="hover:bg-gray-50/50 transition-colors duration-200">
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 bg-gray-100 rounded-lg font-medium text-sm">{{ transaction.type | titlecase }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm font-semibold text-gray-900">{{ transaction.description }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm text-blue-600 font-medium">{{ transaction.category | titlecase }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-600">
                        <div>{{ transaction.date | date:'MMM d, y' }}</div>
                        <div class="text-xs text-gray-500">{{ transaction.date | date:'shortTime' }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div 
                        class="text-lg font-bold"
                        [class]="transaction.amount > 0 ? 'text-green-600' : 'text-red-600'"
                      >
                        {{ transaction.amount > 0 ? '+' : '' }}\${{ Math.abs(transaction.amount).toFixed(2) }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div *ngIf="transactions.length === 0" class="px-8 py-12 text-center">
                <p class="text-lg text-gray-500">No transactions found</p>
                <p class="text-sm text-gray-400">Your recent transactions will appear here</p>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-12">
            <div class="inline-flex items-center space-x-3">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p class="text-lg text-gray-600 font-medium">Loading your data...</p>
            </div>
          </div>

          <!-- Error State -->
          <div *ngIf="errorMessage" class="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-lg">
            <div class="text-red-800 font-medium">{{ errorMessage }}</div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  transactions: Transaction[] = [];
  analytics: Analytics | null = null;
  isLoading = false;
  errorMessage = '';
  Math = Math;

  constructor(
    private authService: AuthService,
    private bankingService: BankingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bankingService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        if (accounts.length > 0) {
          this.selectedAccount = accounts[0];
          this.loadTransactions();
          this.loadAnalytics();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load accounts';
        this.isLoading = false;
      }
    });
  }

  loadTransactions(): void {
    if (!this.selectedAccount) return;

    this.bankingService.getTransactions(this.selectedAccount.id, 20).subscribe({
      next: (response) => {
        this.transactions = response.transactions;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load transactions';
      }
    });
  }

  loadAnalytics(): void {
    if (!this.selectedAccount) return;

    this.bankingService.getAnalytics(this.selectedAccount.id, 30).subscribe({
      next: (analytics) => {
        this.analytics = analytics;
      },
      error: (error) => {
        console.error('Failed to load analytics', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
