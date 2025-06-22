// app/dentist/[dentistId]/schedule/page.tsx
"use client";

import React, { useState, useEffect, useContext } from 'react';
import { Calendar, Clock, User, Search, Plus, X, Edit } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { AuthContext } from '@/context/auth-context';
import axios from 'axios';

interface Appointment {
  appointment_id: number;
  patient_id: string;
  dentist_id: string;
  date: string;
  time_from: string;
  time_to: string;
  fee: number;
  note: string;
  status: string;
  payment_status: string;
  patient: {
    patient_id: string,
    name: string,
    email: string,
    profile_picture: string
  };
}

interface BlockedDate {
  blocked_date_id: number;
  dentist_id: string;
  date: string;
  time_from: string;
  time_to: string;
}

interface DentistScheduleProps {
  params: {
    dentistId: string;
  };
}

interface DentistWorkInfo {
  work_days_from: string,
  work_days_to: string,
  work_time_from: string,
  work_time_to: string,
  appointment_duration: string,
  appointment_fee: number
}

// Date formatting utility function
const formatDate = (dateString: string) => {
  return dateString.split('T')[0]; // Extract YYYY-MM-DD from ISO string
};

export default function DentistSchedulePage({ params }: DentistScheduleProps) {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { user, isLoadingAuth, isLoggedIn } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("today");
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isBlockTimeOpen, setIsBlockTimeOpen] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingBlockedSlots, setLoadingBlockedSlots] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [creatingBlockSlot, setCreatingBlockSlot] = useState(false);
  const [deletingBlock, setDeletingBlock] = useState(false);
  const [dentistWorkInfo, setDentistWorkInfo] = useState<DentistWorkInfo>();

  //States for creating new appointment
  const [patient_id, setPatient_id] = useState("");
  const [date, setDate] = useState("");
  const [time_from, setTimeFrom] = useState("");
  const [time_to, setTimeTo] = useState("");
  const [note, setNote] = useState("");

  //States for creating new block slot
  const [blockDate, setBlockDate] = useState("");
  const [blockTimeFrom, setBlockTimeFrom] = useState("");
  const [blockTimeTo, setBlockTimeTo] = useState("");

  const [timeSlots, setTimeSlots] = useState([""]);

  const today = new Date().toISOString().split('T')[0];

  function addMinutesToTime(timeFrom: string, durationMinutesStr: string): string {
    const [hoursFrom, minutesFrom] = timeFrom.split(":").map(Number);
    const durationMinutes = Number(durationMinutesStr);

    let totalMinutes = hoursFrom * 60 + minutesFrom + durationMinutes;

    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;

    const hh = newHours.toString().padStart(2, "0");
    const mm = newMinutes.toString().padStart(2, "0");

    return `${hh}:${mm}`;
  };

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const response = await axios.get(
        `${backendURL}/appointments/fordentist/${user.id}`
      );
      if (response.status === 500) {
        throw new Error("Internal server error");
      }
      console.log("Fetched appointments:", response.data); // Debug log
      setAppointments(response.data);
    }
    catch (err: any) {
      console.error("Error fetching appointments:", err);
      window.alert(err.message);
    }
    finally {
      setLoadingAppointments(false);
    }
  };

  const fetchBlockedSlots = async () => {
    setLoadingBlockedSlots(true);
    try {
      const response = await axios.get(
        `${backendURL}/blocked-dates/fordentist/${user.id}`
      );
      if (response.status === 500) {
        throw new Error("Internal Server Error");
      }
      console.log("Fetched blocked slots:", response.data); // Debug log
      setBlockedDates(response.data);
    }
    catch (err: any) {
      console.error("Error fetching blocked slots:", err);
      window.alert(err.message);
    }
    finally {
      setLoadingBlockedSlots(false);
    }
  };

  const handleBlockDeletion = async (blocked_date_id: number) => {
    setDeletingBlock(true);
    try{
      const response = await axios.delete(
        `${backendURL}/blocked-dates/${blocked_date_id}`
      );
      if(response.status == 500){
        throw new Error("Error Deleting Block Slot");
      }
      window.alert("Block Slot Successfully Deleted");
    }
    catch(err: any){
      window.alert(err.message);
    }
    finally{
      setDeletingBlock(false);
    }
  }

  const fetchDentistWorkInfo = async () => {
    try {
      const response = await axios.get(
        `${backendURL}/dentists/getworkinfo/${user.id}`
      );
      if (response.status == 500) {
        throw new Error("Internal Server Error");
      }
      setDentistWorkInfo(response.data);
    }
    catch (err: any) {
      window.alert(err.message);
    }
    finally {

    }
  };

  const generateTimeSlots = (workInfo: DentistWorkInfo) => {
    const slots: string[] = [];

    const [startHour, startMin] = workInfo.work_time_from.split(":").map(Number);
    const [endHour, endMin] = workInfo.work_time_to.split(":").map(Number);
    const duration = parseInt(workInfo.appointment_duration, 10); // in minutes

    let start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    while (start + duration <= end) {
      const hour = Math.floor(start / 60);
      const min = start % 60;
      const formatted = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
      slots.push(formatted);
      start += duration;
    }

    setTimeSlots(slots);
  };

  const handleAppointmentCreation = async () => {
    setCreatingAppointment(true);
    try {
      const timeTo = addMinutesToTime(time_from, dentistWorkInfo?.appointment_duration || "0");

      const response = await axios.post(
        `${backendURL}/appointments/`,
        {
          patient_id: patient_id,
          dentist_id: user.id,
          date: date,
          time_from: time_from,
          time_to: timeTo,
          fee: dentistWorkInfo?.appointment_fee,
          note: note,
          status: "confirmed",
          payment_status: "not-paid"
        }
      );

      if (response.status !== 201) {
        throw new Error("Error Creating Appointment");
      } else {
        window.alert("Appointment Created Successfully");
      }
    } catch (err: any) {
      window.alert(err.message);
    } finally {
      setCreatingAppointment(false);
    }
  };

  const handleBlockSlotCreation = async () => {
    setCreatingBlockSlot(true);
    try {
      const response = await axios.post(
        `${backendURL}/blocked-dates/`,
        {
          dentist_id: user.id,
          date: blockDate,
          time_from: blockTimeFrom,
          time_to: blockTimeTo
        }
      );
      if (response.status != 201) {
        throw new Error("Internal Server Error");
      }
      window.alert("Block Slot Created Successfully");
    }
    catch (err: any) {
      window.alert(err.message);
    }
    finally {
      setCreatingBlockSlot(false);
    }
  }


  // Filter appointments based on selected date and search term
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = formatDate(apt.date); // Format the appointment date
    const matchesDate = aptDate === selectedDate;
    const matchesSearch = searchTerm === "" ||
      apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.note?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  });

  // Get appointments for different time periods
  const todayAppointments = appointments.filter(apt => formatDate(apt.date) === today);
  const upcomingAppointments = appointments.filter(apt => formatDate(apt.date) > today);
  const pastAppointments = appointments.filter(apt => formatDate(apt.date) < today);

  // Filter by search term for each category
  const getFilteredAppointmentsByTab = (tabAppointments: Appointment[]) => {
    return tabAppointments.filter(apt =>
      searchTerm === "" ||
      apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.note?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Fixed: Filter blocked dates for selected date instead of today only
  const selectedDateBlockedSlots = blockedDates.filter(block => formatDate(block.date) === selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isTimeSlotBlocked = (time: string) => {
    return selectedDateBlockedSlots.some(block => {
      const blockStart = block.time_from;
      const blockEnd = block.time_to;
      return time >= blockStart && time < blockEnd;
    });
  };

  const isTimeSlotBooked = (time: string) => {
    return filteredAppointments.some(apt => {
      return time >= apt.time_from && time < apt.time_to;
    });
  };

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      window.alert("Please login");
      window.location.href = "/";
      return;
    }
    if (user?.id) {
      fetchAppointments();
      fetchBlockedSlots();
      fetchDentistWorkInfo();
    }
  }, [user, isLoadingAuth, isLoggedIn]);

  useEffect(() => {
    if (dentistWorkInfo) {
      generateTimeSlots(dentistWorkInfo);
    }
  }, [dentistWorkInfo]);

  const NewAppointmentForm = () => (
    <DialogContent className="max-w-md max-h-screen overflow-y-auto">
      <DialogHeader>
        <DialogTitle>New Appointment</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="patient">Patient</Label>
          <Input
            id="patient"
            placeholder="Enter Patient ID"
            value={patient_id}
            onChange={(e) => setPatient_id(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="time_from">Time</Label>
            <Select value={time_from} onValueChange={(value) => setTimeFrom(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Start time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            placeholder="Appointment notes..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={handleAppointmentCreation}>
          Create Appointment
        </Button>
      </div>
    </DialogContent>

  );

  const BlockTimeForm = () => (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Block Time</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="block_date">Date</Label>
          <Input
            id="block_date"
            type="date"
            value={blockDate}
            onChange={(e) => setBlockDate(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="block_from">From</Label>
            <Select
              value={blockTimeFrom}
              onValueChange={(value) => setBlockTimeFrom(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Start time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="block_to">To</Label>
            <Select
              value={blockTimeTo}
              onValueChange={(value) => setBlockTimeTo(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="End time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="w-full" onClick={handleBlockSlotCreation}>Block Time</Button>
      </div>
    </DialogContent>
  );

  const renderAppointmentTable = (appointmentList: Appointment[], showActions: boolean = true) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Patient</th>
            <th className="text-left p-2 hidden sm:table-cell">Service</th>
            <th className="text-left p-2">Date & Time</th>
            <th className="text-left p-2 hidden md:table-cell">Fee</th>
            <th className="text-left p-2">Status</th>
            {showActions && <th className="text-left p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {appointmentList.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 6 : 5} className="p-4 text-center text-gray-500">
                {loadingAppointments ? "Loading appointments..." : "No appointments found"}
              </td>
            </tr>
          ) : (
            appointmentList.map((appointment) => (
              <tr key={appointment.appointment_id} className="border-b">
                <td className="p-2">
                  <div>
                    <div className="font-medium">{appointment.patient?.name || 'Unknown Patient'}</div>
                    <div className="text-sm text-gray-600 sm:hidden">
                      {appointment.note}
                    </div>
                  </div>
                </td>
                <td className="p-2 hidden sm:table-cell">{appointment.note}</td>
                <td className="p-2">
                  <div className="text-sm">
                    {formatDate(appointment.date)}
                    <br />
                    {appointment.time_from} - {appointment.time_to}
                  </div>
                </td>
                <td className="p-2 hidden md:table-cell">${appointment.fee}</td>
                <td className="p-2">
                  <div className="space-y-1">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    <div className="md:hidden">
                      <Badge className={getPaymentStatusColor(appointment.payment_status)}>
                        {appointment.payment_status}
                      </Badge>
                    </div>
                  </div>
                </td>
                {showActions && (
                  <td className="p-2">
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600">Manage your appointments and blocked time slots</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <NewAppointmentForm />
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Schedule */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Daily Schedule</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loadingAppointments || loadingBlockedSlots ? (
                  <div className="text-center py-8 text-gray-500">Loading schedule...</div>
                ) : (
                  <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
                    {timeSlots.map((time) => {
                      const appointment = filteredAppointments.find(apt =>
                        apt.time_from <= time && apt.time_to > time
                      );
                      const isBlocked = isTimeSlotBlocked(time);

                      return (
                        <div key={time} className="flex items-center space-x-3 p-2 rounded-lg border">
                          <div className="text-sm font-medium w-16 text-gray-600">
                            {time}
                          </div>
                          <div className="flex-1">
                            {appointment ? (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium">{appointment.patient?.name || 'Unknown Patient'}</span>
                                  <Badge className={getStatusColor(appointment.status)}>
                                    {appointment.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">${appointment.fee}</span>
                                  <Badge className={getPaymentStatusColor(appointment.payment_status)}>
                                    {appointment.payment_status}
                                  </Badge>
                                </div>
                              </div>
                            ) : isBlocked ? (
                              <div className="flex items-center space-x-2">
                                <X className="w-4 h-4 text-red-500" />
                                <span className="text-red-600 font-medium">Blocked</span>
                                <Button variant="ghost" size="sm" className="ml-auto">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-400">Available</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Schedule Summary Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Schedule for {new Date(selectedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </CardTitle>
                  <Dialog open={isBlockTimeOpen} onOpenChange={setIsBlockTimeOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-auto">
                        Block Time
                      </Button>
                    </DialogTrigger>
                    <BlockTimeForm />
                  </Dialog>
                </div>
                <div className="text-sm text-gray-500">
                  Appointments for selected date: {filteredAppointments.length}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No appointments for this date
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <div key={appointment.appointment_id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient?.name || 'Unknown Patient'}
                          </div>
                          <div className="text-xs text-blue-600">
                            {appointment.time_from} - {appointment.time_to}
                          </div>
                          <div className="text-xs text-gray-500">{appointment.note}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Blocked Time Items - Fixed to use selectedDateBlockedSlots */}
                {selectedDateBlockedSlots.map((block) => (
                  <div key={block.blocked_date_id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="text-sm font-medium text-red-700">
                          {block.time_from} - {block.time_to}
                        </div>
                        <div className="text-xs text-red-600">Blocked</div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 text-xs" onClick={()=>{handleBlockDeletion(block.blocked_date_id)}}>
                        Cancel Block
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Appointment Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appointment Management</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today">Today ({todayAppointments.length})</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="today" className="space-y-4">
                {renderAppointmentTable(getFilteredAppointmentsByTab(todayAppointments), true)}
              </TabsContent>
              <TabsContent value="upcoming" className="space-y-4">
                {renderAppointmentTable(getFilteredAppointmentsByTab(upcomingAppointments), true)}
              </TabsContent>
              <TabsContent value="past" className="space-y-4">
                {renderAppointmentTable(getFilteredAppointmentsByTab(pastAppointments), false)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}