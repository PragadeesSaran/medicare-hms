import { useGetPrescriptions } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Printer, FileText, Pill } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

export default function Prescriptions() {
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";

  const { data, isLoading } = useGetPrescriptions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Prescriptions</h1>
          <p className="text-slate-500">Manage patient medications and treatment plans.</p>
        </div>
        
        {isDoctor && (
          <Button className="bg-primary text-white" data-testid="button-issue-prescription">
            <Plus className="mr-2 h-4 w-4" /> Issue Prescription
          </Button>
        )}
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-[120px]">Rx ID</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Diagnosis & Meds</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data && data.length > 0 ? (
                    data.map((rx) => (
                      <TableRow key={rx.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-mono text-xs text-slate-500">
                          RX-{rx.id.toString().padStart(5, '0')}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{rx.patientName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-700">{rx.doctorName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm text-slate-900">{rx.diagnosis}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate max-w-[250px]" title={rx.medicines}>
                            <Pill className="h-3 w-3" />
                            {rx.medicines}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-700">
                            {format(new Date(rx.issuedDate), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 text-slate-600 hover:text-primary">
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-slate-600 hover:text-primary">
                              <Printer className="h-4 w-4" />
                              <span className="sr-only">Print</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                        No prescriptions found.
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
