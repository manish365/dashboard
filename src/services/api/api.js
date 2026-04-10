"use client";

import { getToken } from "../../utils/auth";
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";


const fetchInstance = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || result.error || "API Error");
    }
    const payload =
      result?.success && result?.data?.data !== undefined
        ? result.data.data
        : result?.success && result?.data !== undefined
          ? result.data
          : result;
    return { data: payload, status: response.status };
  } catch (error) {
    return { data: null, status: error.status };
  }
};

export default fetchInstance;
