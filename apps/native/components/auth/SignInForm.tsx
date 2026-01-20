import { Colors } from "@app/constants/Colors";
import { authClient } from "@app/lib/auth-client";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SignInFormProps = {
  onSignUp: () => void;
  onForgotPassword: () => void;
};

export default function SignInForm({
  onSignUp,
  onForgotPassword,
}: SignInFormProps) {
  const { colorScheme = "light" } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateEmail = (v: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!v) {
      return "Email is required";
    }
    if (!emailRegex.test(v)) {
      return "Please enter a valid email address";
    }
    return "";
  };
  const validatePassword = (v: string) => {
    if (!v) {
      return "Password is required";
    }
    if (v.length < 8) {
      return "Password must be at least 8 characters";
    }
    return "";
  };

  const handleEmailChange = (t: string) => {
    setEmail(t);
    setErrors((p) => ({ ...p, email: validateEmail(t) }));
  };
  const handlePasswordChange = (t: string) => {
    setPassword(t);
    setErrors((p) => ({ ...p, password: validatePassword(t) }));
  };

  const handleSignIn = async () => {
    console.log(`\n${"=".repeat(60)}`);
    console.log("🔐 SIGN IN BUTTON CLICKED");
    console.log("=".repeat(60));

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });

    console.log("Validation results:", { emailError, passwordError });

    if (emailError || passwordError) {
      console.log("❌ Validation failed, aborting sign-in");
      return;
    }

    setLoading(true);
    console.log("✅ Validation passed");
    console.log("Email:", email.trim());
    console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
    console.log("Auth client exists:", !!authClient);
    console.log("Auth client signIn exists:", !!authClient.signIn);
    console.log("Auth client signIn.email exists:", !!authClient.signIn?.email);

    try {
      console.log("\n📡 About to call authClient.signIn.email...");
      console.log("Timestamp:", new Date().toISOString());

      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      console.log("\n✅ Response received from authClient.signIn.email");
      console.log("Result type:", typeof result);
      console.log("Result keys:", Object.keys(result || {}));
      console.log("Has error:", !!result.error);
      console.log("Has data:", !!result.data);

      if (result.error) {
        console.error("\n❌ SIGN-IN ERROR DETECTED");
        console.error("Error object:", JSON.stringify(result.error, null, 2));
        console.error("Error message:", result.error.message);
        console.error("Error status:", result.error.status);

        let errorMessage = "Sign in failed. Please try again.";

        // Handle Better Auth error responses
        if (result.error.message?.includes("Invalid")) {
          errorMessage = "Invalid email or password.";
          setErrors(() => ({
            email: "Invalid credentials",
            password: "Invalid credentials",
          }));
        } else if (result.error.message?.includes("not found")) {
          errorMessage = "No account found with this email.";
          setErrors((p) => ({ ...p, email: errorMessage }));
        } else if (result.error.message?.includes("disabled")) {
          errorMessage = "This account has been disabled.";
        }

        console.error("Showing alert with message:", errorMessage);
        Alert.alert("Error", errorMessage);
      } else {
        console.log("\n✅ SIGN-IN SUCCESSFUL!");
        console.log("Result data:", result.data);
      }
    } catch (error: unknown) {
      console.error("\n💥 EXCEPTION CAUGHT IN SIGN-IN");
      console.error("Error type:", typeof error);
      console.error("Error:", error);

      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }

      const errorMessage = "Sign in failed. Please try again.";
      console.error("Showing alert with message:", errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
      console.log("\n🏁 Sign-in process completed");
      console.log(`${"=".repeat(60)}\n`);
    }
  };

  const errorColor = palette.error ?? "#DC2626";
  const labelColor = palette.text;
  const hintColor = palette.muted ?? palette.icon;
  const inputBg = palette.inputBg ?? palette.surface2 ?? palette.surface;
  const cardBg = palette.surface;
  const borderColor = palette.border;
  const titleColor = palette.text;
  const linkColor = palette.tint;
  const buttonBg = palette.primaryButton ?? palette.tint;
  const disabledBg =
    palette.state?.disabledBg ?? palette.surface2 ?? palette.surface;

  return (
    <View
      className="w-full rounded-2xl border p-5"
      style={{ backgroundColor: cardBg, borderColor }}
    >
      {/* Title */}
      <Text
        className="mb-1 font-extrabold text-2xl"
        style={{ color: titleColor }}
      >
        Sign in
      </Text>
      <Text className="mb-5" style={{ color: hintColor }}>
        Welcome back! Please enter your details.
      </Text>

      {/* Email */}
      <Text
        className="mb-2 font-semibold text-base"
        style={{ color: labelColor }}
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
        placeholder="you@example.com"
        placeholderTextColor={hintColor}
        returnKeyType="next"
        style={{
          color: palette.text,
          backgroundColor: inputBg,
          borderColor: errors.email ? errorColor : borderColor,
        }}
        value={email}
      />
      {!!errors.email && (
        <Text className="-mt-1 mb-3 text-sm" style={{ color: errorColor }}>
          {errors.email}
        </Text>
      )}

      {/* Password */}
      <Text
        className="mb-2 font-semibold text-base"
        style={{ color: labelColor }}
      >
        Password
      </Text>
      <TextInput
        autoComplete="password"
        className="mb-2 rounded-xl border px-4 py-3 text-base"
        onChangeText={handlePasswordChange}
        onSubmitEditing={handleSignIn}
        placeholder="Your password"
        placeholderTextColor={hintColor}
        returnKeyType="done"
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

      {/* Forgot password */}
      <TouchableOpacity className="mb-4 self-end" onPress={onForgotPassword}>
        <Text className="font-medium text-sm" style={{ color: linkColor }}>
          Forgot password?
        </Text>
      </TouchableOpacity>

      {/* Sign in button */}
      <TouchableOpacity
        accessibilityRole="button"
        className="items-center rounded-xl p-4"
        disabled={loading}
        onPress={handleSignIn}
        style={{
          backgroundColor: loading ? disabledBg : buttonBg,
          opacity: loading ? 0.9 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="font-bold" style={{ color: "#FFFFFF" }}>
            Sign in
          </Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View className="my-6 flex-row items-center">
        <View
          className="h-px flex-1"
          style={{ backgroundColor: borderColor }}
        />
        <Text className="mx-3 text-xs" style={{ color: hintColor }}>
          or
        </Text>
        <View
          className="h-px flex-1"
          style={{ backgroundColor: borderColor }}
        />
      </View>

      {/* Sign up prompt */}
      <View className="flex-row justify-center">
        <Text style={{ color: hintColor }}>Don&apos;t have an account? </Text>
        <TouchableOpacity onPress={onSignUp}>
          <Text className="font-bold" style={{ color: linkColor }}>
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
