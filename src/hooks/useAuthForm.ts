"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { loginUser } from "@/services/api/auth";
import { useAppStore } from "@/stores/app-store";
import { assignRole } from "@/lib/roles";

export const useAuthForm = <T extends Record<string, any>>(initialState: T) => {
  const router = useRouter();
  const { dispatch } = useAppStore();

  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Min 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validate();
    if (!isValid) return;
    setIsSubmitting(true);
    const postdata = { email: formData.email, password: formData.password };
    try {
      const res = await loginUser(postdata);
      if (res && res.data && res.data.access_token) {
        setAuthToken(res.data.access_token);
        
        // Update global store
        const userEmail = formData.email;
        const userData = {
          email: userEmail,
          name: userEmail.split("@")[0],
          role: assignRole(userEmail)
        };
        
        dispatch({ type: "SET_USER", payload: userData });
        dispatch({ type: "SET_AUTHENTICATED", payload: true });
        
        router.push("/dashboard");
      } else {
        setErrors((prev) => ({ ...prev, api: res?.data?.message || "Login failed", }));
      }
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, api: error instanceof Error ? error.message : "Login failed", }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const setAuthToken = (token: string) => {
    Cookies.set("kp_authToken", token, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setErrors,
    router,
  };
};
