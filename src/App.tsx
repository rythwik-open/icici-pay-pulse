
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccountProvider } from "./context/AccountContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Payouts from "./pages/Payouts";
import Transactions from "./pages/Transactions";
import ConnectAccount from "./pages/ConnectAccount";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AccountProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/payouts" element={<Payouts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/connect" element={<ConnectAccount />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AccountProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
