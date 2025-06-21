"use client";

import { Bell } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { useMemo, useState, useEffect } from "react";

interface RadiologistInfo {
  id: string;
  name: string;
  specialization: string;
  avatar?: string;
}

const RadiologistHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [radiologistInfo, setRadiologistInfo] = useState<RadiologistInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract radiologistID from pathname
  const radiologistId = useMemo(() => {
    const segments = pathname.split("/");
    const idx = segments.findIndex((seg) => seg === "radiologist");
    if (idx !== -1 && segments[idx + 1]) {
      return segments[idx + 1];
    }
    return null;
  }, [pathname]);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

  useEffect(() => {
    const fetchInfo = async () => {
      if (!radiologistId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // Replace with real API call when backend is ready
        const mock: Record<string, RadiologistInfo> = {
          "101": { id: "101", name: "Dr. Amy Lee", specialization: "Neuroradiology", avatar: "/avatar-amy.jpg" },
          "102": { id: "102", name: "Dr. John Park", specialization: "Musculoskeletal", avatar: "/avatar-john.jpg" },
        };
        setRadiologistInfo(
          mock[radiologistId] || {
            id: radiologistId,
            name: `Dr. User ${radiologistId}`,
            specialization: "Radiologist",
          }
        );
      } catch (e) {
        console.error(e);
        setRadiologistInfo({ id: radiologistId, name: `Dr. User ${radiologistId}`, specialization: "Radiologist" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, [radiologistId]);

  const handleProfileClick = () => {
    if (radiologistId) {
      router.push(`/radiologist/${radiologistId}/profile`);
    }
  };

  const handleNotificationClick = () => {
    if (radiologistId) {
      router.push(`/radiologist/${radiologistId}/notifications`);
    }
  };

  if (!radiologistId) return null;

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white">
      {/* Left */}
      <div className="hidden sm:flex flex-col min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1 truncate">
          {isLoading ? (
            <span className="animate-pulse h-8 w-64 bg-gray-200 rounded" />
          ) : (
            `Welcome back, ${radiologistInfo?.name || "Radiologist"}`
          )}
        </h1>
        <p className="text-sm text-gray-500">{getCurrentDate()}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-4">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 sm:h-10 sm:w-10"
            onClick={handleNotificationClick}
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full animate-pulse" />
          ) : (
            <Avatar
              className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer hover:ring-2 hover:ring-emerald-300"
              onClick={handleProfileClick}
            >
              <AvatarImage src={radiologistInfo?.avatar} alt={radiologistInfo?.name} />
              <AvatarFallback className="text-xs sm:text-sm font-semibold bg-emerald-100 text-emerald-800">
                {radiologistInfo ? getInitials(radiologistInfo.name) : "RD"}
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
                  {radiologistInfo?.name || "Radiologist"}
                </p>
                <p className="text-xs text-gray-500">
                  {radiologistInfo?.specialization || "Radiology"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default RadiologistHeader;