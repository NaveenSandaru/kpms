'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Phone, Mail, Calendar, Clock, User } from 'lucide-react'

interface Patient {
  patient_id: string
  name: string
  email: string
  phone_number: string
  hospital_patient_id: string
}

interface Dentist {
  dentist_id: string
  name: string
  email: string
  phone_number: string
  appointment_fee: number
}

interface Appointment {
  appointment_id: number
  patient_id: string
  dentist_id: string
  date: string
  time_from: string
  time_to: string
  fee: number
  note: string
  status: string
  payment_status: string
  patient: Patient
  dentist: Dentist
}

// Mock data based on your DB structure
const mockAppointments: Appointment[] = [
  {
    appointment_id: 1,
    patient_id: 'P001',
    dentist_id: 'D001',
    date: '2025-06-20',
    time_from: '09:00',
    time_to: '09:30',
    fee: 150.00,
    note: 'andjerlajkwmdi',
    status: 'confirmed',
    payment_status: 'paid',
    patient: {
      patient_id: 'P001',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone_number: '+1234567890',
      hospital_patient_id: 'H001'
    },
    dentist: {
      dentist_id: 'D001',
      name: 'John Doe',
      email: 'john@example.com',
      phone_number: '+1234567891',
      appointment_fee: 150.00
    }
  },
  {
    appointment_id: 2,
    patient_id: 'P002',
    dentist_id: 'D002',
    date: '2025-06-21',
    time_from: '14:00',
    time_to: '14:45',
    fee: 200.00,
    note: 'Routine cleaning and checkup',
    status: 'pending',
    payment_status: 'pending',
    patient: {
      patient_id: 'P002',
      name: 'Mike Smith',
      email: 'mike@example.com',
      phone_number: '+1234567892',
      hospital_patient_id: 'H002'
    },
    dentist: {
      dentist_id: 'D002',
      name: 'Dr. Sarah Wilson',
      email: 'sarah@example.com',
      phone_number: '+1234567893',
      appointment_fee: 200.00
    }
  },
  {
    appointment_id: 3,
    patient_id: 'P003',
    dentist_id: 'D001',
    date: '2025-06-22',
    time_from: '11:00',
    time_to: '11:30',
    fee: 150.00,
    note: 'Follow-up appointment for dental implant',
    status: 'confirmed',
    payment_status: 'paid',
    patient: {
      patient_id: 'P003',
      name: 'Emma Brown',
      email: 'emma@example.com',
      phone_number: '+1234567894',
      hospital_patient_id: 'H003'
    },
    dentist: {
      dentist_id: 'D001',
      name: 'John Doe',
      email: 'john@example.com',
      phone_number: '+1234567891',
      appointment_fee: 150.00
    }
  }
]

export default function AppointmentsPage() {
  const params = useParams()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [receptionistId, setReceptionistId] = useState<string>('123')

  // Get receptionist ID from auth token (defaulting to 123)
  useEffect(() => {
    const id = (params.receptionistID || params.receptionistId) as string || '123'
    setReceptionistId(id)
  }, [params])

  // Load appointments
  useEffect(() => {
    setAppointments(mockAppointments)
  }, [receptionistId])

  // Filter appointments based on search
  useEffect(() => {
    let filtered = appointments

    if (searchTerm) {
      filtered = filtered.filter(appointment => 
        appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.dentist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredAppointments(filtered)
  }, [appointments, searchTerm])

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 md:hidden">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pending Appointments</h1>
            <p className="text-gray-600 mt-1">Manage pending appointments</p>
          </div>
        </div>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search appointments"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200"
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Patient</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Dentist</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Note</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Date & Time</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment, index) => (
                  <tr 
                    key={appointment.appointment_id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {appointment.patient.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {appointment.patient.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.patient.phone_number}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {appointment.dentist.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {appointment.dentist.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.dentist.phone_number}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 max-w-xs">
                        {appointment.note}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-sm text-gray-900">
                          {formatDate(appointment.date)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(appointment.time_from)} - {formatTime(appointment.time_to)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-3 py-1 h-auto border-green-200 text-green-700 hover:bg-green-50"
                      >
                        Accept
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.appointment_id} className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Patient Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{appointment.patient.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Mail className="w-3 h-3" />
                        {appointment.patient.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="w-3 h-3" />
                        {appointment.patient.phone_number}
                      </div>
                    </div>
                  </div>

                  {/* Dentist Info */}
                  <div className="border-t pt-3">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      Dentist: {appointment.dentist.name}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">{appointment.dentist.email}</div>
                    <div className="text-sm text-gray-500">{appointment.dentist.phone_number}</div>
                  </div>

                  {/* Note */}
                  <div className="border-t pt-3">
                    <div className="text-sm font-medium text-gray-900 mb-1">Note:</div>
                    <div className="text-sm text-gray-600">{appointment.note}</div>
                  </div>

                  {/* Date & Time */}
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{formatTime(appointment.time_from)} - {formatTime(appointment.time_to)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="border-t pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No appointments match "${searchTerm}"`
                : 'No appointments available'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}