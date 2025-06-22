'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Mail, Phone, Upload, X, Camera } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { Alert, AlertDescription } from '@/Components/ui/alert';

// Types
interface SecurityQuestion {
  id: number;
  question: string;
}

interface SecurityQuestionAnswer {
  questionId: string;
  answer: string;
}

interface ReceptionistFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  profilePicture: File | null;
  securityQuestions: SecurityQuestionAnswer[];
}

const ReceptionistSignUp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string>('');
  
  const [formData, setFormData] = useState<ReceptionistFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    profilePicture: null,
    securityQuestions: [
      { questionId: '', answer: '' },
      { questionId: '', answer: '' },
      { questionId: '', answer: '' }
    ]
  });

  // Security questions for account recovery
  const securityQuestions: SecurityQuestion[] = [
    { id: 1, question: "What was the name of your first pet?" },
    { id: 2, question: "In what city were you born?" },
    { id: 3, question: "What was your mother's maiden name?" },
    { id: 4, question: "What was the name of your elementary school?" },
    { id: 5, question: "What was your childhood nickname?" },
    { id: 6, question: "What is your favorite book?" },
    { id: 7, question: "What was the make of your first car?" },
    { id: 8, question: "In what city did you meet your spouse/significant other?" }
  ];

  const handleInputChange = (field: keyof ReceptionistFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityQuestionChange = (index: number, field: keyof SecurityQuestionAnswer, value: string) => {
    setFormData(prev => ({
      ...prev,
      securityQuestions: prev.securityQuestions.map((sq, i) => 
        i === index ? { ...sq, [field]: value } : sq
      )
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError('');
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setUploadError('File size must be less than 5MB');
        return;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
    }
  };

  const removeProfilePicture = () => {
    setFormData(prev => ({
      ...prev,
      profilePicture: null
    }));
    setProfileImagePreview(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const validateStep1 = (): boolean => {
    const required: (keyof ReceptionistFormData)[] = ['name', 'email', 'password', 'confirmPassword', 'phoneNumber'];
    return required.every(field => formData[field].trim() !== '') && 
           formData.password === formData.confirmPassword &&
           formData.password.length >= 8;
  };

  const validateStep2 = (): boolean => {
    return formData.securityQuestions.every(sq => sq.questionId && sq.answer.trim() !== '');
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (validateStep2()) {
      try {
        // Create FormData object to handle file upload
        const formDataToSend = new FormData();
        
        // Append all form fields
        Object.entries(formData).forEach(([key, value]) => {
          if (key === 'securityQuestions') {
            formDataToSend.append(key, JSON.stringify(value));
          } else if (key === 'profilePicture' && value) {
            formDataToSend.append(key, value as File);
          } else if (key !== 'profilePicture' && key !== 'confirmPassword') {
            // Don't send confirmPassword to backend, only use for validation
            formDataToSend.append(key, value as string);
          }
        });
        
        console.log('Receptionist registration data:', formData);
        
        // Example API call structure:
        // const response = await fetch('/api/receptionists/register', {
        //   method: 'POST',
        //   body: formDataToSend
        // });
        
        alert('Receptionist registration completed successfully!');
      } catch (error) {
        console.error('Registration failed:', error);
        alert('Registration failed. Please try again.');
      }
    }
  };

  const getAvailableQuestions = (currentIndex: number): SecurityQuestion[] => {
    const selectedIds = formData.securityQuestions
      .map((sq, index) => index !== currentIndex ? sq.questionId : null)
      .filter((id): id is string => id !== null && id !== '');
    
    return securityQuestions.filter(q => !selectedIds.includes(q.id.toString()));
  };

  const progressValue = (currentStep / 2) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of 2
            </span>
            <span className="text-sm font-medium text-gray-600">
              {currentStep === 1 ? 'Basic Information' : 'Security Questions'}
            </span>
          </div>
          <Progress value={progressValue} className="h-2 bg-emerald-200" />
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6 md:p-8">
            {currentStep === 1 ? (
              // Step 1: Basic Information
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-3xl font-bold text-center text-emerald-900">Create Receptionist Account</CardTitle>
                  <CardDescription className="text-center mb-8">
                    Enter your information to join as a receptionist
                  </CardDescription>
                </CardHeader>

                <div className="space-y-6">
                  {/* Profile Picture Upload */}
                  <div className="space-y-4">
                    <Label className="flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      Profile Picture (Optional)
                    </Label>
                    <div className="flex flex-col items-center space-y-4">
                      {/* Image Preview */}
                      <div className="relative">
                        {profileImagePreview ? (
                          <div className="relative">
                            <img
                              src={profileImagePreview}
                              alt="Profile preview"
                              className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200 shadow-lg"
                            />
                            <button
                              type="button"
                              onClick={removeProfilePicture}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full border-4 border-dashed border-emerald-300 flex items-center justify-center bg-emerald-50">
                            <Camera className="w-8 h-8 text-emerald-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Upload Button */}
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={triggerFileUpload}
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {profileImagePreview ? 'Change Picture' : 'Upload Picture'}
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                          JPG, PNG or GIF. Max size 5MB.
                        </p>
                      </div>
                      
                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      
                      {/* Upload Error */}
                      {uploadError && (
                        <Alert variant="destructive" className="max-w-md">
                          <AlertDescription>{uploadError}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Jane Smith"
                      className="focus-visible:ring-emerald-200"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="jane.smith@email.com"
                      className="focus-visible:ring-emerald-200"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="focus-visible:ring-emerald-200"
                    />
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="••••••••"
                        className="focus-visible:ring-emerald-200"
                      />
                      <p className="text-xs text-gray-500">Minimum 8 characters</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="••••••••"
                        className="focus-visible:ring-emerald-200"
                      />
                    </div>
                  </div>

                  {/* Validation Alerts */}
                  {formData.password && formData.password.length < 8 && (
                    <Alert variant="destructive">
                      <AlertDescription>Password must be at least 8 characters long</AlertDescription>
                    </Alert>
                  )}

                  {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                    <Alert variant="destructive">
                      <AlertDescription>Passwords do not match</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleNext}
                    disabled={!validateStep1()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    size="lg"
                  >
                    Continue to Security Questions
                  </Button>
                </div>
              </div>
            ) : (
              // Step 2: Security Questions
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-3xl font-bold text-center text-emerald-900">Security Questions</CardTitle>
                  <CardDescription className="text-center">
                    Please select and answer three security questions. These will help protect your account.
                  </CardDescription>
                </CardHeader>

                <div className="space-y-6">
                  {formData.securityQuestions.map((securityQuestion, index) => (
                    <Card key={index} className="bg-emerald-50 border-emerald-100">
                      <CardHeader>
                        <CardTitle className="text-lg text-emerald-900">Question {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select a security question</Label>
                          <select
                            value={securityQuestion.questionId}
                            onChange={(e) => handleSecurityQuestionChange(index, 'questionId', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="">Select a security question</option>
                            {getAvailableQuestions(index).map(q => (
                              <option key={q.id} value={q.id.toString()}>{q.question}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>Your Answer</Label>
                          <Input
                            type="text"
                            value={securityQuestion.answer}
                            onChange={(e) => handleSecurityQuestionChange(index, 'answer', e.target.value)}
                            placeholder="Enter your answer"
                            disabled={!securityQuestion.questionId}
                            className="focus-visible:ring-emerald-200"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="w-full sm:w-auto"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    
                    <Button
                      onClick={handleSubmit}
                      disabled={!validateStep2()}
                      className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700"
                      size="lg"
                    >
                      Complete Registration
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionistSignUp;