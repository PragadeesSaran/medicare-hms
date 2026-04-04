import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { LayoutDashboard, Users, UserRound, Calendar, FileText, Receipt, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Ensure fetch client uses the token
    setAuthTokenGetter(() => localStorage.getItem("medicare_token"));
  }, []);

  useEffect(() => {
    if (!isAuthenticated && location !== "/" && location !== "/login") {
      setLocation("/login");
    }
  }, [isAuthenticated, location, setLocation]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const role = user?.role || "";

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "patient", "receptionist"] },
    { label: "Patients", href: "/patients", icon: Users, roles: ["admin", "doctor", "receptionist"] },
    { label: "Doctors", href: "/doctors", icon: UserRound, roles: ["admin", "receptionist", "patient"] },
    { label: "Appointments", href: "/appointments", icon: Calendar, roles: ["admin", "doctor", "patient", "receptionist"] },
    { label: "Prescriptions", href: "/prescriptions", icon: FileText, roles: ["admin", "doctor", "patient"] },
    { label: "Billing", href: "/billing", icon: Receipt, roles: ["admin", "receptionist", "patient"] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  const NavLinks = () => (
    <div className="flex flex-col gap-1 w-full">
      {filteredNav.map((item) => {
        const isActive = location.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
            <item.icon className="h-5 w-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1 rounded-md">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <span className="font-bold text-lg tracking-tight">MediCare HMS</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-sidebar text-sidebar-foreground border-sidebar-border w-64 p-0 flex flex-col">
            <div className="p-4 border-b border-sidebar-border/50">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <span className="font-bold text-xl tracking-tight">MediCare</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto py-4 px-3">
              <NavLinks />
            </div>
            <div className="p-4 border-t border-sidebar-border/50 flex items-center justify-between">
              <Link href="/profile" className="flex items-center gap-3">
                <Avatar className="h-8 w-8 bg-sidebar-accent text-sidebar-accent-foreground">
                  <AvatarFallback>{getInitials(user?.fullName || "User")}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{user?.fullName}</span>
                  <span className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</span>
                </div>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-sm">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight">MediCare</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-2 px-4">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-sidebar-border/50">
          <div className="flex items-center justify-between w-full mb-4 px-2">
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Avatar className="h-9 w-9 bg-sidebar-accent text-sidebar-accent-foreground cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarFallback>{getInitials(user?.fullName || "User")}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight truncate w-24">{user?.fullName}</span>
                <span className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { logout(); setLocation("/login"); }} className="text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10" data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-[100dvh] overflow-x-hidden">
        <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
