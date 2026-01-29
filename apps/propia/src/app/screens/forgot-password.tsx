import { Button } from "@propia/components/Button";
import Input from "@propia/components/forms/Input";
import Header from "@propia/components/Header";
import ThemedText from "@propia/components/ThemedText";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
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

  const handleResetPassword = () => {
    const isEmailValid = validateEmail(email);

    if (isEmailValid) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Show success message
        Alert.alert(
          "Password Reset Link Sent",
          "We've sent a password reset link to your email address. Please check your inbox.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }, 1500);
    }
  };

  return (
    <>
      <Header showBackButton />
      <View
        className="flex-1 bg-light-primary dark:bg-dark-primary p-6"
        style={{ paddingTop: insets.top }}
      >
        <View className="mt-8">
          <ThemedText className="text-3xl font-bold mb-1">
            Reset Password
          </ThemedText>
          <ThemedText className="text-light-subtext dark:text-dark-subtext mb-14">
            Enter your email address and we'll send you a link to reset your
            password
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

          <Button
            className="mb-6"
            loading={isLoading}
            onPress={handleResetPassword}
            size="large"
            title="Send Reset Link"
          />

          <View className="flex-row justify-center mt-8">
            <ThemedText className="text-light-subtext dark:text-dark-subtext">
              Remember your password?{" "}
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
