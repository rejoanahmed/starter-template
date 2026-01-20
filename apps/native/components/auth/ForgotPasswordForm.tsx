import { Colors } from "@app/constants/Colors";
import { authClient } from "@app/lib/auth-client";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ForgotPasswordFormProps = {
  onBack: () => void;
  onOTPSent: (email: string) => void;
};

export default function ForgotPasswordForm({
  onBack,
  onOTPSent,
}: ForgotPasswordFormProps) {
  const { colorScheme = "light" } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // tokens
  const titleColor = palette.text;
  const cardBg = palette.surface;
  const borderColor = palette.border;
  const hint = palette.muted ?? palette.icon;
  const inputBg = palette.inputBg ?? palette.surface2 ?? palette.surface;
  const errorColor = palette.error ?? "#DC2626";
  const successColor = palette.success ?? "#22C55E";
  const buttonBg = palette.primaryButton ?? palette.tint;
  const linkColor = palette.tint;

  const validateEmail = (v: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!v) {
      return "Email is required";
    }
    if (!re.test(v)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleEmailChange = (t: string) => {
    setEmail(t);
    setError("");
  };

  const handleResetPassword = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.forgetPassword.emailOtp({
        email: email.trim(),
      });

      if (result.error) {
        let msg = "Failed to send OTP. Please try again.";
        if (result.error.message?.includes("not found")) {
          msg = "No account found with this email address.";
        } else if (result.error.message?.includes("Invalid")) {
          msg = "Invalid email address.";
        }
        setError(msg);
      } else {
        setSuccess(true);
        setError("");
        // Navigate to OTP verification screen
        onOTPSent(email.trim());
      }
    } catch (err: unknown) {
      const msg = "Failed to send OTP. Please try again.";
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      className="w-full rounded-2xl border p-5"
      style={{ backgroundColor: cardBg, borderColor }}
    >
      <Text
        className="mb-1 text-center font-extrabold text-2xl"
        style={{ color: titleColor }}
      >
        Reset password
      </Text>

      {success ? (
        <View className="my-6 items-center">
          <View
            className="mb-5 rounded-xl border px-4 py-3"
            style={{
              backgroundColor: palette.state?.hover ?? cardBg,
              borderColor,
            }}
          >
            <Text
              className="text-center text-base"
              style={{ color: successColor }}
            >
              OTP sent! Please check your email for the verification code.
            </Text>
          </View>

          <TouchableOpacity
            className="w-full items-center rounded-xl px-4 py-4"
            onPress={onBack}
            style={{ backgroundColor: buttonBg }}
          >
            <Text className="font-bold" style={{ color: "#FFFFFF" }}>
              Back to Sign in
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text className="mb-6 text-center" style={{ color: hint }}>
            Enter your email address below and we'll send you a verification
            code to reset your password.
          </Text>

          <Text
            className="mb-2 font-semibold text-base"
            style={{ color: titleColor }}
          >
            Email
          </Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            className="mb-2 rounded-xl border px-4 py-3 text-base"
            inputMode="email"
            keyboardType="email-address"
            onChangeText={handleEmailChange}
            onSubmitEditing={handleResetPassword}
            placeholder="you@example.com"
            placeholderTextColor={hint}
            returnKeyType="send"
            style={{
              color: palette.text,
              backgroundColor: inputBg,
              borderColor: error ? errorColor : borderColor,
            }}
            value={email}
          />
          {!!error && (
            <Text className="-mt-1 mb-3 text-sm" style={{ color: errorColor }}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            accessibilityRole="button"
            className="mt-2 items-center rounded-xl p-4"
            disabled={loading}
            onPress={handleResetPassword}
            style={{
              backgroundColor: loading
                ? (palette.state?.disabledBg ?? inputBg)
                : buttonBg,
              opacity: loading ? 0.9 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-bold" style={{ color: "#FFFFFF" }}>
                Send verification code
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity className="mt-6 items-center" onPress={onBack}>
            <Text
              className="font-semibold text-base"
              style={{ color: linkColor }}
            >
              Back to Sign in
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
