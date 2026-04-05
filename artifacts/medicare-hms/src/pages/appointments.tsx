import { useState } from "react";
import { useGetAppointments, useGetDoctors, useGetPatients, useCreateAppointment } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Calendar, Clock, MoreHorizontal, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAppointmentsQueryKey } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

export default function Appointments() {
  const [dateFilter, setDateFilter] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointmentsData, isLoading } = useGetAppointments(
    { date: dateFilter || undefined },
    { query: { queryKey: getGetAppointmentsQueryKey({ date: dateFilter || undefined }) } }
  );

  const { data: patientsData } = useGetPatients({ limit: 100 });
  const { data: doctorsData } = useGetDoctors();

  const createAppointment = useCreateAppointment({
    mutation: {
      onSuccess: () => {
        toast({ title: "Appointment booked successfully" });
        setIsAddModalOpen(false);
        // Reset form
        setSelectedPatientId("");
        setSelectedDoctorId("");
        setAppointmentDate("");
        setTimeSlot("");
        setNotes("");
        queryClient.invalidateQueries({ queryKey: getGetAppointmentsQueryKey() });
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Failed to book appointment", description: (error.data as { error?: string })?.error || "Unknown error" });
      }
    }
  });

  const handleBookAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || !appointmentDate || !timeSlot) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please fill all required fields" });
      return;
    }
    
    createAppointment.mutate({
      data: {
        patientId: parseInt(selectedPatientId),
        doctorId: parseInt(selectedDoctorId),
        appointmentDate: appointmentDate,
        timeSlot: timeSlot,
        notes: notes || undefined
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Generate simple time slots for demo purposes
  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM"
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Appointments</h1>
          <p className="text-slate-500">Manage patient bookings and schedules.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-[160px] bg-white"
          />
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white" data-testid="button-book-appointment">
                <Plus className="mr-2 h-4 w-4" /> Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
                <DialogDescription>
                  Schedule a new consultation for a patient.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBookAppointment} className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Select Patient *</Label>
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Search patient..." />
                      </SelectTrigger>
                      <SelectContent>
                        {patientsData?.patients?.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.fullName} (PT-{p.id})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctorId">Select Doctor *</Label>
                    <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Search doctor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {doctorsData?.map(d => (
                          <SelectItem key={d.id} value={d.id.toString()}>{d.fullName} - {d.specialization}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="appointmentDate">Date *</Label>
                      <Input 
                        id="appointmentDate" 
                        type="date" 
                        required 
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeSlot">Time Slot *</Label>
                      <Select value={timeSlot} onValueChange={setTimeSlot}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map(slot => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes / Reason for Visit</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Brief description of symptoms..." 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="resize-none h-20"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createAppointment.isPending}>
                    {createAppointment.isPending ? "Booking..." : "Confirm Booking"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointmentsData?.appointments && appointmentsData.appointments.length > 0 ? (
                    appointmentsData.appointments.map((apt) => (
                      <TableRow key={apt.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-mono text-xs text-slate-500">APT-{apt.id.toString().padStart(4, '0')}</TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900 flex items-center gap-2">
                            <User className="h-3 w-3 text-slate-400" />
                            {apt.patientName}
                          </div>
                          {apt.notes && <div className="text-xs text-slate-500 truncate max-w-[200px] mt-1" title={apt.notes}>{apt.notes}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{apt.doctorName}</div>
                          <div className="text-xs text-slate-500">{apt.departmentName || 'General'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-700 mt-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {apt.timeSlot}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(apt.status)}>
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer">
                                <FileText className="mr-2 h-4 w-4 text-slate-500" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                        No appointments found for the selected criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
