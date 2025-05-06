
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAccount, Transaction } from '@/context/AccountContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, AlertCircle, TrendingUp, Send } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const { account, transactions } = useAccount();
  const [activeTab, setActiveTab] = useState<string>("recent");

  const getRecentTransactions = (): Transaction[] => {
    return transactions.slice(0, 5);
  };

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
    });
  };

  return (
    <AppLayout title="Dashboard">
      {!account ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Connect Your Account</CardTitle>
              <CardDescription>
                Connect your ICICI current account to start making payments
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <CreditCard className="h-16 w-16 text-icici-blue mb-4" />
              <p className="text-muted-foreground mb-6 text-center">
                You need to connect your ICICI current account before you can make payments or view transactions.
              </p>
              <Link to="/connect">
                <Button>
                  Connect Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account Card */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="pb-2">
                <CardDescription>Account</CardDescription>
                <CardTitle className="flex justify-between">
                  <span className="text-xl">{account.bankName}</span>
                  <span className="text-2xl font-bold">{formatCurrency(account.balance)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="text-sm text-muted-foreground mb-3 sm:mb-0">
                    <p>Account Number: {account.accountNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/payouts">
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        New Payout
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/payouts" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Send className="h-4 w-4 mr-2" />
                    New Payout
                  </Button>
                </Link>
                <Link to="/transactions" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Transactions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Link to="/transactions">
                  <Button variant="ghost" size="sm" className="text-sm">
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
              <Tabs defaultValue="recent" onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-xs grid-cols-2">
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {activeTab === "recent" ? (
                <div className="space-y-2">
                  {getRecentTransactions().length > 0 ? (
                    getRecentTransactions().map((transaction) => (
                      <div key={transaction.id} className="p-3 hover:bg-muted rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded-full ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-blue-100'}`}>
                            {transaction.type === 'credit' ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <Send className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.recipient}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {transaction.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : ''}`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs flex items-center">
                            <span className={`${getStatusColor(transaction.status)} mr-1 font-medium`}>{transaction.status}</span>
                            <span className="text-muted-foreground">{formatDate(transaction.date)}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground">No recent transactions</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.filter(t => t.status === 'pending').length > 0 ? (
                    transactions.filter(t => t.status === 'pending').map((transaction) => (
                      <div key={transaction.id} className="p-3 hover:bg-muted rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded-full bg-amber-100">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.recipient}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {transaction.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            -{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs flex items-center">
                            <span className="text-amber-500 mr-1 font-medium">pending</span>
                            <span className="text-muted-foreground">{formatDate(transaction.date)}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground">No pending transactions</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
};

export default Index;
