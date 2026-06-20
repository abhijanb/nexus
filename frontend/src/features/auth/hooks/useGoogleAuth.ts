import { toast } from "sonner";
import { authClient } from "../../../shared/lib/auth-client";

import { useState } from "react";

export const useGoogleAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        const { data, error } = await authClient.signIn.social({
            provider: "google",
            callbackURL: `${import.meta.env.VITE_APP_URL || window.location.origin}/`,
        });

        if (error) {
            toast.error(error.message);
            setIsLoading(false);
            return;
        }

        if (data?.url) {
            window.location.href = data.url;
            return;
        }

        setIsLoading(false);
    };

    const handleGoogleLogout = async () => {
        const { error } = await authClient.signOut();

        if (error) {
            toast.error(error.message);
            return;
        }
        toast.success("Logged out successfully");
    };
    return {
        handleGoogleLogin,
        handleGoogleLogout,
        isLoading
    }
}
