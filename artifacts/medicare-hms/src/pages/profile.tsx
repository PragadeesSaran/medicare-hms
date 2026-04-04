import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, UserRound, Key, Calendar, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
        <p className="text-slate-500">Manage your profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1 border-slate-200 shadow-sm overflow-hidden h-max">
          <div className="h-24 bg-gradient-to-r from-blue-900 to-primary w-full" />
          <CardContent className="px-6 pb-6 pt-0 relative">
            <div className="flex justify-center -mt-12 mb-4">
              <Avatar className="h-24 w-24 border-4 border-white bg-slate-100 text-slate-700 shadow-sm text-2xl">
                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-bold text-slate-900">{user.fullName}</h2>
              <div className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 uppercase tracking-wider border border-blue-100">
                {user.role}
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <UserRound className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-900">@{user.username}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Joined {format(new Date(user.createdAt || new Date()), 'MMMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-700 font-medium">Account Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Area */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue={user.fullName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm border-t-4 border-t-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-slate-500" /> Change Password
              </CardTitle>
              <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button variant="outline" className="border-slate-300">Update Password</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
