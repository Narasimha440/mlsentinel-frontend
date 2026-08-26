import {
  sendEmailVerification,
  type User,
} from "firebase/auth";

const VERIFY_EMAIL_URL =
  import.meta.env.DEV
    ? `${window.location.origin}/verify-email`
    : "https://mlsentinel.dev/verify-email";

export async function sendVerificationEmail(
  user: User
): Promise<void> {
  if (!user.email) {
    throw new Error(
      "Cannot send verification email because this account has no email."
    );
  }

  await sendEmailVerification(user, {
    url: VERIFY_EMAIL_URL,
    handleCodeInApp: false,
  });
}