
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Types
export type Account = {
  id: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  currency: string;
  isConnected: boolean;
};

export type Transaction = {
  id: string;
  date: string;
  recipient: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  type: 'credit' | 'debit';
};

export type Recipient = {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  ifsc: string;
};

type AccountContextType = {
  account: Account | null;
  transactions: Transaction[];
  recipients: Recipient[];
  connectAccount: (accountDetails: Partial<Account>) => void;
  disconnectAccount: () => void;
  initiatePayment: (recipientId: string, amount: number, description: string) => Promise<Transaction>;
  sendReceipt: (transactionId: string, email: string) => Promise<boolean>;
};

// Create context
const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Mock data for initial state
const mockRecipients: Recipient[] = [
  {
    id: '1',
    name: 'Rohit Sharma',
    accountNumber: '12345678901234',
    bankName: 'State Bank of India',
    ifsc: 'SBIN0001234'
  },
  {
    id: '2',
    name: 'Priya Patel',
    accountNumber: '98765432109876',
    bankName: 'HDFC Bank',
    ifsc: 'HDFC0002345'
  },
  {
    id: '3',
    name: 'Amit Kumar',
    accountNumber: '56789012345678',
    bankName: 'ICICI Bank',
    ifsc: 'ICIC0003456'
  }
];

const mockTransactions: Transaction[] = [
  {
    id: 't1',
    date: '2025-05-05T10:30:00',
    recipient: 'Rohit Sharma',
    description: 'Invoice payment #INV-2025-001',
    amount: 25000,
    status: 'completed',
    type: 'debit'
  },
  {
    id: 't2',
    date: '2025-05-04T14:45:00',
    recipient: 'Priya Patel',
    description: 'Monthly salary',
    amount: 75000,
    status: 'completed',
    type: 'debit'
  },
  {
    id: 't3',
    date: '2025-05-03T09:15:00',
    recipient: 'Income from Client X',
    description: 'Project completion payment',
    amount: 150000,
    status: 'completed',
    type: 'credit'
  },
  {
    id: 't4',
    date: '2025-05-02T16:20:00',
    recipient: 'Amit Kumar',
    description: 'Contractor fees',
    amount: 35000,
    status: 'pending',
    type: 'debit'
  },
  {
    id: 't5',
    date: '2025-05-01T11:10:00',
    recipient: 'Monthly interest',
    description: 'Interest credit',
    amount: 1200,
    status: 'completed',
    type: 'credit'
  }
];

export const AccountProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [recipients, setRecipients] = useState<Recipient[]>(mockRecipients);

  const connectAccount = (accountDetails: Partial<Account>) => {
    const newAccount: Account = {
      id: 'acc-' + Date.now().toString(),
      accountNumber: accountDetails.accountNumber || '0000000000',
      bankName: accountDetails.bankName || 'ICICI Bank',
      balance: accountDetails.balance || 250000,
      currency: accountDetails.currency || 'INR',
      isConnected: true
    };
    
    setAccount(newAccount);
  };

  const disconnectAccount = () => {
    setAccount(null);
  };

  const initiatePayment = async (recipientId: string, amount: number, description: string): Promise<Transaction> => {
    const recipient = recipients.find(r => r.id === recipientId);
    
    if (!recipient) {
      throw new Error('Recipient not found');
    }
    
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (account.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Create a new transaction
    const newTransaction: Transaction = {
      id: 't-' + Date.now().toString(),
      date: new Date().toISOString(),
      recipient: recipient.name,
      description,
      amount,
      status: 'completed',
      type: 'debit'
    };
    
    // Update balance
    setAccount({
      ...account,
      balance: account.balance - amount
    });
    
    // Add transaction to list
    setTransactions([newTransaction, ...transactions]);
    
    return newTransaction;
  };

  const sendReceipt = async (transactionId: string, email: string): Promise<boolean> => {
    // This would connect to an API to send an email
    console.log(`Receipt for transaction ${transactionId} sent to ${email}`);
    return true;
  };

  return (
    <AccountContext.Provider
      value={{
        account,
        transactions,
        recipients,
        connectAccount,
        disconnectAccount,
        initiatePayment,
        sendReceipt
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

// Custom hook for using account context
export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};
