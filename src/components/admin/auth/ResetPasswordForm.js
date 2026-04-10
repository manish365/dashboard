"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "../../../services/api/auth";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import AuthFormContainer from "./AuthFormContainer";

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token. Please request a new one.");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setMessage("");

        try {
            const res = await resetPassword(token, password);
            if (res && res.data && res.data.success !== false) {
                setMessage("Password reset successfully. You can now login with your new password.");
                setTimeout(() => {
                    router.push("/wp-admin/login");
                }, 3000);
            } else {
                setError(res.data.message || "Failed to reset password. The link might be expired.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthFormContainer
            title="Reset Password"
            description="Set your new account password"
        >
            <div className="space-y-6">
                {message && (
                    <div className="p-3 text-sm text-center text-green-800 bg-green-100 border border-green-200 rounded-lg">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="p-3 text-sm text-center text-white bg-red-500 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Label>New Password<span className="text-red-500">*</span></Label>
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-10 text-gray-500 text-xs"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <div>
                        <Label>Confirm Password<span className="text-red-500">*</span></Label>
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            required
                        />
                    </div>

                    <Button
                        className="w-full"
                        size="sm"
                        type="submit"
                        disabled={isSubmitting || !token}
                    >
                        {isSubmitting ? "Resetting Password..." : "Reset Password"}
                    </Button>
                </form>
            </div>
        </AuthFormContainer>
    );
}
