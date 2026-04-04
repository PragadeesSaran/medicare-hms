import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.fullName}`,
        });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.data?.error || "Invalid credentials",
        });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !role) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all fields",
      });
      return;
    }
    loginMutation.mutate({
      data: { username, password, role },
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-2 w-full bg-primary" />
          <CardHeader className="space-y-3 pb-6 text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">MediCare HMS</CardTitle>
            <CardDescription>
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" data-testid="select-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loginMutation.isPending}
                  data-testid="input-username"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loginMutation.isPending}
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={loginMutation.isPending}
                data-testid="button-submit-login"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t bg-gray-50/50 p-6">
            <div className="text-sm text-center mb-4 text-muted-foreground font-medium">Demo Credentials</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-gray-200 shadow-sm cursor-pointer hover:border-primary transition-colors" onClick={() => { setUsername("admin"); setPassword("admin123"); setRole("admin"); }}>
                <span className="font-semibold block text-primary">Admin</span>
                <span className="text-muted-foreground block">admin / admin123</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200 shadow-sm cursor-pointer hover:border-primary transition-colors" onClick={() => { setUsername("doctor1"); setPassword("doctor123"); setRole("doctor"); }}>
                <span className="font-semibold block text-primary">Doctor</span>
                <span className="text-muted-foreground block">doctor1 / doctor123</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200 shadow-sm cursor-pointer hover:border-primary transition-colors" onClick={() => { setUsername("patient1"); setPassword("patient123"); setRole("patient"); }}>
                <span className="font-semibold block text-primary">Patient</span>
                <span className="text-muted-foreground block">patient1 / patient123</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200 shadow-sm cursor-pointer hover:border-primary transition-colors" onClick={() => { setUsername("receptionist1"); setPassword("rec123"); setRole("receptionist"); }}>
                <span className="font-semibold block text-primary">Receptionist</span>
                <span className="text-muted-foreground block">receptionist1 / rec123</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
