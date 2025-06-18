"use client";
import React, { useState, useEffect } from 'react';
import { Search, Calendar, DollarSign, User, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Types based on the database schema
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
  phone_number: string;
  profile_picture?: string;
}

interface Appointment {
  appointment_id: number;
  patient_id: string;
  dentist_id: string;
  date: string;
  time_from: string;
  time_to: string;
  fee: number;
  status: string;
  payment_status: string;
}

interface PaymentHistory {
  appointment_id: number;
  payment_date: string;
  payment_time: string;
  reference_number: string;
}

interface PaymentRecord {
  appointment: Appointment;
  patient: Patient;
  dentist: Dentist;
  payment: PaymentHistory;
}

// Mock data for demonstration
const mockPayments: PaymentRecord[] = [
  {
    appointment: {
      appointment_id: 1,
      patient_id: 'P001',
      dentist_id: 'D001',
      date: '2025-06-12',
      time_from: '9:00',
      time_to: '9:30',
      fee: 200.00,
      status: 'completed',
      payment_status: 'paid'
    },
    patient: {
      patient_id: 'P001',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone_number: '(123)456-789',
      profile_picture: undefined
    },
    dentist: {
      dentist_id: 'D001',
      name: 'John Doe',
      email: 'john@example.com',
      phone_number: '(123)456-789',
      profile_picture: undefined
    },
    payment: {
      appointment_id: 1,
      payment_date: '2025-06-12',
      payment_time: '9:30',
      reference_number: '123658890054125'
    }
  },
  {
    appointment: {
      appointment_id: 2,
      patient_id: 'P002',
      dentist_id: 'D002',
      date: '2025-06-11',
      time_from: '14:00',
      time_to: '14:30',
      fee: 150.00,
      status: 'completed',
      payment_status: 'paid'
    },
    patient: {
      patient_id: 'P002',
      name: 'Alice Smith',
      email: 'alice@example.com',
      phone_number: '(555)123-4567',
      profile_picture: undefined
    },
    dentist: {
      dentist_id: 'D002',
      name: 'Dr. Sarah Wilson',
      email: 'sarah@example.com',
      phone_number: '(555)987-6543',
      profile_picture: undefined
    },
    payment: {
      appointment_id: 2,
      payment_date: '2025-06-11',
      payment_time: '14:30',
      reference_number: '987654321098765'
    }
  }
];

const PaymentsInterface: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState<PaymentRecord[]>(mockPayments);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>(mockPayments);

  useEffect(() => {
    const filtered = payments.filter(payment => 
      payment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.dentist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment.reference_number.includes(searchTerm)
    );
    setFilteredPayments(filtered);
  }, [searchTerm, payments]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mt-7 md:mt-0 text-gray-900 mb-2">Payments</h1>
          <p className="text-gray-600">View Payments database entries</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            placeholder="Search appointments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-4 font-medium text-gray-700">Patient</th>
                      <th className="text-left px-6 py-4 font-medium text-gray-700">Dentist</th>
                      <th className="text-left px-6 py-4 font-medium text-gray-700">Fee</th>
                      <th className="text-left px-6 py-4 font-medium text-gray-700">Date & Time</th>
                      <th className="text-left px-6 py-4 font-medium text-gray-700">Reference no</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.appointment.appointment_id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={payment.patient.profile_picture} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {getInitials(payment.patient.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{payment.patient.name}</div>
                              <div className="text-sm text-gray-500">{payment.patient.email}</div>
                              <div className="text-sm text-gray-500">{payment.patient.phone_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={payment.dentist.profile_picture} />
                              <AvatarFallback className="bg-green-100 text-green-600">
                                {getInitials(payment.dentist.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{payment.dentist.name}</div>
                              <div className="text-sm text-gray-500">{payment.dentist.email}</div>
                              <div className="text-sm text-gray-500">{payment.dentist.phone_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-gray-900">${payment.appointment.fee}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(payment.payment.payment_date)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTime(payment.payment.payment_time)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-mono text-xs">
                            {payment.payment.reference_number}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.appointment.appointment_id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={payment.patient.profile_picture} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(payment.patient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{payment.patient.name}</CardTitle>
                      <CardDescription className="text-sm">{payment.patient.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-lg text-gray-900">${payment.appointment.fee}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={payment.dentist.profile_picture} />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {getInitials(payment.dentist.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{payment.dentist.name}</div>
                    <div className="text-sm text-gray-500">{payment.dentist.email}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">{formatDate(payment.payment.payment_date)}</div>
                      <div className="text-xs text-gray-500">Date</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">
                        {formatTime(payment.payment.payment_time)} 
                      </div>
                      <div className="text-xs text-gray-500">Time</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500 mb-1">Reference Number</div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {payment.payment.reference_number}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPayments.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentsInterface;