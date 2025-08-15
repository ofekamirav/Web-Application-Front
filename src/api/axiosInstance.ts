import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type AxiosHeaderValue,
  type RawAxiosRequestHeaders,
} from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const axiosInstance = axios.create({
  baseURL: backendUrl,
});

export type RefreshResult = { accessToken: string; refreshToken: string };

export type Hooks = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setAccessToken: (t: string) => void;
  setRefreshToken: (t: string) => void;
  onLogout: () => Promise<void> | void;
  refreshCall: (rt: string) => Promise<RefreshResult>;
};

function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
  let headers = config.headers;
  if (!headers) {
    headers = new AxiosHeaders();
  } else if (!(headers instanceof AxiosHeaders)) {
    const raw = headers as unknown as RawAxiosRequestHeaders;
    const h = new AxiosHeaders();
    for (const key in raw) {
      const val = raw[key as keyof RawAxiosRequestHeaders] as
        | AxiosHeaderValue
        | undefined;
      if (val !== undefined) h.set(key, val);
    }
    headers = h;
  }
  (headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  config.headers = headers;
}

export const attachAuthInterceptors = (hooks: Hooks) => {
  axiosInstance.interceptors.request.use((config) => {
    const token = hooks.getAccessToken();
    if (token) setAuthHeader(config as InternalAxiosRequestConfig, token);
    return config;
  });

  let isRefreshing = false;
  let waiters: Array<(t: string) => void> = [];

  axiosInstance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined;
      const status = error.response?.status;

      if ((status === 401 || status === 403) && original && !original._retry) {
        original._retry = true;

        const rt = hooks.getRefreshToken();
        if (!rt) {
          await hooks.onLogout();
          return Promise.reject(error);
        }

        try {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              waiters.push((token) => {
                setAuthHeader(original, token);
                axiosInstance(original).then(resolve).catch(reject);
              });
            });
          }

          isRefreshing = true;
          const { accessToken, refreshToken } = await hooks.refreshCall(rt);

          hooks.setAccessToken(accessToken);
          hooks.setRefreshToken(refreshToken);

          waiters.forEach((cb) => cb(accessToken));
          waiters = [];
          isRefreshing = false;

          setAuthHeader(original, accessToken);
          return axiosInstance(original);
        } catch (e) {
          isRefreshing = false;
          waiters = [];
          await hooks.onLogout();
          return Promise.reject(e);
        }
      }

      return Promise.reject(error);
    }
  );
};
