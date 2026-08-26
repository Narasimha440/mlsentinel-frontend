import type { FirebaseError } from "firebase/app";

export function getAuthErrorMessage(error: unknown): string {
    const code = (error as FirebaseError)?.code;

    switch (code) {
        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/invalid-email":
        return "Please enter a valid email address.";

        case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";

        case "auth/too-many-requests":
        return "Too many attempts. Please wait a few minutes and try again.";

        case "auth/weak-password":
        return "Password must be at least 8 characters.";

        case "auth/email-already-in-use":
        return "An account with this email already exists.";

        // OAuth
        case "auth/account-exists-with-different-credential":
        return "An account with this email already exists. Sign in with your existing method instead.";

        case "auth/credential-already-in-use":
        return "This GitHub account is already connected to another MLSentinel account.";

        case "auth/popup-closed-by-user":
        return "Sign-in was cancelled.";

        case "auth/popup-blocked":
        return "Your browser blocked the sign-in popup. Please allow popups and try again.";

        case "auth/cancelled-popup-request":
        return "Another sign-in window is already open.";

        case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";

        case "auth/operation-not-allowed":
        return "This sign-in method is currently unavailable.";

        default:
        return "Something went wrong. Please try again.";
    }
}