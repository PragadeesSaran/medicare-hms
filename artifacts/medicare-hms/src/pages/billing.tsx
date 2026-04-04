import { useState } from "react";
import { useGetBills, useGetBillStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, CheckCircle, Clock, DollarSign, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

export default function Billing() {
  const { user } = useAuth();
  const canManageBilling = user?.role === "admin" || user?.role === "receptionist";

  const { data: billsData, isLoading: billsLoading } = useGetBills();
  const { data: statsData, isLoading: statsLoading } = useGetBillStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Billing & Invoices</h1>
          <p className="text-slate-500">Manage patient invoices and track payments.</p>
        </div>
        
        {canManageBilling && (
          <Button className="bg-primary text-white" data-testid="button-generate-bill">
            <Plus className="mr-2 h-4 w-4" /> Generate Bill
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-blue-100 text-blue-600">
              <Receipt className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Total Billed</p>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : <h3 className="text-2xl font-bold text-slate-900">${statsData?.totalBilled || 0}</h3>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Total Collected</p>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : <h3 className="text-2xl font-bold text-emerald-700">${statsData?.totalCollected || 0}</h3>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-amber-100 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Pending Amount</p>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : <h3 className="text-2xl font-bold text-amber-600">${statsData?.pendingAmount || 0}</h3>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {billsLoading ? (
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
                    <TableHead className="w-[120px]">Invoice ID</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billsData?.bills && billsData.bills.length > 0 ? (
                    billsData.bills.map((bill) => (
                      <TableRow key={bill.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-mono text-xs text-slate-500">
                          INV-{bill.id.toString().padStart(6, '0')}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{bill.patientName}</div>
                          {bill.doctorName && <div className="text-xs text-slate-500">Dr. {bill.doctorName}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-700">
                            {format(new Date(bill.billDate), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold text-slate-900">${bill.totalAmount.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400">Fees: ${bill.consultationFee} | Meds: ${bill.medicineCost}</div>
                        </TableCell>
                        <TableCell>
                          {bill.paymentStatus === 'paid' ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {bill.paymentStatus === 'pending' && canManageBilling && (
                              <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-white">
                                <DollarSign className="mr-1 h-3 w-3" /> Pay
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="h-8 border-slate-200">
                              <Receipt className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                        No invoices found.
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
