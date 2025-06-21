"use client";
import React, { useState } from 'react';
import { Calendar, Clock, Plus, Search, MoreHorizontal, X, Upload, FileText } from 'lucide-react';

// Types based on the database structure
interface Study {
  study_id: number;
  patient_id: string;
  radiologist_id?: number;
  date: string;
  time: string;
  modality?: string;
  report_id?: number;
  assertion_number?: number;
  description?: string;
  source?: string;
  isurgent: boolean;
  dicom_file_url?: string;
  body_part?: string;
  reason?: string;
}

interface NewStudyForm {
  patient_id: string;
  patient_name: string;
  modality: string;
  server_type: string;
  assertion_number: string;
  description: string;
  dicom_files: File[];
  report_files: File[];
}

const MedicalStudyInterface: React.FC = () => {
  const [isAddStudyOpen, setIsAddStudyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1D');
  const [activeModality, setActiveModality] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [newStudy, setNewStudy] = useState<NewStudyForm>({
    patient_id: '',
    patient_name: '',
    modality: '',
    server_type: '',
    assertion_number: '',
    description: '',
    dicom_files: [],
    report_files: []
  });

  // Mock data
  const mockStudies: Study[] = Array.from({ length: 77 }, (_, i) => ({
    study_id: i + 1,
    patient_id: 'PID001',
    date: '2024-12-01',
    time: '10:15AM',
    modality: 'CT',
    assertion_number: 203948,
    description: 'Head CT Scan',
    source: 'CT-SOURCE-AE',
    isurgent: false
  }));

  const tabs = ['1D', '3D', '1W', '1M', '1Y', 'ALL'];
  const modalities = ['All', 'CT', 'MRI', 'DX', 'IO', 'CR'];

  const handleFileUpload = (files: FileList | null, type: 'dicom' | 'report') => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    setNewStudy(prev => ({
      ...prev,
      [type === 'dicom' ? 'dicom_files' : 'report_files']: fileArray
    }));
  };

  const handleSubmitStudy = () => {
    console.log('Submitting study:', newStudy);
    // Here you would typically send the data to your API
    setIsAddStudyOpen(false);
    // Reset form
    setNewStudy({
      patient_id: '',
      patient_name: '',
      modality: '',
      server_type: '',
      assertion_number: '',
      description: '',
      dicom_files: [],
      report_files: []
    });
  };

  const displayedStudies = mockStudies.slice((currentPage - 1) * 10, currentPage * 10);
  const totalPages = Math.ceil(mockStudies.length / 10);

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-8">
       {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl mt-6 md:mt-0 font-bold tracking-tight text-gray-900">
              DICOM studies
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Here's what's happening with DICOM studies.
            </p>
          </div>
        </div>

    
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Total Studies</div>
                <div className="text-3xl font-bold text-gray-900">77</div>
                
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Today's Scans</div>
                <div className="text-3xl font-bold text-gray-900">8</div>
                
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4">
            {/* Time Period Tabs */}
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <Calendar className="w-5 h-5 text-emerald-700 mr-2" />
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Modality Filters */}
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="text-sm text-emerald-600 mr-2">Modality:</span>
              {modalities.map((modality) => (
                <button
                  key={modality}
                  onClick={() => setActiveModality(modality)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeModality === modality
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                  }`}
                >
                  {modality}
                </button>
              ))}
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-emerald-600 border border-emrald-300 rounded-lg hover:bg-emerald-50">
                  Reset
                </button>
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                  Search
                </button>
                <button
                  onClick={() => setIsAddStudyOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  <Plus className="w-4 h-4" />
                  New Study
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Studies Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Patient Studies
            </h2>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Report</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Accession</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Modality</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Source AE</th>
                  
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedStudies.map((study, index) => (
                  <tr key={study.study_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{study.patient_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">John Doe</td>
                    <td className="px-4 py-3 text-sm text-blue-600 underline cursor-pointer">Report_001.pdf</td>
                    <td className="px-4 py-3 text-sm text-gray-900">ACC-{study.assertion_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{study.modality}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{study.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{study.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{study.time}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{study.source}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {displayedStudies.map((study) => (
              <div key={study.study_id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">{study.patient_id} - John Doe</div>
                  <button className="text-emerald-400 hover:text-emerald-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Modality: {study.modality}</div>
                  <div>Description: {study.description}</div>
                  <div>Date: {study.date} at {study.time}</div>
                  <div>Accession: ACC-{study.assertion_number}</div>
                  <div className="text-blue-600 underline cursor-pointer">Report_001.pdf</div>
                </div>
              </div>
            ))}
          </div>

          =
          
        </div>
      </div>

      {/* Add New Study Modal */}
      {isAddStudyOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Add New Study</h2>
                <button
                  onClick={() => setIsAddStudyOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      value={newStudy.patient_id}
                      onChange={(e) => setNewStudy(prev => ({ ...prev, patient_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      value={newStudy.patient_name}
                      onChange={(e) => setNewStudy(prev => ({ ...prev, patient_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Study Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modality
                    </label>
                    <select
                      value={newStudy.modality}
                      onChange={(e) => setNewStudy(prev => ({ ...prev, modality: e.target.value }))}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select Modality</option>
                      <option value="CT">CT</option>
                      <option value="MRI">MRI</option>
                      <option value="DX">DX</option>
                      <option value="CR">CR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Server Type
                    </label>
                    <select
                      value={newStudy.server_type}
                      onChange={(e) => setNewStudy(prev => ({ ...prev, server_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select Server Type</option>
                      <option value="PACS">PACS</option>
                      <option value="DICOM">DICOM</option>
                      <option value="CLOUD">CLOUD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accession Number
                  </label>
                  <input
                    type="text"
                    value={newStudy.assertion_number}
                    onChange={(e) => setNewStudy(prev => ({ ...prev, assertion_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newStudy.description}
                    onChange={(e) => setNewStudy(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* File Uploads */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DICOM Files
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="text-blue-600 underline cursor-pointer">Upload a file</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">DCM, DOC, DOCX files up to 10MB</p>
                    <input
                      type="file"
                      multiple
                      accept=".dcm,.doc,.docx"
                      onChange={(e) => handleFileUpload(e.target.files, 'dicom')}
                      className="hidden"
                      id="dicom-upload"
                    />
                    <label htmlFor="dicom-upload" className="cursor-pointer">
                      <div className="mt-2">
                        {newStudy.dicom_files.length > 0 && (
                          <p className="text-sm text-green-600">
                            {newStudy.dicom_files.length} file(s) selected
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Files
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="text-blue-600 underline cursor-pointer">Upload a file</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">DICOM files cannot be 20 megabytes up to 10MB</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e.target.files, 'report')}
                      className="hidden"
                      id="report-upload"
                    />
                    <label htmlFor="report-upload" className="cursor-pointer">
                      <div className="mt-2">
                        {newStudy.report_files.length > 0 && (
                          <p className="text-sm text-green-600">
                            {newStudy.report_files.length} file(s) selected
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsAddStudyOpen(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitStudy}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Upload Study
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalStudyInterface;