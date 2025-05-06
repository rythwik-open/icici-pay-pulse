
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAccount, Transaction } from '@/context/AccountContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TrendingUp, Send, AlertCircle, X, Mail, Filter } from 'lucide-react';

const Transactions = () => {
  const { toast } = useToast();
  const { account, transactions, sendReceipt } = useAccount();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [receiptEmail, setReceiptEmail] = useState('');
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);

  if (!account) {
    return (
      <AppLayout title="Transactions">
        <Card>
          <CardHeader>
            <CardTitle>No Account Connected</CardTitle>
            <CardDescription>
              Please connect your ICICI account to view transactions.
            </CardDescription>
          </CardHeader>
        </Card>
      </AppLayout>
    );
  }
  
  const handleSendReceipt = async () => {
    if (!selectedTransaction || !receiptEmail) return;
    
    try {
      await sendReceipt(selectedTransaction.id, receiptEmail);
      toast({
        title: "Receipt Sent",
        description: `Receipt sent to ${receiptEmail}`,
      });
      setShowReceiptDialog(false);
      setReceiptEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send receipt. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const openSendReceiptDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowReceiptDialog(true);
  };
  
  const filteredTransactions = transactions
    .filter(transaction => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        transaction.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const statusMatch = statusFilter === 'all' || transaction.status === statusFilter;
      
      // Type filter
      const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
      
      return searchMatch && statusMatch && typeMatch;
    })
    .sort((a, b) => {
      if (dateSort === 'asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-amber-500';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <AppLayout title="Transactions">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <Input
                  placeholder="Search by recipient or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={dateSort} 
                onValueChange={(value) => setDateSort(value as 'asc' | 'desc')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="p-4 hover:bg-muted rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded-full ${
                      transaction.status === 'failed' ? 'bg-red-100' : 
                      transaction.type === 'credit' ? 'bg-green-100' : 
                      transaction.status === 'pending' ? 'bg-amber-100' : 
                      'bg-blue-100'
                    }`}>
                      {transaction.status === 'failed' ? (
                        <X className="h-5 w-5 text-red-600" />
                      ) : transaction.type === 'credit' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : transaction.status === 'pending' ? (
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      ) : (
                        <Send className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.recipient}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <p className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : ''}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs">
                        <span className={`${getStatusColor(transaction.status)} mr-1 font-medium`}>
                          {transaction.status}
                        </span>
                        <span className="text-muted-foreground">{formatDate(transaction.date)}</span>
                      </p>
                    </div>
                    {transaction.status === 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openSendReceiptDialog(transaction)}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Receipt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Receipt</DialogTitle>
            <DialogDescription>
              Send a receipt for the transaction to the recipient's email.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Transaction Details</p>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">Recipient:</span> {selectedTransaction.recipient}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Amount:</span> {formatCurrency(selectedTransaction.amount)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Date:</span> {formatDate(selectedTransaction.date)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Description:</span> {selectedTransaction.description}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Recipient Email</p>
                <Input
                  placeholder="Enter email address"
                  type="email"
                  value={receiptEmail}
                  onChange={(e) => setReceiptEmail(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReceipt} disabled={!receiptEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Send Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Transactions;
