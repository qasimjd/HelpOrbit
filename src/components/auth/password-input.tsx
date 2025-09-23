"use client";


import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PasswordInputProps = {
    label: string;
    id: string;
    register: UseFormRegisterReturn;
    error?: FieldError;
    value: string;
    placeholder?: string;
    autoComplete?: string;
    showRequirements?: boolean;
    isConfirmPassword?: boolean;
    passwordToMatch?: string;
    disabled?: boolean;
};

const PasswordInput = ({
    label,
    id,
    register,
    error,
    value,
    placeholder = "••••••••",
    autoComplete = "new-password",
    showRequirements = false,
    isConfirmPassword = false,
    passwordToMatch = "",
    disabled = false,
}: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);
    const [requirements, setRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });
    const [isMatching, setIsMatching] = useState(false);

    useEffect(() => {

        setRequirements({
            length: value?.length >= 8,
            uppercase: /[A-Z]/.test(value),
            lowercase: /[a-z]/.test(value),
            number: /\d/.test(value),
            special: /[@$!%*?&.,]/.test(value),
        });

        if (isConfirmPassword) {
            setIsMatching(value === passwordToMatch && value?.length > 0);
        }
    }, [value, passwordToMatch, isConfirmPassword]);

    return (
        <div>
            <Label
                htmlFor={id}
                className="block text-sm font-medium mb-1 text-foreground"
            >
                {label}
            </Label>
            <div
                className="relative"
            >
                <Input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    {...register}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={`pr-10 ${error || (isConfirmPassword && value?.length > 0 && !isMatching)
                        ? "border-destructive focus-visible:ring-destructive/30 focus-visible:ring-2 " : ""}`}
                    disabled={disabled}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    disabled={disabled}
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
            </div>


            {isConfirmPassword && focused && value?.length > 0 && (
                <p className={`mt-1 text-sm ${isMatching ? "text-green-500" : "text-destructive"}`}>
                    {isMatching ? "Passwords match!" : "Passwords do not match"}
                </p>
            )}

            {showRequirements && focused && value?.length > 0 && (
                <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
                    <ul className="text-xs space-y-1">
                        <li className={requirements.length ? "text-green-500" : "text-muted-foreground"}>
                            {requirements.length ? "✓" : "•"} At least 8 characters
                        </li>
                        <li className={requirements.lowercase ? "text-green-500" : "text-muted-foreground"}>
                            {requirements.lowercase ? "✓" : "•"} Lowercase letter (a-z)
                        </li>
                        <li className={requirements.uppercase ? "text-green-500" : "text-muted-foreground"}>
                            {requirements.uppercase ? "✓" : "•"} Uppercase letter (A-Z)
                        </li>
                        <li className={requirements.number ? "text-green-500" : "text-muted-foreground"}>
                            {requirements.number ? "✓" : "•"} Number (0–9)
                        </li>
                        <li className={requirements.special ? "text-green-500" : "text-muted-foreground"}>
                            {requirements.special ? "✓" : "•"} Special character (@$!%*?&.,)
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PasswordInput;