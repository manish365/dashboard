"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { loginUser } from "../../services/api/auth";
import AuthContext from "../../context/admin/AuthContext";

export const useAuthForm = (initialState) => {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
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
    const newErrors = {};
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validate();
    if (!isValid) return;
    setIsSubmitting(true);
    const postdata = { email: formData.email, password: formData.password };
    try {
      const res = await loginUser(postdata);
      if (res && res.data && res.data.access_token) {
        setAuthToken(res.data.access_token);

        if (authContext && authContext.login) {
          await authContext.login(res.data.user || res.data);
        }

        router.push("/wp-admin");
      } else {
        setErrors((prev) => ({ ...prev, api: res?.data?.message || "Login failed", }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, api: error instanceof Error ? error.message : "Login failed", }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const setAuthToken = (token) => {
    Cookies.set("authToken", token, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/wp-admin",
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
