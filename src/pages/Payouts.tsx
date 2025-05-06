
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAccount } from '@/context/AccountContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogTitle, Dialog, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Send, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const payoutFormSchema = z.object({
  recipientId: z.string({
    required_error: "Please select a recipient",
  }),
  amount: z.string()
    .refine(val => !isNaN(Number(val)), {
      message: "Amount must be a number",
    })
    .refine(val => Number(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  description: z.string()
    .min(5, { message: "Description must be at least 5 characters" })
    .max(100, { message: "Description cannot exceed 100 characters" }),
});

type PayoutFormValues = z.infer<typeof payoutFormSchema>;

const Payouts = () => {
  const { toast } = useToast();
  const { account, recipients, initiatePayment, sendReceipt } = useAccount();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<{
    id: string;
    recipient: string;
    amount: number;
    description: string;
    date: string;
  } | null>(null);
  const [showSendReceiptDialog, setShowSendReceiptDialog] = useState(false);
  const [receiptEmail, setReceiptEmail] = useState('');

  const form = useForm<PayoutFormValues>({
    resolver: zodResolver(payoutFormSchema),
    defaultValues: {
      recipientId: "",
      amount: "",
      description: "",
    },
  });

  if (!account) {
    return (
      <AppLayout title="Payouts">
        <Card>
          <CardHeader>
            <CardTitle>No Account Connected</CardTitle>
            <CardDescription>
              Please connect your ICICI account to initiate payouts.
            </CardDescription>
          </CardHeader>
        </Card>
      </AppLayout>
    );
  }

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

  const onSubmit = async (data: PayoutFormValues) => {
    const amount = Number(data.amount);
    const recipientId = data.recipientId;
    const description = data.description;
    
    try {
      const transaction = await initiatePayment(recipientId, amount, description);
      const recipient = recipients.find(r => r.id === recipientId);
      
      setTransactionDetails({
        id: transaction.id,
        recipient: transaction.recipient,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
      });
      
      setShowSuccessDialog(true);
      form.reset();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };
  
  const handleSendReceipt = async () => {
    if (!transactionDetails || !receiptEmail) return;
    
    try {
      await sendReceipt(transactionDetails.id, receiptEmail);
      toast({
        title: "Receipt Sent",
        description: `Receipt sent to ${receiptEmail}`,
      });
      setShowSendReceiptDialog(false);
      setReceiptEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send receipt. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AppLayout title="Payouts">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Initiate Payment</CardTitle>
              <CardDescription>
                Send money to your recipients from your ICICI current account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="recipientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a recipient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {recipients.map((recipient) => (
                              <SelectItem key={recipient.id} value={recipient.id}>
                                {recipient.name} - {recipient.bankName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (INR)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What's this payment for?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="submit" className="w-full">
                        <Send className="mr-2 h-4 w-4" />
                        Send Payment
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to send this payment? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
                          Confirm Payment
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Account Balance</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold">
                {formatCurrency(account.balance)}
              </p>
              <p className="text-muted-foreground mt-2">
                Available for payments
              </p>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Account: {account.accountNumber}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Payment Successful
          </DialogTitle>
          <DialogDescription>
            Your payment has been successfully processed.
          </DialogDescription>
          
          {transactionDetails && (
            <div className="p-4 border rounded-lg bg-muted mt-4">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm font-medium">Recipient</p>
                <p className="text-sm">{transactionDetails.recipient}</p>
                
                <p className="text-sm font-medium">Amount</p>
                <p className="text-sm">{formatCurrency(transactionDetails.amount)}</p>
                
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm">{transactionDetails.description}</p>
                
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm">{formatDate(transactionDetails.date)}</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => {
                setShowSuccessDialog(false);
                setShowSendReceiptDialog(true);
              }}
              variant="outline"
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Receipt
            </Button>
            <Button onClick={() => setShowSuccessDialog(false)} className="flex-1">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Send Receipt Dialog */}
      <Dialog open={showSendReceiptDialog} onOpenChange={setShowSendReceiptDialog}>
        <DialogContent>
          <DialogTitle>Send Receipt</DialogTitle>
          <DialogDescription>
            Send a receipt for this transaction to the recipient's email.
          </DialogDescription>
          
          {transactionDetails && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Transaction Details</p>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">Recipient:</span> {transactionDetails.recipient}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Amount:</span> {formatCurrency(transactionDetails.amount)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Description:</span> {transactionDetails.description}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Date:</span> {formatDate(transactionDetails.date)}
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
            <Button variant="outline" onClick={() => setShowSendReceiptDialog(false)}>
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

export default Payouts;
