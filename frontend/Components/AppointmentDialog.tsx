'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/Components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog'
import { Label } from '@/Components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/Components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import axios from 'axios'

interface Patient {
  patient_id: string
  name: string
  email: string
  phone_number: string
}

interface Dentist {
  dentist_id: string
  name: string
  email: string
  phone_number: string
  service_types: string
  work_days_from: string
  work_days_to: string
  work_time_from: string
  work_time_to: string
  appointment_duration: string
  appointment_fee: number
}

interface TimeSlot {
  start: string
  end: string
}

interface AppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentCreated: () => void
}

export function AppointmentDialog({ open, onOpenChange, onAppointmentCreated }: AppointmentDialogProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [dentists, setDentists] = useState<Dentist[]>([])
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [dateString, setDateString] = useState<string>('')
  
  const [formData, setFormData] = useState({
    patientId: '',
    dentistId: '',
    timeSlot: '',
    note: ''
  })

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Helper function to generate time slots based on work hours and duration
  const generateTimeSlots = (workTimeFrom: string, workTimeTo: string, duration: string): TimeSlot[] => {
    const slots: TimeSlot[] = []
    
    console.log('Generating slots with:', { workTimeFrom, workTimeTo, duration }) // Debug log
    
    // Parse duration (assuming format like "30 minutes" or "45 minutes" or just "30")
    const durationMatch = duration.match(/(\d+)/)
    const durationMinutes = durationMatch ? parseInt(durationMatch[1]) : 30
    
    console.log('Parsed duration minutes:', durationMinutes) // Debug log
    
    // Parse work times (assuming format like "09:00" or "9:00 AM")
    const parseTime = (timeStr: string): { hours: number, minutes: number } => {
      // Remove any non-digit and non-colon characters, handle AM/PM
      let cleanTime = timeStr.trim()
      
      // Handle AM/PM format
      const isPM = /PM/i.test(cleanTime)
      const isAM = /AM/i.test(cleanTime)
      
      // Extract just the time part
      cleanTime = cleanTime.replace(/[^\d:]/g, '')
      
      const [hoursStr, minutesStr = '0'] = cleanTime.split(':')
      let hours = parseInt(hoursStr) || 0
      const minutes = parseInt(minutesStr) || 0
      
      // Convert 12-hour to 24-hour format
      if (isPM && hours !== 12) {
        hours += 12
      } else if (isAM && hours === 12) {
        hours = 0
      }
      
      return { hours, minutes }
    }
    
    const startTime = parseTime(workTimeFrom)
    const endTime = parseTime(workTimeTo)
    
    console.log('Parsed times:', { startTime, endTime }) // Debug log
    
    // Convert to minutes for easier calculation
    let currentMinutes = startTime.hours * 60 + startTime.minutes
    const endMinutes = endTime.hours * 60 + endTime.minutes
    
    console.log('Time in minutes:', { currentMinutes, endMinutes }) // Debug log
    
    // Handle case where end time is next day (e.g., night shift)
    const actualEndMinutes = endMinutes <= currentMinutes ? endMinutes + 24 * 60 : endMinutes
    
    while (currentMinutes + durationMinutes <= actualEndMinutes) {
      const startHours = Math.floor(currentMinutes / 60) % 24
      const startMins = currentMinutes % 60
      
      const endSlotMinutes = currentMinutes + durationMinutes
      const endHours = Math.floor(endSlotMinutes / 60) % 24
      const endMins = endSlotMinutes % 60
      
      const formatTime = (hours: number, minutes: number): string => {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      }
      
      slots.push({
        start: formatTime(startHours, startMins),
        end: formatTime(endHours, endMins)
      })
      
      currentMinutes += durationMinutes
    }
    
    console.log('Generated slots:', slots) // Debug log
    return slots
  }

  // Check if selected date is within dentist's working days
  const isWorkingDay = (date: Date, dentist: Dentist): boolean => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const selectedDay = dayNames[date.getDay()]
    
    const workDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const fromIndex = workDays.indexOf(dentist.work_days_from)
    const toIndex = workDays.indexOf(dentist.work_days_to)
    const selectedIndex = workDays.indexOf(selectedDay)
    
    if (fromIndex <= toIndex) {
      return selectedIndex >= fromIndex && selectedIndex <= toIndex
    } else {
      // Handle case where work days span across week (e.g., Saturday to Monday)
      return selectedIndex >= fromIndex || selectedIndex <= toIndex
    }
  }

  // Fetch patients and dentists on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, dentistsRes] = await Promise.all([
          axios.get(`${backendURL}/patients`),
          axios.get(`${backendURL}/dentists`)
        ])
        setPatients(patientsRes.data)
        setDentists(dentistsRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    if (open) {
      fetchData()
    }
  }, [open, backendURL])

  // Fetch specific dentist details when dentist is selected
  useEffect(() => {
    const fetchDentistDetails = async () => {
      if (!formData.dentistId) {
        setSelectedDentist(null)
        return
      }
      
      try {
        const response = await axios.get(`${backendURL}/dentists/${formData.dentistId}`)
        setSelectedDentist(response.data)
      } catch (error) {
        console.error('Error fetching dentist details:', error)
        setSelectedDentist(null)
      }
    }
    
    fetchDentistDetails()
  }, [formData.dentistId, backendURL])

  // Generate time slots when dentist details are loaded or date changes
  useEffect(() => {
    const generateAvailableSlots = async () => {
      if (!selectedDentist || !dateString) {
        setTimeSlots([])
        return
      }
      
      const selectedDate = new Date(dateString)
      
      // Check if selected date is a working day
      if (!isWorkingDay(selectedDate, selectedDentist)) {
        setTimeSlots([])
        return
      }
      
      try {
        // Generate all possible time slots based on dentist's schedule
        const allSlots = generateTimeSlots(
          selectedDentist.work_time_from,
          selectedDentist.work_time_to,
          selectedDentist.appointment_duration
        )
        
        console.log('All generated slots:', allSlots) // Debug log
        
        // Fetch existing appointments for this dentist on this date
        const existingAppointmentsRes = await axios.get(
          `${backendURL}/appointments?dentistId=${selectedDentist.dentist_id}&date=${dateString}`
        )
        
        const existingAppointments = existingAppointmentsRes.data || []
        console.log('Existing appointments:', existingAppointments) // Debug log
        
        // Helper function to convert time string to minutes for easier comparison
        const timeToMinutes = (timeStr: string): number => {
          const [hours, minutes] = timeStr.split(':').map(Number)
          return hours * 60 + minutes
        }
        
        // Filter out time slots that conflict with existing appointments
        const availableSlots = allSlots.filter(slot => {
          const slotStartMinutes = timeToMinutes(slot.start)
          const slotEndMinutes = timeToMinutes(slot.end)
          
          // Check if this slot conflicts with any existing appointment
          const hasConflict = existingAppointments.some((appointment: any) => {
            const appointmentStartMinutes = timeToMinutes(appointment.time_from)
            const appointmentEndMinutes = timeToMinutes(appointment.time_to)
            
            // More precise overlap detection
            // Two time ranges overlap if:
            // 1. Slot starts before appointment ends AND slot ends after appointment starts
            const overlaps = slotStartMinutes < appointmentEndMinutes && slotEndMinutes > appointmentStartMinutes
            
            console.log(`Checking slot ${slot.start}-${slot.end} vs appointment ${appointment.time_from}-${appointment.time_to}: ${overlaps ? 'CONFLICT' : 'OK'}`)
            
            return overlaps
          })
          
          return !hasConflict
        })
        
        console.log('Available slots after filtering:', availableSlots) // Debug log
        setTimeSlots(availableSlots)
        
      } catch (error) {
        console.error('Error generating time slots:', error)
        // If we can't fetch existing appointments, still show all possible slots
        const allSlots = generateTimeSlots(
          selectedDentist.work_time_from,
          selectedDentist.work_time_to,
          selectedDentist.appointment_duration
        )
        console.log('Fallback: showing all slots due to error:', allSlots)
        setTimeSlots(allSlots)
      }
    }
    
    generateAvailableSlots()
  }, [selectedDentist, dateString, backendURL])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.patientId || !formData.dentistId || !formData.timeSlot || !dateString) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const [startTime, endTime] = formData.timeSlot.split(' - ')
      
      await axios.post(`${backendURL}/appointments`, {
        patientId: formData.patientId,
        dentistId: formData.dentistId,
        date: dateString,
        timeFrom: startTime,
        timeTo: endTime,
        note: formData.note
      })
      
      onAppointmentCreated()
      onOpenChange(false)
      // Reset form
      setFormData({
        patientId: '',
        dentistId: '',
        timeSlot: '',
        note: ''
      })
      setDateString('')
      setSelectedDentist(null)
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Failed to create appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Reset time slot when dentist or date changes
    if (field === 'dentistId') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        timeSlot: ''
      }))
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateString(e.target.value)
    // Reset time slot when date changes
    setFormData(prev => ({
      ...prev,
      timeSlot: ''
    }))
  }

  // Get minimum date (today) in YYYY-MM-DD format
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Appointment</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Patient Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient" className="text-right">
                Patient <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => handleChange('patientId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.patient_id} value={patient.patient_id}>
                      {patient.name} ({patient.patient_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dentist Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dentist" className="text-right">
                Dentist <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.dentistId}
                onValueChange={(value) => handleChange('dentistId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a dentist" />
                </SelectTrigger>
                <SelectContent>
                  {dentists.map((dentist) => (
                    <SelectItem key={dentist.dentist_id} value={dentist.dentist_id}>
                      Dr. {dentist.name} - {dentist.service_types}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker - Normal HTML Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={dateString}
                onChange={handleDateChange}
                min={getMinDate()}
                className="col-span-3"
                required
              />
            </div>

            {/* Show warning if selected date is not a working day */}
            {dateString && selectedDentist && !isWorkingDay(new Date(dateString), selectedDentist) && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-4 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ Selected date is not a working day for this dentist. Working days: {selectedDentist.work_days_from} to {selectedDentist.work_days_to}
                </div>
              </div>
            )}

            {/* Time Slot Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeSlot" className="text-right">
                Time Slot <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.timeSlot}
                onValueChange={(value) => handleChange('timeSlot', value)}
                disabled={!formData.dentistId || !dateString || !selectedDentist}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={
                    !formData.dentistId 
                      ? 'Select a dentist first' 
                      : !dateString 
                        ? 'Select a date first' 
                        : !selectedDentist
                          ? 'Loading dentist details...'
                          : timeSlots.length === 0 
                            ? 'No available slots for selected date' 
                            : 'Select a time slot'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot, index) => (
                    <SelectItem key={index} value={`${slot.start} - ${slot.end}`}>
                      {slot.start} - {slot.end}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="note" className="text-right mt-2">
                Note (Optional)
              </Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
                className="col-span-3"
                placeholder="Add any additional notes here..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}