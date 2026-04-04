import { useState } from "react";
import { useGetDoctors, useCreateDoctor, useGetDepartments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, UserRound, Briefcase, CalendarClock, Building } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetDoctorsQueryKey } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";

export default function Doctors() {
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const { data: departments } = useGetDepartments();
  const { data, isLoading } = useGetDoctors(
    { department: departmentFilter !== "all" ? departmentFilter : undefined },
    { query: { queryKey: getGetDoctorsQueryKey({ department: departmentFilter !== "all" ? departmentFilter : undefined }) } }
  );

  const createDoctor = useCreateDoctor({
    mutation: {
      onSuccess: () => {
        toast({ title: "Doctor created successfully" });
        setIsAddModalOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetDoctorsQueryKey() });
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Failed to create doctor", description: error.data?.error || "Unknown error" });
      }
    }
  });

  const handleAddDoctor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const deptId = formData.get("departmentId") as string;
    
    createDoctor.mutate({
      data: {
        fullName: formData.get("fullName") as string,
        specialization: formData.get("specialization") as string,
        departmentId: deptId ? parseInt(deptId) : undefined,
        experienceYrs: parseInt(formData.get("experienceYrs") as string) || 0,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      }
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Medical Staff</h1>
          <p className="text-slate-500">Directory of all doctors and specialists.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments?.map(dept => (
                <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin && (
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white" data-testid="button-add-doctor">
                  <Plus className="mr-2 h-4 w-4" /> Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Doctor</DialogTitle>
                  <DialogDescription>
                    Enter the doctor's details and credentials.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDoctor} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" name="fullName" required placeholder="Dr. Jane Smith" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" required placeholder="jane.smith@medicare.com" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="password">Password (for login) *</Label>
                      <Input id="password" name="password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization *</Label>
                      <Input id="specialization" name="specialization" required placeholder="Cardiology" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experienceYrs">Experience (Years)</Label>
                      <Input id="experienceYrs" name="experienceYrs" type="number" min="0" defaultValue="0" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="departmentId">Department</Label>
                      <Select name="departmentId">
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments?.map(dept => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createDoctor.isPending}>
                      {createDoctor.isPending ? "Saving..." : "Save Doctor"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2 border-b bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow group border-slate-200">
              <CardHeader className="pb-4 border-b bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 bg-primary/10 text-primary border border-primary/20">
                      <AvatarFallback className="font-semibold">{getInitials(doctor.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-slate-900 group-hover:text-primary transition-colors">
                        {doctor.fullName}
                      </CardTitle>
                      <CardDescription className="text-sm font-medium text-slate-500">
                        {doctor.specialization}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 bg-white">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span className="truncate" title={doctor.departmentName || "General"}>
                      {doctor.departmentName || "General"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <span>{doctor.experienceYrs || 0} Years Exp.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Status:</span>
                      {doctor.isAvailable ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Available</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Unavailable</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                    <CalendarClock className="mr-2 h-4 w-4" /> View Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <UserRound className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No doctors found</h3>
            <p className="text-slate-500 max-w-sm mt-1">
              There are no doctors matching your current filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
