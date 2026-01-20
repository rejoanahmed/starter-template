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

type SignUpFormProps = {
  onSignIn: () => void;
};

type UserRole = "client" | "merchant";

export default function SignUpForm({ onSignIn }: SignUpFormProps) {
  const { colorScheme = "light" } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("client");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // validators
  const validateDisplayName = (v: string) =>
    v
      ? v.length < 2
        ? "Name must be at least 2 characters"
        : ""
      : "Name is required";
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
  const validatePassword = (v: string) =>
    v
      ? v.length < 8
        ? "Password must be at least 8 characters"
        : ""
      : "Password is required";
  const validateConfirmPassword = (v: string) =>
    v
      ? v !== password
        ? "Passwords do not match"
        : ""
      : "Please confirm your password";

  // handlers
  const handleDisplayNameChange = (t: string) => {
    setDisplayName(t);
    setErrors((p) => ({ ...p, displayName: validateDisplayName(t) }));
  };
  const handleEmailChange = (t: string) => {
    setEmail(t);
    setErrors((p) => ({ ...p, email: validateEmail(t) }));
  };
  const handlePasswordChange = (t: string) => {
    setPassword(t);
    setErrors((p) => ({
      ...p,
      password: validatePassword(t),
      confirmPassword: confirmPassword
        ? t === confirmPassword
          ? ""
          : "Passwords do not match"
        : p.confirmPassword,
    }));
  };
  const handleConfirmPasswordChange = (t: string) => {
    setConfirmPassword(t);
    setErrors((p) => ({ ...p, confirmPassword: validateConfirmPassword(t) }));
  };

  const handleSignUp = async () => {
    const e1 = validateDisplayName(displayName);
    const e2 = validateEmail(email);
    const e3 = validatePassword(password);
    const e4 = validateConfirmPassword(confirmPassword);
    setErrors({
      displayName: e1,
      email: e2,
      password: e3,
      confirmPassword: e4,
    });
    if (e1 || e2 || e3 || e4) {
      return;
    }

    setLoading(true);
    console.log("📝 Starting sign-up process...");
    console.log("  Email:", email.trim());
    console.log("  Name:", displayName);
    console.log("  Role:", role);
    console.log("  API URL:", process.env.EXPO_PUBLIC_API_URL);

    try {
      console.log("📡 Calling authClient.signUp.email...");
      // Cast to any to allow custom fields
      const result = await (authClient.signUp.email as any)({
        email: email.trim(),
        password,
        name: displayName,
        role,
      });

      console.log("✅ Sign-up response received:", {
        hasError: !!result.error,
        hasData: !!result.data,
      });

      if (result.error) {
        console.error("❌ Sign-up error:", result.error);
        let msg = "Sign up failed. Please try again.";

        // Handle Better Auth error responses
        if (result.error.message?.includes("already exists")) {
          msg = "Email already in use.";
          setErrors((p) => ({ ...p, email: msg }));
        } else if (result.error.message?.includes("Invalid email")) {
          msg = "Invalid email address.";
          setErrors((p) => ({ ...p, email: msg }));
        } else if (result.error.message?.includes("password")) {
          msg = "Password is too weak.";
          setErrors((p) => ({ ...p, password: msg }));
        }

        Alert.alert("Error", msg);
      } else {
        console.log("✅ Sign-up successful!");
      }
      // Success - navigation handled by session state listener
    } catch (err: unknown) {
      console.error("💥 Sign-up exception:", err);
      if (err instanceof Error) {
        console.error("  Error message:", err.message);
        console.error("  Error stack:", err.stack);
      }
      const msg = "Sign up failed. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
      console.log("🏁 Sign-up process completed");
    }
  };

  // theme tokens
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
        Create account
      </Text>
      <Text className="mb-5" style={{ color: hintColor }}>
        Sign up to start booking or listing rooms.
      </Text>

      {/* Name */}
      <Text
        className="mb-2 font-semibold text-base"
        style={{ color: labelColor }}
      >
        Name
      </Text>
      <TextInput
        autoCapitalize="words"
        className="mb-2 rounded-xl border px-4 py-3 text-base"
        onChangeText={handleDisplayNameChange}
        placeholder="Full name"
        placeholderTextColor={hintColor}
        returnKeyType="next"
        style={{
          color: palette.text,
          backgroundColor: inputBg,
          borderColor: errors.displayName ? errorColor : borderColor,
        }}
        value={displayName}
      />
      {!!errors.displayName && (
        <Text className="-mt-1 mb-3 text-sm" style={{ color: errorColor }}>
          {errors.displayName}
        </Text>
      )}

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
        autoComplete="new-password"
        className="mb-2 rounded-xl border px-4 py-3 text-base"
        onChangeText={handlePasswordChange}
        placeholder="Create a password"
        placeholderTextColor={hintColor}
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

      {/* Confirm Password */}
      <Text
        className="mb-2 font-semibold text-base"
        style={{ color: labelColor }}
      >
        Confirm password
      </Text>
      <TextInput
        autoComplete="new-password"
        className="mb-2 rounded-xl border px-4 py-3 text-base"
        onChangeText={handleConfirmPasswordChange}
        onSubmitEditing={handleSignUp}
        placeholder="Re-enter your password"
        placeholderTextColor={hintColor}
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

      {/* Role selector (segmented) */}
      <Text
        className="mt-2 mb-3 font-semibold text-base"
        style={{ color: labelColor }}
      >
        Select account type
      </Text>
      <View
        className="mb-3 rounded-xl border p-1"
        style={{
          borderColor,
          backgroundColor: palette.state?.hover ?? cardBg,
        }}
      >
        <View className="flex-row">
          {(["client", "merchant"] as const).map((opt) => {
            const selected = role === opt;
            return (
              <TouchableOpacity
                accessibilityLabel={`Select ${opt} role`}
                className="flex-1 items-center rounded-lg p-3"
                key={opt}
                onPress={() => setRole(opt)}
                style={{
                  backgroundColor: selected
                    ? (palette.primaryButton ?? palette.tint)
                    : "transparent",
                  borderColor: selected
                    ? (palette.primaryButton ?? palette.tint)
                    : borderColor,
                  borderWidth: selected ? 1 : 0,
                }}
              >
                <Text
                  className={selected ? "font-bold" : "font-medium"}
                  style={{ color: selected ? "#FFFFFF" : palette.text }}
                >
                  {opt === "client" ? "Client" : "Merchant"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Role hint */}
      <View
        className="mb-5 rounded-lg border p-3"
        style={{
          backgroundColor: palette.state?.hover ?? cardBg,
          borderColor,
        }}
      >
        <Text className="text-center text-sm" style={{ color: hintColor }}>
          {role === "client"
            ? "As a client, you can search and book rooms."
            : "As a merchant, you can list and manage rooms for rent."}
        </Text>
      </View>

      {/* Submit */}
      <TouchableOpacity
        accessibilityRole="button"
        className="items-center rounded-xl p-4"
        disabled={loading}
        onPress={handleSignUp}
        style={{
          backgroundColor: loading ? disabledBg : buttonBg,
          opacity: loading ? 0.9 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="font-bold" style={{ color: "#FFFFFF" }}>
            Sign up
          </Text>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View className="mt-6 flex-row justify-center">
        <Text style={{ color: hintColor }}>Already have an account? </Text>
        <TouchableOpacity onPress={onSignIn}>
          <Text className="font-bold" style={{ color: linkColor }}>
            Sign in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
