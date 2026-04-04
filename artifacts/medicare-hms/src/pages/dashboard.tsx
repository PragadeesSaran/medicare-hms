import { useGetDashboardStats, useGetDashboardChartData, useGetDashboardRecentAppointments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserRound, Calendar, DollarSign, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";

const COLORS = ['#0EA5E9', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: chartData, isLoading: chartLoading } = useGetDashboardChartData();
  const { data: appointments, isLoading: appointmentsLoading } = useGetDashboardRecentAppointments();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.fullName}. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Patients", value: stats?.totalPatients, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Total Doctors", value: stats?.totalDoctors, icon: UserRound, color: "text-indigo-600", bg: "bg-indigo-100" },
          { title: "Today's Appointments", value: stats?.todayAppointments, icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-100" },
          { title: "Total Revenue", value: stats ? `$${stats.totalRevenue}` : null, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-100" },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value || 0}</h3>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Chart */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Appointments Overview (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            ) : (
              <div className="h-[300px] w-full">
                {chartData?.appointmentsByDay && chartData.appointmentsByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.appointmentsByDay} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(val) => format(new Date(val), 'MMM dd, yyyy')}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="scheduled" name="Scheduled" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="completed" name="Completed" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                      <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">No chart data available</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Pie Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Appointment Status</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-64 w-64 rounded-full" />
              </div>
            ) : (
              <div className="h-[300px] w-full">
                {chartData?.statusBreakdown && chartData.statusBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.statusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                      >
                        {chartData.statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value} appointments`, 'Count']}
                      />
                      <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">No status data available</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments && appointments.length > 0 ? (
                    appointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium text-slate-900">{apt.patientName}</TableCell>
                        <TableCell>{apt.doctorName}</TableCell>
                        <TableCell>{format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{apt.timeSlot}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(apt.status)}>
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                        No recent appointments found.
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
