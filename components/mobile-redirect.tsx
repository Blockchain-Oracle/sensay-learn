"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { Laptop, Smartphone, Brain } from "lucide-react";

interface MobileRedirectProps {
  children: ReactNode;
}

const MobileRedirect: React.FC<MobileRedirectProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  if (!isClient) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Brain className="h-10 w-10 text-purple-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">Sensay Learn</span>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-4 inline-flex mb-6">
              <Smartphone className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Mobile Experience<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Coming Soon
              </span>
            </h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
             Blockchain Oracle is working hard on optimizing Sensay Learn for mobile devices. For the best learning experience, please access our platform from a desktop or laptop.
            </p>
            
            <div className="flex justify-center items-center text-purple-600 font-medium bg-purple-50 py-3 px-4 rounded-lg">
              <Laptop className="h-5 w-5 mr-2" />
              <span>For optimal experience, use a desktop device</span>
            </div>
            
            <p className="mt-8 text-sm text-gray-500">
              Thank you for your patience as we build the best possible AI-powered learning experience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileRedirect; 