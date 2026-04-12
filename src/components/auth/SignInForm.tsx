"use client";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthForm } from "@/hooks/useAuthForm";
import Button from "@/components/ui/button/Button";
import KpLink from "@/components/common/KpLink";
import AuthFormContainer from "@/components/auth/AuthFormContainer";
import { FormField, PasswordField } from "@/components/form/FormField";
import Cookies from 'js-cookie';
import { getToken } from "@/utils/auth";

export default function SignInForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [authMessage, setAuthMessage] = React.useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { formData, errors, isSubmitting, handleChange, handleSubmit } = useAuthForm({
    email: "",
    password: ""
  });

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.push("/dashboard");
      return;
    }
    Cookies.remove("kp_authToken", { path: "/" });
    const message = searchParams.get('message');
    if (message) {
      setAuthMessage(decodeURIComponent(message));
    }
  }, [router, searchParams]);

  return (
    <AuthFormContainer
      title="WP-Admin Sign In"
      description="Enter your credentials to access the admin panel"
    >
      <div>
        {authMessage && (
          <div className="p-3 mb-4 text-sm text-center text-blue-800 bg-blue-100 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
            {authMessage}
          </div>
        )}

        {errors.api && (
          <div className="p-3 mb-3 text-sm text-center text-white bg-red-500 rounded-lg dark:bg-red-600">
            {errors.api}
          </div>
        )}

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Demo Credentials:</h4>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div><strong>Email:</strong> admin@kestopur.com</div>
            <div><strong>Password:</strong> admin1234</div>
            <div className="text-blue-600 dark:text-blue-400 mt-2">For admin and employee users only</div>
          </div>
        </div>

        <div className="space-y-5">
          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="admin@kestopur.com"
          />

          <PasswordField
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword(!showPassword)}
            required
          />

          <div className="flex items-center justify-between">
            <KpLink
              url="/forgot-password"
              kpclass="text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400"
              title="Forgot password?"
            />
          </div>

          <Button
            className="w-full"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing In..." : "Sign In to WP-Admin"}
          </Button>
        </div>

        <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>Access Requirements:</strong>
            <ul className="mt-1 list-disc list-inside text-xs space-y-1">
              <li>Admin or Employee account required</li>
              <li>Customer accounts cannot access wp-admin</li>
              <li>Account must be active status</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthFormContainer>
  );
}
