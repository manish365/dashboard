"use client";

import React from "react";
import Input from "./input/InputField";
import Label from "./Label";

interface FormFieldProps {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string | boolean;
    required?: boolean;
    placeholder?: string;
    className?: string;
}

export const FormField = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    error,
    required = false,
    placeholder,
    className = "",
}: FormFieldProps) => (
    <div className={className}>
        <Label>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
            error={!!error}
        />
        {error && typeof error === "string" && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);

interface PasswordFieldProps {
    label?: string;
    name?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string | boolean;
    showPassword?: boolean;
    onToggleShowPassword: () => void;
    required?: boolean;
    placeholder?: string;
}

export const PasswordField = ({
    label = "Password",
    name = "password",
    value,
    onChange,
    error,
    showPassword,
    onToggleShowPassword,
    required = false,
    placeholder,
}: PasswordFieldProps) => (
    <div>
        <Label>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="relative">
            <Input
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
                type={showPassword ? "text" : "password"}
                error={!!error}
            />
            <button
                type="button"
                onClick={onToggleShowPassword}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
                {showPassword ? "Hide" : "Show"}
            </button>
        </div>
        {error && typeof error === "string" && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);

export default FormField;
