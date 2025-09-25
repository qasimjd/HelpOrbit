"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { useSearchParams } from 'next/navigation';

interface SocialLoginButtonsProps {
    disabled?: boolean;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ disabled = false }) => {

    const searchParams = useSearchParams();
    const from = searchParams.get("from");
    const [isLoading, setIsLoading] = useState(false);

    const handleSocialSignIn = async (provider: "google" | "github") => {
        try {
            setIsLoading(true);
            const { error } = await authClient.signIn.social({
                provider,
                callbackURL: from ?? "/"
            });
            if (error) {
                toast.error(error.message || "Social login failed. Please try again.");
                console.error(`${provider} login error:`, error);
            }
        } catch (error) {
            console.error(`${provider} login error:`, error);
            toast.error(`${provider} login failed. Please try again.`);
        }
        finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="grid grid-cols-2 gap-4">
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignIn("google")}
                disabled={disabled || isLoading}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                    <path fill="#4285F4" d="M23.64,12.2045c0-0.8045-0.0727-1.5795-0.208-2.3295H12v4.415h6.3275 c-0.272,1.47-1.1,2.715-2.347,3.555v2.9585h3.7975C22.98,18.43,23.64,15.6,23.64,12.2045z" />
                    <path fill="#34A853" d="M12,24c3.24,0,5.967-1.0725,7.956-2.916l-3.7975-2.9585c-1.053,0.7085-2.4025,1.1275-4.1585,1.1275c-3.195,0-5.9-2.1555-6.866-5.0555H1.253V18.18C3.237,21.75,7.18,24,12,24z" />
                    <path fill="#FBBC05" d="M5.1335,14.1555c-0.2385-0.7085-0.375-1.47-0.375-2.2555c0-0.7855,0.1365-1.547,0.375-2.2555V7.666 H1.253C0.4505,9.3555,0,11.1325,0,12.9c0,1.7675,0.4505,3.5445,1.253,5.2345L5.1335,14.1555z" />
                    <path fill="#EA4335" d="M12,4.78c1.9625,0,3.32,0.8475,4.0875,1.555l3.0375-3.0375C17.967,1.87,15.24,0,12,0C7.18,0,3.237,2.25,1.253,5.82L5.1335,7.7455C6.1,4.8455,8.805,2.78,12,2.78V4.78z" />
                </svg>
                Google
            </Button>
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignIn("github")}
                disabled={disabled || isLoading}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                    <path fill="#24292E" d="M12 0.297C5.373 0.297 0 5.67 0 12.297c0 5.302 3.438 9.797 8.205 11.387.6.113.82-.257.82-.57v-2.03c-3.338.727-4.033-1.61-4.033-1.61-.546-1.386-1.333-1.756-1.333-1.756-1.087-.744.082-.73.082-.73 1.203.085 1.837 1.235 1.837 1.235 1.07 1.835 2.809 1.305 3.492.998.108-.775.418-1.305.76-1.605-2.665-.304-5.467-1.335-5.467-5.933 0-1.31.469-2.382 1.235-3.222-.124-.303-.535-1.524.117-3.176 0 0 1.005-.322 3.292 1.23a11.485 11.485 0 0 1 3.005-.404c1.02.005 2.045.138 3.005.404 2.287-1.552 3.29-1.23 3.29-1.23.653 1.653.242 2.873.118 3.176.768.84 1.234 1.912 1.234 3.222 0 4.61-2.807 5.625-5.48 5.922.43.372.814 1.1.814 2.222v3.293c0 .315.217.687.825.57C20.565 22.09 24 17.6 24 12.297 24 5.67 18.627.297 12 .297z" />
                </svg>
                GitHub
            </Button>
        </div>
    )
}

export default SocialLoginButtons;