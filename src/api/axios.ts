import axios, { AxiosHeaders } from "axios";
import toast from "react-hot-toast";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const instance = axios.create({
  withCredentials: true,
  baseURL: `${apiUrl}/v1/`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies are included in requests
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
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

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const message = error?.response?.data?.message;

    if (error?.response?.status === 401) {
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
    }

    return Promise.reject(error);
  }
);

export default instance;
