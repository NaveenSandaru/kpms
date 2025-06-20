// app/dentist/[dentistId]/dashboard/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Search, User, FileText, Calendar, Phone, Mail, Download, Upload, AlertCircle, Activity, X, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import axios from 'axios'

interface Patient {
  patient_id: string
  name: string
  email: string
  phone_number?: string
  profile_picture?: string
  blood_group?: string
  date_of_birth?: string
  gender?: string
  address?: string
  NIC?: string
}

interface Dentist {
  dentist_id: string
  name: string
  email: string
  phone_number?: string
  profile_picture?: string
  service_types?: string
  work_days_from?: string
  work_days_to?: string
  work_time_from?: string
  work_time_to?: string
  appointment_fee?: number
}

interface SOAPNote {
  note_id: number
  patient_id: string
  note: string
  date?: string
}

interface MedicalHistory {
  patient_id: string
  medical_question_id: number
  medical_question_answer: string
  question: {question_id: string, question: string}
}

interface MedicalReport {
  report_id: number
  patient_id: string
  record_URL: string
  record_name?: string
}

interface DashboardProps {
  params: {
    dentistId: string
  }
}

// Mock data - replace with actual API calls
const mockDentist: Dentist = {
  dentist_id: "D001",
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@dental.com",
  phone_number: "+1-555-0123",
  service_types: "General Dentistry, Orthodontics",
  work_days_from: "Monday",
  work_days_to: "Friday",
  work_time_from: "09:00",
  work_time_to: "17:00",
  appointment_fee: 150.00
}


export default function DentistDashboard({ params }: DashboardProps) {

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [doctorID, setDoctorID] = useState("dent123");

  const [searchTerm, setSearchTerm] = useState('')
  const [dentist, setDentist] = useState<Dentist | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileOverlayOpen, setIsMobileOverlayOpen] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingMedicalHistory, setLoadingMedicalHistory] = useState(false);
  const [loadingMedicalReports, setLoadingMedicalReports] = useState(false);
  const [loadingSOAPNotes, setLoadingSOAPNotes] = useState(false);
  const [fetchedPatients, setFetchedPatients] = useState<Patient[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [medicalReport, setMedicalReport] = useState<MedicalReport[]>([]);
  const [soapNote, setSoapNote] = useState<SOAPNote[]>([]);


  const fetchPatients = async () => {
    setLoadingPatients(true);
    try{
      const response = await axios.get(
        `${backendURL}/appointments/fordentist/patients/${doctorID}`
      );
      if(response.status == 500){
        throw new Error("Internal Server Error");
      }
      setFetchedPatients(response.data);
    }
    catch(err: any){
      window.alert(err.message);
    }
    finally{
      setLoadingPatients(false);
    }
  };

  const fetchPatientMedicalHistory = async (patient_id: string) => {
    setLoadingMedicalHistory(true);
    try{
      const response = await axios.get(
        `${backendURL}/medical-history/${patient_id}`
      );
      if(response.status == 500){
        throw new Error("Internal Server Error");
      }
      setMedicalHistory(response.data);
    }
    catch(err:any){
      window.alert(err.message);
    }
    finally{
      setLoadingMedicalHistory(false);
    }
  };

  const fetchPatientMedicalReports = async (patient_id: string) => {
    setLoadingMedicalReports(true);
    try{
      const response = await axios.get(
        `${backendURL}/medical-reports/forpatient/${patient_id}`
      );
      if(response.status == 500){
        throw new Error("Internal Server Error");
      }
      setMedicalReport(response.data);
    }
    catch(err: any){
      window.alert(err.message);
    }
    finally{
      setLoadingMedicalReports(true);
    }
  };

  const fetchPatientSOAPNotes = async(patient_id: string) => {
    setLoadingSOAPNotes(true);
    try{
      const response = await axios.get(
        `${backendURL}/soap-notes/forpatient/${patient_id}`
      );
      if(response.status == 500){
        throw new Error("Internal Server Error");
      }
      setSoapNote(response.data);
    }
    catch(err: any){
      window.alert(err.message);
    }
    finally{
      setLoadingSOAPNotes(false);
    }
  }

  const filteredPatients = fetchedPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsMobileOverlayOpen(true)
  }

  const closeMobileOverlay = () => {
    setIsMobileOverlayOpen(false)
  }

  useEffect(()=>{
    if(selectedPatient){
      fetchPatientMedicalHistory(selectedPatient.patient_id);
      fetchPatientMedicalReports(selectedPatient.patient_id);
      fetchPatientSOAPNotes(selectedPatient.patient_id);
    }
    else{
      setMedicalHistory([]);
      setMedicalReport([]);
      setSoapNote([]);
    }
  },[selectedPatient]);

  useEffect(() => {
    // Simulate API call to fetch dentist data
    const fetchDentistData = async () => {
      try {
        setDentist(mockDentist)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching dentist data:', error)
        setLoading(false)
      }
    }

    fetchDentistData()
  }, [params.dentistId]);

  useEffect(()=>{
    fetchPatients();
  },[]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  const PatientDetailsContent = () => (
    <div className="h-full flex flex-col">
      {/* Patient Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={selectedPatient?.profile_picture} />
            <AvatarFallback className="text-lg">
              {selectedPatient?.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{selectedPatient?.name}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{selectedPatient?.email}</span>
              </div>
              {selectedPatient?.phone_number && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{selectedPatient.phone_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Details */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="details" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history" className="lg:hidden">History</TabsTrigger>
            <TabsTrigger value="history" className="hidden lg:block">Medical History</TabsTrigger>
            <TabsTrigger value="reports" className="lg:hidden">Reports</TabsTrigger>
            <TabsTrigger value="reports" className="hidden lg:block">Medical Reports</TabsTrigger>
            <TabsTrigger value="notes" className="lg:hidden">Notes</TabsTrigger>
            <TabsTrigger value="notes" className="hidden lg:block">SOAP Notes</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-6">
            <TabsContent value="details" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                      <p className="text-gray-900">{selectedPatient?.date_of_birth || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Gender</label>
                      <p className="text-gray-900">{selectedPatient?.gender || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Blood Group</label>
                      <p className="text-gray-900">{selectedPatient?.blood_group || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">NIC</label>
                      <p className="text-gray-900">{selectedPatient?.NIC || 'Not provided'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      <p className="text-gray-900">{selectedPatient?.address || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPatient && medicalHistory.map((history, index) => (
                      <div key={`${history.patient_id}-${history.medical_question_id}`} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{history.question?.question}</p>
                            <p className="text-gray-600 mt-1">{history.medical_question_answer}</p>
                          </div>
                          {history.medical_question_answer.toLowerCase().includes('yes') && 
                           history.question?.question.toLowerCase().includes('disease') && (
                            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                    {selectedPatient && medicalHistory.length === 0 && (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No medical history available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4 mt-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Medical Reports
                </h3>
                <Button className='bg-emerald-500 hover:bg-emerald-600' size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Report
                </Button>
              </div>
              <div className="grid gap-4">
                {selectedPatient && medicalReport.map((report) => (
                  <Card key={report.report_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{report.record_name}</h4>
                          </div>
                        </div>
                        <Button className=' hover:bg-emerald-100' variant="outline" size="sm" asChild>
                          <a href={report.record_URL} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            View
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {selectedPatient && medicalReport.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No medical reports available</p>
                      <Button className='bg-emerald-500 hover:bg-emerald-600' variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload First Report
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">SOAP Notes</h3>
                <Button className='bg-emerald-500 hover:bg-emerald-600' size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
              <div className="space-y-4">
                {selectedPatient && soapNote.map((note) => (
                  <Card key={note.note_id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500">
                          {note.date}
                        </span>
                      </div>
                      <p className="text-gray-900">{note.note}</p>
                    </CardContent>
                  </Card>
                ))}
                {selectedPatient && soapNote.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No SOAP notes available for this patient</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex flex-1 p-4 gap-4 overflow-hidden">
        {/* Sidebar - Patient List */}
        <div className={`${isMobileOverlayOpen ? 'hidden' : 'flex'} lg:flex w-full lg:w-96 bg-emerald-50 border rounded-3xl border-emerald-200 flex-col overflow-hidden`}>
          <div className="p-4 border-b border-emerald-200 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {filteredPatients.map((patient) => (
                <Card 
                  key={patient.patient_id}
                  className={`mb-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedPatient?.patient_id === patient.patient_id ? 'ring-2 ring-emerald-500' : ''
                  }`}
                  onClick={() => handlePatientSelect(patient)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={patient.profile_picture} />
                        <AvatarFallback>
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{patient.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{patient.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {patient.blood_group && (
                            <Badge variant="secondary" className="text-xs">
                              {patient.blood_group}
                            </Badge>
                          )}
                          {medicalHistory.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Activity className="h-3 w-3 mr-1" />
                              History
                            </Badge>
                          )}
                          {medicalReport.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              Reports
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Desktop */}
        <div className={`${isMobileOverlayOpen ? 'hidden' : 'hidden'} lg:flex flex-1 overflow-hidden`}>
          {selectedPatient ? (
            <div className="w-full p-6 overflow-hidden">
              <PatientDetailsContent />
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <div className="text-center">
                <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                <p className="text-gray-500">Choose a patient from the list to view their details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOverlayOpen && selectedPatient && (
        <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeMobileOverlay}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Patients
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeMobileOverlay}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Mobile Content */}
          <div className="flex-1 overflow-hidden p-4">
            <PatientDetailsContent />
          </div>
        </div>
      )}

      {/* Desktop Patient Details */}
      {!isMobileOverlayOpen && selectedPatient && (
        <div className="hidden lg:block fixed inset-y-0 right-0 w-2/3 bg-white border-l border-gray-200 z-40">
          <div className="h-full p-6 overflow-hidden">
            <PatientDetailsContent />
          </div>
        </div>
      )}
    </div>
  )
}