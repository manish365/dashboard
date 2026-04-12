"use client";
import React, { useState } from "react";
import { forgotPassword } from "@/services/api/auth";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import AuthFormContainer from "@/components/auth/AuthFormContainer";
import KpLink from "@/components/common/KpLink";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setMessage("");

        try {
            const res = await forgotPassword(email);
            if (res && res.data && res.data.message) {
                setMessage(res.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send reset link");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthFormContainer
            title="Forgot Password"
            description="Enter your email to receive a password reset link"
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
                    <div>
                        <Label>Email Address<span className="text-red-500">*</span></Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@kestopur.com"
                            required
                        />
                    </div>

                    <Button
                        className="w-full"
                        size="sm"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Sending Link..." : "Send Reset Link"}
                    </Button>

                    <div className="text-center">
                        <KpLink
                            url="/login"
                            kpclass="text-sm text-brand-500 hover:text-brand-600"
                            title="Back to Login"
                        />
                    </div>
                </form>
            </div>
        </AuthFormContainer>
    );
}
