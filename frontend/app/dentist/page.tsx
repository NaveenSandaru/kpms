"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Plus, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import axios from 'axios';

// Mock data based on your database structure
const mockDentistData = {
  dentist_id: "DENT001",
  name: "Dr. Sarah Johnson",
  profile_picture: "/api/placeholder/40/40",
  email: "sarah.johnson@clinic.com",
  phone_number: "+1-555-0123",
  service_types: "General Dentistry, Orthodontics, Cosmetic Dentistry",
  work_time_from: "09:00",
  work_time_to: "17:00",
  appointment_duration: "30",
  appointment_fee: 150.00
};

type Appointment = {
  appointment_id: number;
  patient: {
    name: string;
    profile_picture: string;
  };
  time_from: string;
  time_to: string;
  type: string;
  status: string;
  fee: number;
};


const mockAppointments = [
  {
    appointment_id: 1,
    patient: { name: "Cindy Robertson", profile_picture: "/api/placeholder/32/32" },
    time_from: "09:00",
    time_to: "09:30",
    type: "Annual Checkup",
    status: "",
    fee: 150.00
  },
  {
    appointment_id: 2,
    patient: { name: "Terrell Thompson", profile_picture: "/api/placeholder/32/32" },
    time_from: "10:30",
    time_to: "11:00",
    type: "Heart Follow-up",
    status: " ",
    fee: 200.00
  },
  {
    appointment_id: 3,
    patient: { name: "Jordan Wu", profile_picture: "/api/placeholder/32/32" },
    time_from: "12:00",
    time_to: "12:30",
    type: "Medication Review",
    status: " ",
    fee: 175.00
  },
  {
    appointment_id: 4,
    patient: { name: "Melissa Alfonso", profile_picture: "/api/placeholder/32/32" },
    time_from: "14:15",
    time_to: "14:45",
    type: "Cardiology Consultation",
    status: " ",
    fee: 250.00
  },
  {
    appointment_id: 5,
    patient: { name: "Elizabeth Parker", profile_picture: "/api/placeholder/32/32" },
    time_from: "15:30",
    time_to: "16:00",
    type: "Blood Pressure Check",
    status: " ",
    fee: 125.00
  },
  {
    appointment_id: 6,
    patient: { name: "Joseph Segal", profile_picture: "/api/placeholder/32/32" },
    time_from: "16:45",
    time_to: "17:15",
    type: "Post-Surgery Follow-up",
    status: "Pending",
    fee: 300.00
  }
];

const mockUpcomingAppointments = [
  {
    patient: { name: "Sarah Green", profile_picture: "/api/placeholder/32/32" },
    type: "Initial Consultation",
    time: "Tomorrow, 09:30 AM"
  },
  {
    patient: { name: "Margaret Wilson", profile_picture: "/api/placeholder/32/32" },
    type: "Medication Review",
    time: "Tomorrow, 10:00 PM"
  },
  {
    patient: { name: "David Martinez", profile_picture: "/api/placeholder/32/32" },
    type: "Heart Examination",
    time: "Tomorrow, 10:30 AM"
  }
];

const DentalDashboard = () => {

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [doctorID,setDoctorID] = useState("dent123");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState <Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchTodaysAppointments = async () => {
    try{
      const response = await axios.get(
        `${backendURL}/appointments/today/fordentist/${doctorID}`
      );
      if(response.status == 500){
        throw new Error("Internal Server Error");
      }
      setTodaysAppointments(response.data);
    }
    catch(err: any){
      window.alert(err.message);
    }
    finally{

    }
  }

  const getDaysInMonth = (date: any) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getStatusColor = (status: any) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

   const getStatusIcon = (status: any) => {
    switch (status) {
      case 'Completed':
        return '✓';
     
      case 'Cancelled':
        return '❌';
      default:
        return '⏳';
    }
  };

  // Handle status change
  const handleStatusChange = (appointmentId: any, newStatus: any) => {
    setTodaysAppointments(prevAppointments =>
      prevAppointments.map(appointment =>
        appointment.appointment_id === appointmentId
          ? { ...appointment, status: newStatus }
          : appointment
      )
    );
  };


  const todaysAppointmentsCount = todaysAppointments.length;
  const totalCheckIns = todaysAppointments.filter(apt => apt.status === 'checked-in').length;
  const completedAppointments = todaysAppointments.filter(apt => apt.status === 'Complete').length;

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: any) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const days = getDaysInMonth(currentDate);

  useEffect(()=>{
    fetchTodaysAppointments();
  },[])

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">


      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 md:p-6 text-white">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 mr-3" />
            <div>
              <p className="text-purple-100 text-sm">Today's Appointments</p>
              <p className="text-2xl md:text-3xl font-bold">{todaysAppointmentsCount}</p>
              <p className="text-purple-100 text-xs">3 remaining</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 md:p-6 text-white sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 mr-3" />
            <div>
              <p className="text-green-100 text-sm">Total Check-ins</p>
              <p className="text-2xl md:text-3xl font-bold">{totalCheckIns}</p>
              
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
         <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
        <div className="p-4 md:p-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Today's Schedule</h2>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 md:pb-6">
          <div className="space-y-3">
            {todaysAppointments.map((appointment) => (
              <div key={appointment.appointment_id} className="flex items-center p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <img
                  src={appointment.patient.profile_picture}
                  alt={appointment.patient.name}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full mr-3 md:mr-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-1 sm:mb-0">
                      <h3 className="font-medium text-gray-900 truncate">{appointment.patient.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{appointment.type}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700">
                        {appointment.time_from}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1 hidden sm:inline">{appointment.status}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Radio Buttons */}
                  <div className="mt-3 flex flex-wrap gap-3">
                   
                    
                  
                    
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="radio"
                        name={`status-${appointment.appointment_id}`}
                        value="Completed"
                        checked={appointment.status === 'Completed'}
                        onChange={(e) => handleStatusChange(appointment.appointment_id, e.target.value)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700">Completed</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="radio"
                        name={`status-${appointment.appointment_id}`}
                        value="Cancelled"
                        checked={appointment.status === 'Cancelled'}
                        onChange={(e) => handleStatusChange(appointment.appointment_id, e.target.value)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="text-gray-700">Cancelled</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  

        {/* Calendar and Upcoming */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="font-medium text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                  <div key={index} className="aspect-square">
                    {day && (
                      <button
                        className={`w-full h-full flex items-center justify-center text-sm rounded hover:bg-gray-100 ${day === 13 ? 'bg-emerald-500 text-emerald-800 hover:bg-emerald-600' :
                            day === new Date().getDate() &&
                              currentDate.getMonth() === new Date().getMonth() &&
                              currentDate.getFullYear() === new Date().getFullYear()
                              ? 'bg-emerald-50 text-emerald-800' : 'text-emrald-700'
                          }`}
                      >
                        {day}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Appointment
              </button>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white rounded-lg shadow-sm border h-80 flex flex-col">
            <div className="p-4 md:p-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h2>
                <button className="text-emerald-600 text-sm font-medium hover:text-emerald-700">
                  View All
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3">
                {mockUpcomingAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <img
                      src={appointment.patient.profile_picture}
                      alt={appointment.patient.name}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {appointment.patient.name}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">{appointment.type}</p>
                      <p className="text-xs text-gray-500">{appointment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentalDashboard;