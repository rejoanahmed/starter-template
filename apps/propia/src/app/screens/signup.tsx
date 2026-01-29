import useThemeColors from "@propia/app/contexts/ThemeColors";
import { Button } from "@propia/components/Button";
import Input from "@propia/components/forms/Input";
import Header from "@propia/components/Header";
import ThemedText from "@propia/components/ThemedText";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SignupScreen() {
  const _insets = useSafeAreaInsets();
  const _colors = useThemeColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback.push("At least 8 characters");
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push("Add uppercase letter");
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push("Add lowercase letter");
    }

    // Numbers or special characters check
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 25;
    } else {
      feedback.push("Add number or special character");
    }

    setPasswordStrength(strength);
    setStrengthText(feedback.join(" • ") || "Strong password!");
    return strength >= 75;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    const isStrong = checkPasswordStrength(password);
    if (!isStrong) {
      setPasswordError("Please create a stronger password");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError("Confirm password is required");
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleSignup = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to home screen after successful login
        router.replace("/(drawer)/(tabs)/");
      }, 1500);
    }
  };

  const _handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social login logic here
  };

  return (
    <>
      <Header showBackButton />
      <View className="flex-1 bg-light-primary dark:bg-dark-primary p-6">
        <View className="mt-8">
          <ThemedText className="text-3xl font-bold mb-1">
            Create new account
          </ThemedText>
          <ThemedText className="text-light-subtext dark:text-dark-subtext mb-14">
            Create an account to continue
          </ThemedText>

          <Input
            autoCapitalize="none"
            //leftIcon="mail"
            autoComplete="email"
            containerClassName="mb-4"
            error={emailError}
            keyboardType="email-address"
            label="Email"
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) validateEmail(text);
            }}
            value={email}
          />

          <Input
            autoCapitalize="none"
            //leftIcon="lock"
            containerClassName="mb-4"
            error={passwordError}
            isPassword={true}
            label="Password"
            onChangeText={(text) => {
              setPassword(text);
              checkPasswordStrength(text);
              if (passwordError) validatePassword(text);
            }}
            value={password}
          />

          <Input
            autoCapitalize="none"
            //leftIcon="lock"
            containerClassName="mb-4"
            error={confirmPasswordError}
            isPassword={true}
            label="Confirm password"
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (confirmPasswordError) validateConfirmPassword(text);
            }}
            value={confirmPassword}
          />
          {password.length > 0 && (
            <View className="mb-4">
              <View className="w-full h-1 bg-light-secondary dark:bg-dark-secondary rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${passwordStrength >= 75 ? "bg-green-500" : passwordStrength >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </View>
              <ThemedText className="text-xs mt-1 text-light-subtext dark:text-dark-subtext">
                {strengthText}
              </ThemedText>
            </View>
          )}

          <Button
            className="mb-6"
            loading={isLoading}
            onPress={handleSignup}
            size="large"
            title="Sign up"
          />

          <View className="flex-row justify-center">
            <ThemedText className="text-light-subtext dark:text-dark-subtext">
              Already have an account?{" "}
            </ThemedText>
            <Link asChild href="/screens/login">
              <Pressable>
                <ThemedText className="underline">Log in</ThemedText>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </>
  );
}

const _styles = StyleSheet.create({
  googleIcon: {
    width: 20,
    height: 20,
    backgroundColor: "#4285F4",
    borderRadius: 2,
  },
});
