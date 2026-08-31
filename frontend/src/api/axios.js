import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:3000/api",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});



let isRefreshing = false;
let refreshPromise = null;



const refreshAccessToken = async () => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = axios
    .post(
      `${
        import.meta.env.VITE_API_URL ||
        "http://localhost:3000/api"
      }/auth/refresh-token`,
      {},
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {

      return response.data;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
};



api.interceptors.request.use(
  (config) => {
    config.withCredentials = true;

    return config;
  },
  (error) => Promise.reject(error)
);



api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    const isAuthRequest =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh-token") ||
      originalRequest?.url?.includes("/auth/logout");

    if (
      status === 401 &&
      !originalRequest?._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      try {
        await refreshAccessToken();

        return api(originalRequest);
      } catch (refreshError) {

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const REFRESH_INTERVAL = 14 * 60 * 1000;

let refreshInterval = null;

export const startTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(async () => {
    try {
      await refreshAccessToken();

      console.log(
        "[Auth] Access token refreshed successfully."
      );
    } catch (error) {
      console.warn(
        "[Auth] Automatic token refresh failed."
      );
    }
  }, REFRESH_INTERVAL);
};

export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

export default api;