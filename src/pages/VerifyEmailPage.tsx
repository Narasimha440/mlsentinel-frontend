import { useEffect, useState } from "react";
import {
  reload,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import {
  CheckCircle2,
  Mail,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { auth } from "../lib/firebase";

const VERIFY_EMAIL_URL =
  "https://mlsentinel.dev/verify-email";

export default function VerifyEmailPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");

  /*
   * Load current Firebase user
   */
  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    setEmail(user.email ?? "");

    if (user.emailVerified) {
      setVerified(true);
    }
  }, [navigate]);

  /*
   * Check whether Firebase now considers
   * the user's email verified.
   */
  const checkVerification = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    setChecking(true);
    setMessage("");

    try {
      await reload(user);

      const refreshedUser = auth.currentUser;

      if (refreshedUser?.emailVerified) {
        setVerified(true);
        setMessage("");
        return;
      }

      setMessage(
        "Your email is not verified yet. Please click the verification link in your email."
      );
    } catch (error) {
      console.error(
        "Email verification check failed:",
        error
      );

      setMessage(
        "We couldn't check your verification status. Please try again."
      );
    } finally {
      setChecking(false);
    }
  };

  /*
   * Resend verification email
   */
  const resendVerification = async () => {
    const user = auth.currentUser;

    if (!user || !user.email) {
      navigate("/login", { replace: true });
      return;
    }

    setResending(true);
    setMessage("");

    try {
      await sendEmailVerification(user, {
        url: VERIFY_EMAIL_URL,
        handleCodeInApp: false,
      });

      setMessage(
        "Verification email sent. Please check your inbox and spam folder."
      );
    } catch (error: any) {
      console.error(
        "Verification email resend failed:",
        error
      );

      if (
        error?.code ===
        "auth/too-many-requests"
      ) {
        setMessage(
          "Too many requests. Please wait a little before requesting another email."
        );
      } else {
        setMessage(
          "We couldn't send the verification email. Please try again."
        );
      }
    } finally {
      setResending(false);
    }
  };

  /*
   * Sign out
   */
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(
        "Sign out failed:",
        error
      );
    }
  };

  /*
   * VERIFIED STATE
   */
  if (verified) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2
              className="h-8 w-8 text-green-600"
              strokeWidth={2}
            />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Email verified
          </h1>

          <p className="mt-3 text-gray-600 leading-7">
            Your email has been successfully
            verified.
          </p>

          <p className="mt-1 text-sm text-gray-500 break-all">
            {email}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard", {
                replace: true,
              })
            }
            className="
              mt-8
              h-14
              w-full
              rounded-2xl
              bg-gray-900
              text-white
              font-medium
              transition-colors
              hover:bg-black
              focus:outline-none
              focus:ring-4
              focus:ring-gray-900/20
            "
          >
            Continue to Dashboard
          </button>
        </div>
      </main>
    );
  }

  /*
   * WAITING FOR VERIFICATION
   */
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Icon */}

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <Mail
            className="h-8 w-8 text-blue-600"
            strokeWidth={1.8}
          />
        </div>

        {/* Heading */}

        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Verify your email
        </h1>

        {/* Description */}

        <p className="mt-4 text-gray-600 leading-7">
          We sent a verification link to
        </p>

        <p className="mt-1 font-semibold text-gray-900 break-all">
          {email}
        </p>

        <p className="mt-4 text-sm text-gray-500 leading-6">
          Open the email and click the
          verification link. Once verified,
          come back here and continue.
        </p>

        {/* Status message */}

        {message && (
          <div
            className="
              mt-5
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-4
              py-3
              text-sm
              leading-6
              text-gray-600
            "
          >
            {message}
          </div>
        )}

        {/* Check verification */}

        <button
          type="button"
          onClick={checkVerification}
          disabled={checking}
          className="
            mt-7
            flex
            h-14
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-gray-900
            text-white
            font-medium
            transition-colors
            hover:bg-black
            disabled:cursor-not-allowed
            disabled:opacity-50
            focus:outline-none
            focus:ring-4
            focus:ring-gray-900/20
          "
        >
          {checking && (
            <RefreshCw
              className="h-4 w-4 animate-spin"
            />
          )}

          {checking
            ? "Checking..."
            : "I've verified my email"}
        </button>

        {/* Resend */}

        <button
          type="button"
          onClick={resendVerification}
          disabled={resending}
          className="
            mt-5
            text-sm
            font-medium
            text-blue-600
            transition-colors
            hover:text-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {resending
            ? "Sending..."
            : "Resend verification email"}
        </button>

        {/* Sign out */}

        <div className="mt-8">
          <button
            type="button"
            onClick={handleSignOut}
            className="
              text-sm
              text-gray-500
              transition-colors
              hover:text-gray-900
            "
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}