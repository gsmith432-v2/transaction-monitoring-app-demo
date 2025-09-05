import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, Transaction, TransactionResponse, Analytics } from '../models/account.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BankingService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/accounts`, {
      headers: this.getHeaders()
    });
  }

  getTransactions(
    accountId: string,
    limit: number = 50,
    offset: number = 0,
    startDate?: string,
    endDate?: string
  ): Observable<TransactionResponse> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<TransactionResponse>(
      `${this.apiUrl}/accounts/${accountId}/transactions`,
      {
        headers: this.getHeaders(),
        params
      }
    );
  }

  getAnalytics(accountId: string, period: number = 30): Observable<Analytics> {
    const params = new HttpParams().set('period', period.toString());

    return this.http.get<Analytics>(
      `${this.apiUrl}/accounts/${accountId}/analytics`,
      {
        headers: this.getHeaders(),
        params
      }
    );
  }

  createTransaction(
    accountId: string,
    transaction: {
      type: string;
      amount: number;
      description: string;
      category?: string;
    }
  ): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.apiUrl}/accounts/${accountId}/transactions`,
      transaction,
      {
        headers: this.getHeaders()
      }
    );
  }
}
