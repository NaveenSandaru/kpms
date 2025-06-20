"use client";
import { Bell } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect } from "react";

interface DoctorInfo {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
}

const ReceptionistHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [receptionistInfo, setReceptionistInfo] = useState<DoctorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract receptionistID from pathname
  const receptionistId = useMemo(() => {
    const pathSegments = pathname.split('/');
    const receptionistIndex = pathSegments.findIndex(segment => segment === 'receptionist');
    if (receptionistIndex !== -1 && pathSegments[receptionistIndex + 1]) {
      return pathSegments[receptionistIndex + 1];
    }
    return null;
  }, [pathname]);

  // Get current date
  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Generate doctor initials from name
  const getDoctorInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch doctor info based on  receptionistID
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      if (!receptionistId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Replace this with your actual API call
        // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/receptionists/${receptionistId}`);
        // const data = await response.json();
        
        // Mock data for demonstration - replace with actual API call
        const mockDoctorData: Record<string, DoctorInfo> = {
          '123': { id: '123', name: 'Dr. Sarah Chen', specialty: 'Cardiologist', avatar: '/avatar-chen.jpg' },
          '456': { id: '456', name: 'Dr. Michael Smith', specialty: 'Neurologist', avatar: '/avatar-smith.jpg' },
          '789': { id: '789', name: 'Dr. Emily Johnson', specialty: 'Pediatrician', avatar: '/avatar-johnson.jpg' },
        };

        const receptionist = mockDoctorData[receptionistId] || {
          id: receptionistId,
          name: `Dr. User ${receptionistId}`,
          specialty: 'Physician',
        };

        setReceptionistInfo(receptionist);
      } catch (error) {
        console.error('Error fetching doctor info:', error);
        // Fallback doctor info
        setReceptionistInfo({
          id: receptionistId,
          name: `Dr. User ${receptionistId}`,
          specialty: 'Physician',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorInfo();
  }, [receptionistId]);

  // Handle profile navigation
  const handleProfileClick = () => {
    if (receptionistId) {
      router.push(`/doctor/${receptionistId}/profile`);
    }
  };

  // Handle notification click
  const handleNotificationClick = () => {
    if (receptionistId) {
      router.push(`/doctor/${receptionistId}/notifications`);
    }
  };

  // Don't render if no receptionistID is found
  if (!receptionistId) {
    return null;
  }

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white">
      {/* Left side: Welcome message and date - hidden on mobile */}
      <div className="hidden sm:flex flex-col min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1 truncate">
          {isLoading ? (
            <span className="animate-pulse bg-gray-200 h-8 w-64 rounded"></span>
          ) : (
            `Welcome back !`
          )}
        </h1>
        <p className="text-sm text-gray-500">
          {getCurrentDate()}
        </p>
      </div>

      {/* Mobile: Welcome message - shown only on mobile 
      <div className="sm:hidden flex flex-col min-w-0 flex-1">
        <h1 className="text-lg font-semibold text-gray-900 truncate">
          {isLoading ? (
            <span className="animate-pulse bg-gray-200 h-6 w-32 rounded"></span>
          ) : (
            `Hello, ${doctorInfo?.name?.split(' ')[1] || 'Doctor'}`
          )}
        </h1>
        <p className="text-xs text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </div>*/}

      {/* Right side: Notification + Profile */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-4">
        {/* Notification Bell */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-8 w-8 sm:h-10 sm:w-10"
            onClick={handleNotificationClick}
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500 rounded-full"></span>
          </Button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full animate-pulse"></div>
          ) : (
            <Avatar 
              className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all duration-200" 
              onClick={handleProfileClick}
            >
              <AvatarImage src={receptionistInfo?.avatar} alt={receptionistInfo
                ?.name} />
              <AvatarFallback className="text-xs sm:text-sm font-semibold bg-emerald-100 text-emerald-800">
                {receptionistInfo ? getDoctorInitials(receptionistInfo.name) : 'R'}
              </AvatarFallback>
            </Avatar>
          )}
          
          {/* Profile details - hidden on mobile */}
          <div className="hidden sm:flex flex-col text-right leading-tight">
            {isLoading ? (
              <div className="space-y-1">
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-3 w-16 rounded"></div>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-900">
                  {receptionistInfo?.name || 'Receptionist'}
                </p>
              
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ReceptionistHeader;