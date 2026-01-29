import useThemeColors from "@propia/app/contexts/ThemeColors";
import { Button } from "@propia/components/Button";
import Input from "@propia/components/forms/Input";
import Header from "@propia/components/Header";
import ThemedText from "@propia/components/ThemedText";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const _insets = useSafeAreaInsets();
  const _colors = useThemeColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleLogin = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
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
            Welcome back
          </ThemedText>
          <ThemedText className="text-light-subtext dark:text-dark-subtext mb-14">
            Sign in to your account
          </ThemedText>

          <Input
            autoCapitalize="none"
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
            containerClassName="mb-4"
            error={passwordError}
            isPassword={true}
            label="Password"
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) validatePassword(text);
            }}
            value={password}
          />

          <Link
            className="underline text-black dark:text-white text-sm mb-4"
            href="/screens/forgot-password"
          >
            Forgot Password?
          </Link>

          <Button
            className="mb-6"
            loading={isLoading}
            onPress={handleLogin}
            size="large"
            title="Login"
          />

          <View className="flex-row justify-center">
            <ThemedText className="text-light-subtext dark:text-dark-subtext">
              Don't have an account?{" "}
            </ThemedText>
            <Link asChild href="/screens/signup">
              <Pressable>
                <ThemedText className="underline">Sign up</ThemedText>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </>
  );
}
