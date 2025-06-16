"use client";

import { Bell } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const PatientHeader = () => {
  return (
    <header className="flex items-center justify-end px-6 py-4 bg-white shadow-sm">
      

      {/* Right: Notification + Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-700" />
            
          </Button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="/avatar.jpg" alt="Emily Johnson" />
            <AvatarFallback className="text-xs font-semibold">PR</AvatarFallback>
          </Avatar>
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-gray-900">Emily Johnson</p>
           
          </div>
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;
