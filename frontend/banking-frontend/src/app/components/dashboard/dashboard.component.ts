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
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center">
              <h1 class="text-3xl font-bold text-gray-900">Banking Dashboard</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">Welcome, {{ currentUser?.firstName }}</span>
              <button
                (click)="logout()"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          
          <!-- Account Overview -->
          <div class="bg-white overflow-hidden shadow rounded-lg mb-6" *ngIf="selectedAccount">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg leading-6 font-medium text-gray-900">Account Overview</h3>
                  <p class="mt-1 text-sm text-gray-500">Account #{{ selectedAccount.accountNumber }}</p>
                </div>
                <div class="text-right">
                  <p class="text-3xl font-bold text-green-600">\${{ selectedAccount.balance.toFixed(2) }}</p>
                  <p class="text-sm text-gray-500">Current Balance</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Analytics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" *ngIf="analytics">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span class="text-white text-sm font-bold">+</span>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Total Income</dt>
                      <dd class="text-lg font-medium text-gray-900">\${{ analytics.totalIncome.toFixed(2) }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span class="text-white text-sm font-bold">-</span>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                      <dd class="text-lg font-medium text-gray-900">\${{ analytics.totalExpenses.toFixed(2) }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span class="text-white text-sm font-bold">=</span>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Net Amount</dt>
                      <dd class="text-lg font-medium" [class]="analytics.netAmount >= 0 ? 'text-green-600' : 'text-red-600'">
                        \${{ analytics.netAmount.toFixed(2) }}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">Last 30 days of account activity</p>
              </div>
              <button
                (click)="loadTransactions()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Refresh
              </button>
            </div>
            <ul class="divide-y divide-gray-200">
              <li *ngFor="let transaction of transactions" class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div 
                        class="w-10 h-10 rounded-full flex items-center justify-center"
                        [class]="transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'"
                      >
                        <span 
                          class="text-sm font-bold"
                          [class]="transaction.amount > 0 ? 'text-green-600' : 'text-red-600'"
                        >
                          {{ transaction.amount > 0 ? '+' : '-' }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ transaction.description }}</div>
                      <div class="text-sm text-gray-500">
                        {{ transaction.type | titlecase }} • {{ transaction.date | date:'short' }}
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div 
                      class="text-sm font-medium"
                      [class]="transaction.amount > 0 ? 'text-green-600' : 'text-red-600'"
                    >
                      {{ transaction.amount > 0 ? '+' : '' }}\${{ Math.abs(transaction.amount).toFixed(2) }}
                    </div>
                    <div class="text-sm text-gray-500">{{ transaction.category | titlecase }}</div>
                  </div>
                </div>
              </li>
              <li *ngIf="transactions.length === 0" class="px-4 py-8 text-center text-gray-500">
                No transactions found
              </li>
            </ul>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-gray-600">Loading...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div class="text-red-800">{{ errorMessage }}</div>
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
