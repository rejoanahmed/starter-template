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

type OTPVerificationFormProps = {
  email: string;
  type: "forget-password";
  onBack: () => void;
  onVerified: (email: string, otp: string) => void;
};

export default function OTPVerificationForm({
  email,
  type,
  onBack,
  onVerified,
}: OTPVerificationFormProps) {
  const { colorScheme = "light" } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  // tokens
  const titleColor = palette.text;
  const cardBg = palette.surface;
  const borderColor = palette.border;
  const hint = palette.muted ?? palette.icon;
  const inputBg = palette.inputBg ?? palette.surface2 ?? palette.surface;
  const errorColor = palette.error ?? "#DC2626";
  const buttonBg = palette.primaryButton ?? palette.tint;
  const linkColor = palette.tint;

  const handleOtpChange = (text: string) => {
    // Only allow digits and limit to 6 characters
    const digitsOnly = text.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(digitsOnly);
    setError("");
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await authClient.emailOtp.checkVerificationOtp({
        email: email.trim(),
        type,
        otp,
      });

      if (result.error) {
        let msg = "Invalid verification code. Please try again.";
        if (result.error.message?.includes("expired")) {
          msg = "This code has expired. Please request a new one.";
        } else if (result.error.message?.includes("TOO_MANY_ATTEMPTS")) {
          msg = "Too many attempts. Please request a new verification code.";
        } else if (result.error.message?.includes("Invalid")) {
          msg = "Invalid verification code. Please check and try again.";
        }
        setError(msg);
      } else {
        // OTP is valid, proceed to password reset
        onVerified(email.trim(), otp);
      }
    } catch (err: unknown) {
      setError("Failed to verify code. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");

    try {
      if (type === "forget-password") {
        const result = await authClient.forgetPassword.emailOtp({
          email: email.trim(),
        });

        if (result.error) {
          setError("Failed to resend code. Please try again.");
        } else {
          setError("");
          // Show success message briefly
          setTimeout(() => {
            setError("");
          }, 3000);
        }
      }
    } catch (err: unknown) {
      setError("Failed to resend code. Please try again.");
      console.error(err);
    } finally {
      setResending(false);
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
        Enter verification code
      </Text>

      <Text className="mb-6 text-center" style={{ color: hint }}>
        We sent a 6-digit code to {email}. Enter it below to continue.
      </Text>

      <Text
        className="mb-2 font-semibold text-base"
        style={{ color: titleColor }}
      >
        Verification code
      </Text>
      <TextInput
        autoCapitalize="none"
        autoComplete="off"
        className="mb-2 rounded-xl border px-4 py-3 text-base"
        inputMode="numeric"
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={handleOtpChange}
        onSubmitEditing={handleVerify}
        placeholder="000000"
        placeholderTextColor={hint}
        returnKeyType="done"
        style={{
          color: palette.text,
          backgroundColor: inputBg,
          borderColor: error ? errorColor : borderColor,
          fontFamily: "monospace",
          fontSize: 20,
          letterSpacing: 8,
          textAlign: "center",
        }}
        value={otp}
      />
      {!!error && (
        <Text className="-mt-1 mb-3 text-sm" style={{ color: errorColor }}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        accessibilityRole="button"
        className="mt-2 items-center rounded-xl p-4"
        disabled={loading || otp.length !== 6}
        onPress={handleVerify}
        style={{
          backgroundColor:
            loading || otp.length !== 6
              ? (palette.state?.disabledBg ?? inputBg)
              : buttonBg,
          opacity: loading || otp.length !== 6 ? 0.6 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="font-bold" style={{ color: "#FFFFFF" }}>
            Verify code
          </Text>
        )}
      </TouchableOpacity>

      <View className="mt-6 items-center">
        <Text className="mb-2 text-sm" style={{ color: hint }}>
          Didn't receive the code?
        </Text>
        <TouchableOpacity
          disabled={resending}
          onPress={handleResend}
          style={{ opacity: resending ? 0.6 : 1 }}
        >
          {resending ? (
            <ActivityIndicator color={linkColor} size="small" />
          ) : (
            <Text
              className="font-semibold text-base"
              style={{ color: linkColor }}
            >
              Resend code
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="mt-6 items-center" onPress={onBack}>
        <Text className="font-semibold text-base" style={{ color: linkColor }}>
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}
