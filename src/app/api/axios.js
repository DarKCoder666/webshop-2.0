import axios from "axios";
import toast from "react-hot-toast";
import { env } from "next-runtime-env";

const apiUrl = env("NEXT_PUBLIC_API_URL");

const instance = axios.create({
  withCredentials: true,
  baseURL: `${apiUrl}/v1/`,
});

instance.interceptors.response.use(
  function (response) {
    // Optional: Do something with response data
    return response;
  },
  function (error) {
    const message = error?.response?.data?.message;

    if (error?.response?.status === 401) {
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
