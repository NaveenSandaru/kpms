'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { CalendarDays, Clock, Users, UserCheck, UserX, Activity } from 'lucide-react';

// Types based on the database structure
interface Patient {
  patient_id: string;
  name: string;
  email: string;
  phone_number: string;
  profile_picture?: string;
}

interface Dentist {
  dentist_id: string;
  name: string;
  email: string;
  service_types: string;
}

interface Appointment {
  appointment_id: number;
  patient_id: string;
  dentist_id: string;
  date: string;
  time_from: string;
  time_to: string;
  fee: number;
  note?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'checked_in';
  payment_status: 'pending' | 'paid' | 'partial';
  patient?: Patient;
  dentist?: Dentist;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'registration';
  message: string;
  timestamp: string;
  email?: string;
}

interface DashboardStats {
  todaysAppointments: number;
  pendingAppointments: number;
  checkedInPatients: number;
  notCheckedInPatients: number;
}

// Mock data generator based on the database structure
const generateMockData = (receptionistId: string) => {
  const mockPatients: Patient[] = [
    { patient_id: 'P001', name: 'John Doe', email: 'john@example.com', phone_number: '+1234567890' },
    { patient_id: 'P002', name: 'Jane Smith', email: 'jane@example.com', phone_number: '+1234567891' },
    { patient_id: 'P003', name: 'Mike Johnson', email: 'mike@example.com', phone_number: '+1234567892' },
    { patient_id: 'P004', name: 'Sarah Wilson', email: 'sarah@example.com', phone_number: '+1234567893' },
    { patient_id: 'P005', name: 'David Brown', email: 'david@example.com', phone_number: '+1234567894' },
  ];

  const mockDentists: Dentist[] = [
    { dentist_id: 'D001', name: 'Dr. Smith', email: 'dr.smith@clinic.com', service_types: 'General Dentistry' },
    { dentist_id: 'D002', name: 'Dr. Johnson', email: 'dr.johnson@clinic.com', service_types: 'Orthodontics' },
    { dentist_id: 'D003', name: 'Dr. Williams', email: 'dr.williams@clinic.com', service_types: 'Oral Surgery' },
  ];

  const today = new Date().toISOString().split('T')[0];
  const mockAppointments: Appointment[] = [
    {
      appointment_id: 1,
      patient_id: 'P001',
      dentist_id: 'D001',
      date: today,
      time_from: '09:00',
      time_to: '09:30',
      fee: 150.00,
      status: 'confirmed',
      payment_status: 'paid',
      patient: mockPatients[0],
      dentist: mockDentists[0]
    },
    {
      appointment_id: 2,
      patient_id: 'P002',
      dentist_id: 'D002',
      date: today,
      time_from: '10:00',
      time_to: '11:00',
      fee: 200.00,
      status: 'checked_in',
      payment_status: 'paid',
      patient: mockPatients[1],
      dentist: mockDentists[1]
    },
    {
      appointment_id: 3,
      patient_id: 'P003',
      dentist_id: 'D001',
      date: today,
      time_from: '14:00',
      time_to: '14:30',
      fee: 150.00,
      status: 'confirmed',
      payment_status: 'pending',
      patient: mockPatients[2],
      dentist: mockDentists[0]
    },
    {
      appointment_id: 4,
      patient_id: 'P004',
      dentist_id: 'D003',
      date: today,
      time_from: '15:30',
      time_to: '16:30',
      fee: 300.00,
      status: 'pending',
      payment_status: 'pending',
      patient: mockPatients[3],
      dentist: mockDentists[2]
    },
  ];

  // Generate additional pending appointments for different dates
  for (let i = 5; i <= 45; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1);
    
    mockAppointments.push({
      appointment_id: i,
      patient_id: mockPatients[Math.floor(Math.random() * mockPatients.length)].patient_id,
      dentist_id: mockDentists[Math.floor(Math.random() * mockDentists.length)].dentist_id,
      date: futureDate.toISOString().split('T')[0],
      time_from: `${9 + Math.floor(Math.random() * 8)}:00`,
      time_to: `${10 + Math.floor(Math.random() * 8)}:00`,
      fee: 150 + Math.floor(Math.random() * 200),
      status: 'pending',
      payment_status: 'pending',
      patient: mockPatients[Math.floor(Math.random() * mockPatients.length)],
      dentist: mockDentists[Math.floor(Math.random() * mockDentists.length)]
    });
  }

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'appointment',
      message: 'New appointment booked by john@example.com',
      timestamp: '2025-06-12 10:00',
      email: 'john@example.com'
    },
    {
      id: '2',
      type: 'registration',
      message: 'New client jane@example.com registered',
      timestamp: 'Recently',
      email: 'jane@example.com'
    },
    {
      id: '3',
      type: 'registration',
      message: 'New client jane@example.com registered',
      timestamp: 'Recently'
    }
  ];

  const todaysAppointments = mockAppointments.filter(apt => apt.date === today);
  const pendingAppointments = mockAppointments.filter(apt => apt.status === 'pending');
  const checkedInToday = todaysAppointments.filter(apt => apt.status === 'checked_in');
  const notCheckedInToday = todaysAppointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  );

  const stats: DashboardStats = {
    todaysAppointments: todaysAppointments.length,
    pendingAppointments: pendingAppointments.length,
    checkedInPatients: checkedInToday.length,
    notCheckedInPatients: notCheckedInToday.length
  };

  return { stats, recentActivities, appointments: mockAppointments };
};

// Simulated auth token parsing
const getReceptionistIdFromToken = (): string => {
  // In a real app, this would parse the JWT token
  // For now, returning default value as requested
  return '123';
};

interface ReceptionistDashboardProps {
  params: {
    receptionistID: string;
  };
}

export default function ReceptionistDashboard({ params }: ReceptionistDashboardProps) {
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    recentActivities: RecentActivity[];
    appointments: Appointment[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Get receptionist ID from auth token (defaulting to 123 as requested)
  const receptionistId = getReceptionistIdFromToken();

  useEffect(() => {
    // Simulate API call delay
    const fetchData = async () => {
      setLoading(true);
      
      // In a real app, this would be an API call
      // const response = await fetch(`/api/receptionist/${receptionistId}/dashboard`);
      // const data = await response.json();
      
      // For now, using mock data
      const mockData = generateMockData(receptionistId);
      
      setTimeout(() => {
        setDashboardData(mockData);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [receptionistId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <CalendarDays className="h-4 w-4 text-blue-600" />;
      case 'registration':
        return <Users className="h-4 w-4 text-green-600" />;
      
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'border-l-blue-500';
      case 'registration':
        return 'border-l-green-500';
      
      default:
        return 'border-l-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600">
            Unable to load dashboard data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const { stats, recentActivities } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
         <div className="mb-4 md:hidden">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to your Receptionist Dashboard</p>
          </div>
        </div>
      
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Today's Appointments
              </CardTitle>
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {stats.todaysAppointments}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Appointments
              </CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {stats.pendingAppointments}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Today's Checked In Patients
              </CardTitle>
              <UserCheck className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {stats.checkedInPatients}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Currently checked in
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Today's Not-Checked In Patients
              </CardTitle>
              <UserX className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {stats.notCheckedInPatients}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Yet to check in
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-l-4 bg-gray-50 ${getActivityColor(activity.type)}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {activity.timestamp}
                      </p>
                      {activity.type === 'appointment' && (
                        <Badge variant="outline" className="text-xs">
                          New Booking
                        </Badge>
                      )}
                      {activity.type === 'registration' && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          New Patient
                        </Badge>
                      )}
                     
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}