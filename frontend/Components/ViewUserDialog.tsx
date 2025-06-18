import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/Components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  Clock, 
  Calendar, 
  DollarSign, 
  Globe, 
  Briefcase,
  Timer
} from "lucide-react";

// Extended User interface to include all fields from both tables
interface User {
  // Common fields
  name: string;
  email: string;
  phone_number?: string;
  id: string
  
  // Dentist-specific fields
  profile_picture?: string;
  language?: string;
  service_types?: string;
  work_days_from?: string;
  work_days_to?: string;
  work_time_from?: string;
  work_time_to?: string;
  appointment_duration?: string;
  appointment_fee?: number;
  
  
  // Role identifier
  role: 'Dentist' | 'Receptionist';
}

interface Props {
  user: User | null;
  onClose: () => void;
}

export default function ViewUserDialog({ user, onClose }: Props) {
  if (!user) return null;

  const isDentist = user.role === 'Dentist';
  const userInitials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const formatWorkDays = () => {
    if (!user.work_days_from || !user.work_days_to) return null;
    return `${user.work_days_from} - ${user.work_days_to}`;
  };

  const formatWorkTime = () => {
    if (!user.work_time_from || !user.work_time_to) return null;
    return `${user.work_time_from} - ${user.work_time_to}`;
  };

  const formatServiceTypes = () => {
    if (!user.service_types) return null;
    return user.service_types.split(',').map(service => service.trim());
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-center">
            {isDentist ? 'Dentist Profile' : 'Receptionist Profile'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-auto">
          {/* Profile Section */}
          <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={user.profile_picture} 
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
                  <div className="mt-2">
                    <Badge 
                      variant={isDentist ? "default" : "secondary"}
                      className="text-sm px-3 py-1"
                    >
                      {isDentist ? 'Dentist' : 'Receptionist'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    ID: {user.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium break-all">{user.email}</p>
                  </div>
                </div>
                
                {user.phone_number && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{user.phone_number}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dentist-specific Information */}
          {isDentist && (
            <>
              {/* Professional Details */}
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    Professional Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.language && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Globe className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Language</p>
                          <p className="font-medium">{user.language}</p>
                        </div>
                      </div>
                    )}
                    
                    {user.appointment_fee && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Appointment Fee</p>
                          <p className="font-medium">${user.appointment_fee.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Information */}
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Schedule Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formatWorkDays() && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Work Days</p>
                          <p className="font-medium">{formatWorkDays()}</p>
                        </div>
                      </div>
                    )}
                    
                    {formatWorkTime() && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Work Hours</p>
                          <p className="font-medium">{formatWorkTime()}</p>
                        </div>
                      </div>
                    )}
                    
                    {user.appointment_duration && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg col-span-1 sm:col-span-2">
                        <Timer className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Appointment Duration</p>
                          <p className="font-medium">{user.appointment_duration}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Service Types */}
              {formatServiceTypes() && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-teal-600" />
                      Services Offered
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formatServiceTypes()?.map((service, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="px-3 py-1 bg-teal-50 text-teal-700 border-teal-200"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}