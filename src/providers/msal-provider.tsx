'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { PublicClientApplication, EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig, isAuthEnabled } from '@/lib/msal-config';

let msalInstance: PublicClientApplication | null = null;

if (isAuthEnabled) {
  msalInstance = new PublicClientApplication(msalConfig);
}

interface Props {
  children: ReactNode;
}

function MsalAppProvider({ children }: Props) {
  const [isReady, setIsReady] = useState(!isAuthEnabled);

  useEffect(() => {
    if (!isAuthEnabled || !msalInstance) {
      setIsReady(true);
      return;
    }

    msalInstance.initialize().then(() => {
      msalInstance!.handleRedirectPromise().then((response) => {
        if (response) {
          msalInstance!.setActiveAccount(response.account);
        }
      });

      msalInstance!.addEventCallback((event: EventMessage) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
          const payload = event.payload as AuthenticationResult;
          msalInstance!.setActiveAccount(payload.account);
        }
      });

      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-slate-400">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  if (isAuthEnabled && msalInstance) {
    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
  }

  return <>{children}</>;
}

export default MsalAppProvider;
export { msalInstance };
