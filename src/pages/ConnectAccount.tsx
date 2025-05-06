
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { CreditCard, Check, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const accountFormSchema = z.object({
  accountNumber: z
    .string()
    .min(10, { message: 'Account number must be at least 10 digits' })
    .max(20, { message: 'Account number cannot exceed 20 digits' })
    .regex(/^\d+$/, { message: 'Account number must contain only digits' }),
  ifscCode: z
    .string()
    .length(11, { message: 'IFSC code must be exactly 11 characters' })
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'IFSC code must be in the valid format (e.g., ICIC0001234)' }),
  phoneNumber: z
    .string()
    .length(10, { message: 'Phone number must be exactly 10 digits' })
    .regex(/^\d+$/, { message: 'Phone number must contain only digits' }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

const ConnectAccount = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { account, connectAccount } = useAccount();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      accountNumber: '',
      ifscCode: '',
      phoneNumber: '',
    },
  });

  const handleVerification = () => {
    // Simulating OTP verification
    setIsConnecting(true);

    setTimeout(() => {
      setVerificationStep(2);
      setIsConnecting(false);
    }, 1500);
  };

  const handleVerifyOTP = () => {
    setIsConnecting(true);

    setTimeout(() => {
      setIsVerified(true);
      setIsConnecting(false);
      
      toast({
        title: "Verification Successful",
        description: "Your account has been verified successfully.",
      });
    }, 1500);
  };

  const onSubmit = (data: AccountFormValues) => {
    connectAccount({
      accountNumber: data.accountNumber,
      bankName: 'ICICI Bank',
      balance: 250000, // Mock balance
      currency: 'INR',
    });

    toast({
      title: "Account Connected",
      description: "Your ICICI account has been connected successfully.",
    });
    
    navigate('/');
  };

  if (account?.isConnected) {
    return (
      <AppLayout title="Connect Account">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="mt-3">Account Connected</CardTitle>
            <CardDescription>
              Your ICICI current account is already connected.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4">
              <p className="font-medium">Account Details</p>
              <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
              <p className="text-sm text-muted-foreground">{account.bankName}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Connect Account">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <CreditCard className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-center">Connect ICICI Account</CardTitle>
            <CardDescription className="text-center">
              Connect your ICICI current account to start making payouts and viewing transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verificationStep === 1 && !isVerified && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleVerification)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your account number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ifscCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                          <Input placeholder="ICIC0001234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registered Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 10 digit mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isConnecting}>
                    {isConnecting ? 'Verifying...' : 'Send OTP'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            )}
            
            {verificationStep === 2 && !isVerified && (
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground mb-4">
                  We've sent a one-time password to your registered mobile number.
                </p>
                <FormItem>
                  <FormLabel>Enter OTP</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 6-digit OTP" maxLength={6} />
                  </FormControl>
                </FormItem>
                <Button onClick={handleVerifyOTP} className="w-full" disabled={isConnecting}>
                  {isConnecting ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <p className="text-center text-sm">
                  <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => handleVerification()}>
                    Resend OTP
                  </Button>
                </p>
              </div>
            )}
            
            {isVerified && (
              <div className="space-y-4">
                <div className="rounded-md bg-green-50 p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-green-800">Verification Successful</h3>
                  <p className="mt-2 text-sm text-green-700">
                    Your account has been verified. Click connect to proceed.
                  </p>
                </div>
                
                <Button onClick={() => onSubmit(form.getValues())} className="w-full">
                  Connect Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ConnectAccount;
