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

type ResetPasswordFormProps = {
  email: string;
  otp: string;
  onBack: () => void;
  onSuccess: () => void;
};

export default function ResetPasswordForm({
  email,
  otp,
  onBack,
  onSuccess,
}: ResetPasswordFormProps) {
  const { colorScheme = "light" } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
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

  const validatePassword = (v: string) => {
    if (!v) {
      return "Password is required";
    }
    if (v.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (v.length > 128) {
      return "Password must be less than 128 characters";
    }
    return "";
  };

  const validateConfirmPassword = (v: string, pwd: string) => {
    if (!v) {
      return "Please confirm your password";
    }
    if (v !== pwd) {
      return "Passwords do not match";
    }
    return "";
  };

  const handlePasswordChange = (t: string) => {
    setPassword(t);
    setErrors((prev) => ({ ...prev, password: validatePassword(t) }));
    if (confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(confirmPassword, t),
      }));
    }
    setError("");
  };

  const handleConfirmPasswordChange = (t: string) => {
    setConfirmPassword(t);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(t, password),
    }));
    setError("");
  };

  const handleResetPassword = async () => {
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password
    );

    setErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (passwordError || confirmPasswordError) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await authClient.emailOtp.resetPassword({
        email: email.trim(),
        otp,
        password,
      });

      if (result.error) {
        let msg = "Failed to reset password. Please try again.";
        if (result.error.message?.includes("expired")) {
          msg = "This code has expired. Please request a new one.";
        } else if (result.error.message?.includes("TOO_MANY_ATTEMPTS")) {
          msg = "Too many attempts. Please request a new verification code.";
        } else if (result.error.message?.includes("Invalid")) {
          msg = "Invalid verification code. Please start over.";
        }
        setError(msg);
      } else {
        // Success - navigate back to sign in
        onSuccess();
      }
    } catch (err: unknown) {
      setError("Failed to reset password. Please try again.");
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

      <Text className="mb-6 text-center" style={{ color: hint }}>
        Enter your new password below.
      </Text>

      <Text
        className="mb-2 font-semibold text-base"
        style={{ color: titleColor }}
      >
        New password
      </Text>
      <TextInput
        autoCapitalize="none"
        autoComplete="new-password"
        className="mb-2 rounded-xl border px-4 py-3 text-base"
        onChangeText={handlePasswordChange}
        onSubmitEditing={handleResetPassword}
        placeholder="Enter new password"
        placeholderTextColor={hint}
        returnKeyType="next"
        secureTextEntry
        style={{
          color: palette.text,
          backgroundColor: inputBg,
          borderColor: errors.password ? errorColor : borderColor,
        }}
        value={password}
      />
      {!!errors.password && (
        <Text className="-mt-1 mb-3 text-sm" style={{ color: errorColor }}>
          {errors.password}
        </Text>
      )}

      <Text
        className="mb-2 font-semibold text-base"
        style={{ color: titleColor }}
      >
        Confirm password
      </Text>
      <TextInput
        autoCapitalize="none"
        autoComplete="new-password"
        className="mb-2 rounded-xl border px-4 py-3 text-base"
        onChangeText={handleConfirmPasswordChange}
        onSubmitEditing={handleResetPassword}
        placeholder="Confirm new password"
        placeholderTextColor={hint}
        returnKeyType="done"
        secureTextEntry
        style={{
          color: palette.text,
          backgroundColor: inputBg,
          borderColor: errors.confirmPassword ? errorColor : borderColor,
        }}
        value={confirmPassword}
      />
      {!!errors.confirmPassword && (
        <Text className="-mt-1 mb-3 text-sm" style={{ color: errorColor }}>
          {errors.confirmPassword}
        </Text>
      )}

      {!!error && (
        <Text className="mb-3 text-sm" style={{ color: errorColor }}>
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
            Reset password
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-6 items-center" onPress={onBack}>
        <Text className="font-semibold text-base" style={{ color: linkColor }}>
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}
