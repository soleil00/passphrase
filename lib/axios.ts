
import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
  timeout: 20000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    // "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    // "Pragma": "no-cache",
    // "Expires": "30d",
  },
});

if (typeof window !== "undefined") {
  const token = localStorage.getItem("token");
  if (token) {
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

// axiosClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     if (error.response?.status === 401) {
//       // alert("Your session has expired. Please login again.");
//       if (typeof window !== "undefined") {
//         // localStorage.removeItem("token");
//         // const { default: store } = await import("@/redux/store");
//         // store.dispatch(handleExpired());
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosClient;
