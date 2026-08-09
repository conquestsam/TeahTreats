'use client'

import { useCurrentCustomerQuery } from "@/hooks/CustomerAuth/useCustomerAuthQuery";
import { useEffect } from "react";

interface customerDashboardProps {
  children: React.ReactNode;
}

export function CustomerDashboardGate({ children }: customerDashboardProps) {
 const currentUserQuery = useCurrentCustomerQuery (true); 

 useEffect (() => {
    if (currentUserQuery.isError) { 
        window.location.replace('/login'); 
    }
 }, [currentUserQuery.isError]); 
if (currentUserQuery.isLoading || currentUserQuery.isError) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="loader"></div>
            <p className="text-gray-500 mt-4">Checking your session...</p>
        </div>
    );
  }

  return (
    <div>
      {children}
    </div>
  );    

}
