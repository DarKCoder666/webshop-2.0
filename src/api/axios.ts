import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { getApiUrl } from "@/lib/env";
import http from 'http';
import https from 'https';

const apiUrl = getApiUrl();

// Axios retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create HTTP agents for keep-alive connections (only on server-side)
const httpAgent = typeof window === 'undefined' ? new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  maxFreeSockets: 10,
}) : undefined;

const httpsAgent = typeof window === 'undefined' ? new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  maxFreeSockets: 10,
  rejectUnauthorized: true,
}) : undefined;

const instance = axios.create({
  withCredentials: true,
  baseURL: `${apiUrl}/v1/`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies are included in requests
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  // Add timeout to prevent hanging requests (30 seconds)
  timeout: 30000,
  // Keep-alive and connection settings
  httpAgent,
  httpsAgent,
});

// Request interceptor to ensure credentials are always sent
instance.interceptors.request.use(
  function (config) {
    // Ensure withCredentials is set for every request
    config.withCredentials = true;
    
    // Add additional headers if needed
    if (typeof window !== "undefined") {
      // Add any client-side specific headers safely with AxiosHeaders
      const headers = new AxiosHeaders(config.headers as any);
      headers.set('Accept', 'application/json');
      config.headers = headers;
    }
    
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Helper function to determine if error is retryable
function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('config' in error)) return false;
  
  const axiosError = error as { 
    config?: InternalAxiosRequestConfig & { __retryCount?: number };
    response?: { status: number };
    code?: string;
    message?: string;
  };
  
  if (!axiosError.config) return false;
  
  // Don't retry if we've already retried too many times
  const retryCount = axiosError.config.__retryCount || 0;
  if (retryCount >= MAX_RETRIES) return false;
  
  // Retry on network errors
  if (!axiosError.response && (
    axiosError.code === 'ECONNRESET' ||
    axiosError.code === 'ETIMEDOUT' ||
    axiosError.code === 'ECONNABORTED' ||
    axiosError.code === 'ENOTFOUND' ||
    axiosError.code === 'ENETUNREACH'
  )) {
    return true;
  }
  
  // Retry on 5xx server errors (except 501)
  if (axiosError.response && axiosError.response.status >= 500 && axiosError.response.status !== 501) {
    return true;
  }
  
  // Retry on timeout
  if (axiosError.code === 'ECONNABORTED' && axiosError.message?.includes('timeout')) {
    return true;
  }
  
  return false;
}

// Helper function to delay retry
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error: unknown) {
    // Type guard for axios error
    const axiosError = error as {
      config?: InternalAxiosRequestConfig & { __retryCount?: number };
      response?: { status: number; data?: { message?: string } };
      message?: string;
      code?: string;
    };
    
    const config = axiosError.config;
    
    // Check if error is retryable
    if (isRetryableError(error) && config) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      
      // Log retry attempt (only on server-side to avoid console spam)
      if (typeof window === "undefined") {
        console.log(`Retrying request (attempt ${config.__retryCount}/${MAX_RETRIES}): ${config.url}`);
      }
      
      // Wait before retrying with exponential backoff
      await delay(RETRY_DELAY * config.__retryCount);
      
      // Retry the request
      return instance(config);
    }
    
    const message = axiosError.response?.data?.message;

    if (axiosError.response?.status === 401) {
      // Clear any stored auth state on 401
      if (typeof window !== "undefined") {
        // The auth store will handle this
        console.log('401 Unauthorized - clearing auth state');
      }
      return Promise.reject(error);
    }

    // Only show toast on client-side
    if (typeof window !== "undefined") {
      toast.error(message || "Something went wrong! Try again later!");
    } else {
      // Log error on server-side for debugging
      console.error('API Error:', {
        url: config?.url,
        method: config?.method,
        status: axiosError.response?.status,
        message: message || axiosError.message,
        code: axiosError.code,
      });
    }

    return Promise.reject(error);
  }
);

export default instance;
