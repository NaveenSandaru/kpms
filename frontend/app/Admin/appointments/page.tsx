"use client";
import React, { useState, useMemo } from 'react';
import { Search, Plus, Calendar, Clock, User, Stethoscope, FileText, DollarSign } from 'lucide-react';

// Types based on the database schema
interface Appointment {
  appointment_id: number;
  patient_id: string;
  dentist_id: string;
  date: string;
  time_from: string;
  time_to: string;
  fee: number;
  note: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
}

interface Patient {
  patient_id: string;
  name: string;
  email: string;
  phone: string;
}

interface Dentist {
  dentist_id: string;
  name: string;
  email: string;
  phone: string;
}

// Mock data
const mockPatients: Patient[] = [
  { patient_id: 'P001', name: 'Jane Doe', email: 'jane@example.com', phone: '+1234567890' },
  { patient_id: 'P002', name: 'John Smith', email: 'john@example.com', phone: '+1234567891' },
  { patient_id: 'P003', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1234567892' },
];

const mockDentists: Dentist[] = [
  { dentist_id: 'D001', name: 'Dr. John Doe', email: 'johndoe@example.com', phone: '+1234567893' },
  { dentist_id: 'D002', name: 'Dr. Sarah Wilson', email: 'sarah@example.com', phone: '+1234567894' },
];

const mockAppointments: Appointment[] = [
  {
    appointment_id: 1,
    patient_id: 'P001',
    dentist_id: 'D001',
    date: '2025-06-17',
    time_from: '9:00 AM',
    time_to: '9:30 AM',
    fee: 150.00,
    note: 'Regular checkup',
    status: 'pending',
    payment_status: 'pending'
  },
  {
    appointment_id: 2,
    patient_id: 'P002',
    dentist_id: 'D002',
    date: '2025-06-18',
    time_from: '2:00 PM',
    time_to: '3:00 PM',
    fee: 200.00,
    note: 'Root canal treatment',
    status: 'confirmed',
    payment_status: 'paid'
  },
  {
    appointment_id: 3,
    patient_id: 'P003',
    dentist_id: 'D001',
    date: '2025-06-19',
    time_from: '10:00 AM',
    time_to: '11:00 AM',
    fee: 100.00,
    note: 'Teeth cleaning',
    status: 'completed',
    payment_status: 'paid'
  }
];

const AppointmentsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Helper functions to get patient and dentist names
  const getPatientName = (patientId: string) => {
    const patient = mockPatients.find(p => p.patient_id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const getPatientEmail = (patientId: string) => {
    const patient = mockPatients.find(p => p.patient_id === patientId);
    return patient ? patient.email : '';
  };

  const getDentistName = (dentistId: string) => {
    const dentist = mockDentists.find(d => d.dentist_id === dentistId);
    return dentist ? dentist.name : 'Unknown Dentist';
  };

  const getDentistEmail = (dentistId: string) => {
    const dentist = mockDentists.find(d => d.dentist_id === dentistId);
    return dentist ? dentist.email : '';
  };

  // Filter appointments based on search and status
  const filteredAppointments = useMemo(() => {
    return mockAppointments.filter(appointment => {
      const patientName = getPatientName(appointment.patient_id).toLowerCase();
      const dentistName = getDentistName(appointment.dentist_id).toLowerCase();
      const note = appointment.note.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch = 
        patientName.includes(searchLower) ||
        dentistName.includes(searchLower) ||
        note.includes(searchLower) ||
        appointment.date.includes(searchLower);

      const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mt-7 text-gray-900">Appointments</h1>
              <p className="text-gray-600 mt-1">View Appointments database entries</p>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-fit">
              <Plus size={20} />
              Add Appointment
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Dentist</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Note</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Fee</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.appointment_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{getPatientName(appointment.patient_id)}</div>
                          <div className="text-sm text-gray-500">{getPatientEmail(appointment.patient_id)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Stethoscope size={16} className="text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{getDentistName(appointment.dentist_id)}</div>
                          <div className="text-sm text-gray-500">{getDentistEmail(appointment.dentist_id)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">{appointment.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock size={14} className="text-gray-400" />
                        <span>{appointment.time_from} - {appointment.time_to}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-gray-900">{appointment.note}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="font-semibold text-gray-900">${appointment.fee.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(appointment.payment_status)}`}>
                        {appointment.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.appointment_id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Patient Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{getPatientName(appointment.patient_id)}</div>
                      <div className="text-sm text-gray-500">{getPatientEmail(appointment.patient_id)}</div>
                    </div>
                  </div>

                  {/* Dentist Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Stethoscope size={20} className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{getDentistName(appointment.dentist_id)}</div>
                      <div className="text-sm text-gray-500">{getDentistEmail(appointment.dentist_id)}</div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="font-medium">{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span>{appointment.time_from} - {appointment.time_to}</span>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-gray-900">{appointment.note}</span>
                  </div>

                  {/* Fee */}
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="font-semibold text-lg text-gray-900">${appointment.fee.toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-col gap-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)} text-center`}>
                    {appointment.status}
                  </span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(appointment.payment_status)} text-center`}>
                    {appointment.payment_status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by adding your first appointment.'}
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto">
              <Plus size={20} />
              Add Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsDashboard;