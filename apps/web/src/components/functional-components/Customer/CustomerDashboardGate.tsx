'use client'

import { useCustomerLoginMutation, useCustomerLogoutMutation } from "@/hooks/CustomerAuth/useCustomerAuthMutations";
import { useCurrentCustomerQuery } from "@/hooks/CustomerAuth/useCustomerAuthQuery";
import { useEffect } from "react";

interface customerDashboardProps {
  children: React.ReactNode;
}

export function CustomerDashboardGate({ children }: customerDashboardProps) {
  return <>{children}</>;

 const currentUserQuery = useCurrentCustomerQuery (true); 
 const logoutMutation = useCustomerLogoutMutation (); 

 useEffect (() => {
    if (currentUserQuery.isError) { 
        window.location.replace('customer/login'); 
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