
import React, { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import {
  LayoutDashboard,
  Send,
  FileText,
  LogOut,
  Menu,
  CreditCard,
  X,
  BellRing,
  UserCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AppLayoutProps = {
  children: ReactNode;
  title: string;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children, title }) => {
  const { toast } = useToast();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/' },
    { name: 'Payouts', icon: <Send className="h-5 w-5" />, path: '/payouts' },
    { name: 'Transactions', icon: <FileText className="h-5 w-5" />, path: '/transactions' },
    { name: 'Connect Account', icon: <CreditCard className="h-5 w-5" />, path: '/connect' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMobileNav}
            >
              {isMobileNavOpen ? <X /> : <Menu />}
            </Button>
            <Link to="/" className="flex items-center">
              <span className="text-icici-blue font-bold text-xl">ICICI</span>
              <span className="text-icici-orange font-bold text-xl">PayPulse</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <BellRing className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>New payment received</DropdownMenuItem>
                <DropdownMenuItem>Account verification pending</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Side navigation - Desktop */}
        <aside className="hidden md:block w-64 bg-sidebar border-r">
          <nav className="p-4 flex flex-col h-full">
            <ul className="space-y-2 flex-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="flex items-center gap-3 px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-md"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-4">
              <Separator className="bg-sidebar-border mb-4" />
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </nav>
        </aside>

        {/* Mobile navigation */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 bg-background">
            <div className="p-4 flex flex-col h-full">
              <Button 
                variant="ghost" 
                size="icon" 
                className="self-end mb-4"
                onClick={toggleMobileNav}
              >
                <X />
              </Button>
              
              <ul className="space-y-2 flex-1">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-md"
                      onClick={toggleMobileNav}
                    >
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <Button 
                variant="ghost" 
                className="w-full justify-start mt-auto"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">{title}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
