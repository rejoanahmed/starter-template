import ForgotPasswordForm from "@app/components/auth/ForgotPasswordForm";
import OTPVerificationForm from "@app/components/auth/OTPVerificationForm";
import ResetPasswordForm from "@app/components/auth/ResetPasswordForm";
import SignInForm from "@app/components/auth/SignInForm";
import SignUpForm from "@app/components/auth/SignUpForm";
import { Colors } from "@app/constants/Colors";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AuthMode =
  | "signIn"
  | "signUp"
  | "forgotPassword"
  | "otpVerification"
  | "resetPassword";

export default function AuthScreen() {
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const { colorScheme = "light" } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const handleNavigateToSignIn = () => {
    setAuthMode("signIn");
    setOtpEmail("");
    setOtpCode("");
  };
  const handleNavigateToSignUp = () => setAuthMode("signUp");
  const handleNavigateToForgotPassword = () => setAuthMode("forgotPassword");
  const handleOTPSent = (email: string) => {
    setOtpEmail(email);
    setAuthMode("otpVerification");
  };
  const handleOTPVerified = (email: string, otp: string) => {
    setOtpEmail(email);
    setOtpCode(otp);
    setAuthMode("resetPassword");
  };
  const handlePasswordResetSuccess = () => {
    setOtpEmail("");
    setOtpCode("");
    setAuthMode("signIn");
  };

  // Taller header for the first page so the logo sits LOWER (not stuck at the top)
  const HEADER_PORTION = authMode === "signIn" ? 0.33 : 0.25;
  const headerHeight = Math.max(200, Math.round(height * HEADER_PORTION));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
      keyboardVerticalOffset={Platform.select({ ios: 56, android: 0 })}
      style={{ backgroundColor: palette.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header: occupies a chunk of the screen and pushes the logo DOWN */}
        <View
          style={{
            paddingTop: insets.top, // respect notch/status bar
            height: headerHeight, // proportional space
            justifyContent: "flex-end", // stick logo to the bottom of this block
            alignItems: "center",
            paddingBottom: 16,
          }}
        >
          <Image
            resizeMode="contain"
            source={require("../../assets/images/icon.png")}
            style={{ width: 92, height: 92, marginBottom: 8 }}
          />
          {authMode === "signIn" && (
            <Text style={{ color: palette.muted, fontSize: 13 }}>
              Welcome to Party App
            </Text>
          )}
        </View>

        {/* Form container with sensible max width, not centered vertically */}
        <View
          className="w-full px-4"
          style={{ alignSelf: "center", maxWidth: 480 }}
        >
          {authMode === "signIn" ? (
            <SignInForm
              onForgotPassword={handleNavigateToForgotPassword}
              onSignUp={handleNavigateToSignUp}
            />
          ) : authMode === "signUp" ? (
            <SignUpForm onSignIn={handleNavigateToSignIn} />
          ) : authMode === "forgotPassword" ? (
            <ForgotPasswordForm
              onBack={handleNavigateToSignIn}
              onOTPSent={handleOTPSent}
            />
          ) : authMode === "otpVerification" ? (
            <OTPVerificationForm
              email={otpEmail}
              onBack={handleNavigateToForgotPassword}
              onVerified={handleOTPVerified}
              type="forget-password"
            />
          ) : (
            <ResetPasswordForm
              email={otpEmail}
              onBack={() => setAuthMode("otpVerification")}
              onSuccess={handlePasswordResetSuccess}
              otp={otpCode}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
