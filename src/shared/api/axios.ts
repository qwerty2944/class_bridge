'use client';

import axios from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: '/',
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message || err?.message || '요청 중 오류가 발생했습니다.';
    if (typeof window !== 'undefined') toast.error(message);
    return Promise.reject(err);
  },
);
