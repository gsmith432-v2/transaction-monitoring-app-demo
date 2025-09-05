export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  status: string;
  createdAt: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface Analytics {
  period: number;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  categoryBreakdown: { [key: string]: { total: number; count: number } };
}
