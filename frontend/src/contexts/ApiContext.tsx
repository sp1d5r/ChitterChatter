import React, { createContext, useContext, useCallback, useState } from 'react';
import { useAuth } from './AuthenticationProvider';
import {FirebaseAuthService} from 'shared';

interface ApiContextType {
  fetchWithAuth: (endpoint: string, options?: RequestInit) => Promise<Response>;
  apiUrl: string;
  setApiUrl: (url: string) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const [apiUrl, setApiUrl] = useState<string>(import.meta.env.VITE_API_URL || 'http://localhost:3001');

  const fetchWithAuth = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});

    // Only set Content-Type if we're not sending FormData
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (authState.user) {
      const token = await FirebaseAuthService.getToken();
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Log request details for debugging
    console.log('Making request to:', `${apiUrl}/${endpoint}`);
    console.log('Request options:', {
      ...options,
      headers: Object.fromEntries(headers.entries()),
      body: options.body instanceof FormData 
        ? 'FormData (contents logged below)' 
        : options.body
    });

    if (options.body instanceof FormData) {
      console.log('FormData contents:');
      for (const [key, value] of options.body.entries()) {
        console.log(`${key}:`, value);
      }
    }

    const response = await fetch(`${apiUrl}/${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response;
  }, [authState.user, apiUrl]);

  return (
    <ApiContext.Provider value={{ fetchWithAuth, apiUrl, setApiUrl }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};