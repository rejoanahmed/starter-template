import AntDesign from "@expo/vector-icons/AntDesign";
import { Button } from "@propia/components/Button";
import Selectable from "@propia/components/forms/Selectable";
import Icon, { type IconName } from "@propia/components/Icon";
import Section from "@propia/components/layout/Section";
import MultiStep, { Step } from "@propia/components/MultiStep";
import ShowRating from "@propia/components/ShowRating";
import ThemedText from "@propia/components/ThemedText";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, View } from "react-native";
import useThemeColors from "../contexts/ThemeColors";

// Mock data for UI display
const PACKAGE_OPTIONS = [
  {
    id: "basic",
    name: "Basic Logo Package",
    price: "$99",
    deliveryTime: "3 days",
    icon: "Pen",
    revisions: "2 revisions",
    features: [
      "2 initial concepts",
      "High resolution files",
      "Logo transparency",
    ],
  },
  {
    id: "standard",
    name: "Standard Logo Package",
    price: "$199",
    icon: "Star",
    deliveryTime: "5 days",
    revisions: "5 revisions",
    features: [
      "4 initial concepts",
      "High resolution files",
      "Logo transparency",
      "Source files",
      "Social media kit",
    ],
  },
  {
    id: "premium",
    name: "Premium Logo Package",
    price: "$349",
    icon: "Gem",
    deliveryTime: "7 days",
    revisions: "Unlimited revisions",
    features: [
      "6 initial concepts",
      "High resolution files",
      "Logo transparency",
      "Source files",
      "Social media kit",
      "Brand guidelines",
      "Stationery design",
    ],
  },
];

// Step Components
const ProjectDetailsStep = () => {
  const [selectedPackage, setSelectedPackage] = useState("standard");

  return (
    <ScrollView className="flex-1 p-4">
      <Section
        className="mt-4 mb-8"
        subtitle="Choose your package"
        title="Logo Design Package"
        titleSize="2xl"
      />

      {PACKAGE_OPTIONS.map((pkg) => (
        <Selectable
          containerClassName="mb-4"
          description={`${pkg.price} • ${pkg.deliveryTime} • ${pkg.revisions}`}
          icon={pkg.icon as IconName}
          key={pkg.id}
          onPress={() => setSelectedPackage(pkg.id)}
          selected={selectedPackage === pkg.id}
          title={pkg.name}
        />
      ))}
    </ScrollView>
  );
};

const PaymentStep = () => {
  const [selectedPayment, setSelectedPayment] = useState("1");
  const colors = useThemeColors();

  // Simple mock payment methods
  const paymentMethods = [
    {
      id: "1",
      type: "visa",
      label: "Visa",
      lastFour: "4242",
      expiryDate: "05/25",
    },
    {
      id: "2",
      type: "mastercard",
      label: "Mastercard",
      lastFour: "5678",
      expiryDate: "08/24",
    },
  ];

  return (
    <View className="flex-1 p-4">
      <Section
        className="mt-4 mb-8"
        subtitle="Choose a payment method for your design service"
        title="Payment method"
        titleSize="2xl"
      />

      {paymentMethods.map((method) => (
        <Selectable
          containerClassName="mb-4"
          customIcon={<Icon name="CreditCard" size={24} />}
          description={`Expires ${method.expiryDate}`}
          key={method.id}
          onPress={() => setSelectedPayment(method.id)}
          selected={selectedPayment === method.id}
          title={`${method.label} ending in ${method.lastFour}`}
        />
      ))}

      <Selectable
        containerClassName="mb-4"
        customIcon={<AntDesign color={colors.text} name="apple" size={24} />}
        description="Pay using Apple Pay"
        onPress={() => setSelectedPayment("apple")}
        selected={selectedPayment === "apple"}
        title="Apple Pay"
      />

      <Selectable
        containerClassName="mb-4"
        customIcon={<AntDesign color={colors.text} name="google" size={24} />}
        description="Pay using Google Pay"
        onPress={() => setSelectedPayment("google")}
        selected={selectedPayment === "google"}
        title="Google Pay"
      />

      <Button
        className="mb-8"
        iconStart="Plus"
        onPress={() => {}}
        title="Add New Card"
        variant="ghost"
      />
    </View>
  );
};

const ReviewStep = () => (
  <ScrollView className="flex-1">
    <Section
      className="mt-4 mb-4 px-global"
      subtitle="Review your logo design order"
      title="Order review"
      titleSize="2xl"
    />
    {/* Service Provider */}
    <View className="px-global py-7 border-b-8 mb-4 border-light-secondary dark:border-dark-darker">
      <View className="rounded-lg flex-row items-center">
        <Image
          className="w-12 h-12 rounded-full"
          source={require("@propia/assets/img/user-2.jpg")}
        />
        <View className="ml-4 flex-1">
          <View className="flex-row items-center justify-between flex-1">
            <ThemedText className="font-bold text-lg">Sarah Miller</ThemedText>
            <ShowRating rating={4.9} />
          </View>
          <ThemedText className="text-light-subtext dark:text-dark-subtext">
            Professional Logo Designer
          </ThemedText>
        </View>
      </View>
    </View>
    {/* Service Package */}
    <View className="px-global">
      <View className="p-global bg-light-secondary dark:bg-dark-secondary rounded-lg">
        <View className="flex-row mb-2">
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <ThemedText className="font-bold text-lg">
                Standard Logo Package
              </ThemedText>
              <Icon className="mr-3" name="Gem" size={24} />
            </View>
            <ThemedText className="text-light-subtext dark:text-dark-subtext mt-1">
              4 initial concepts {"\n"}
              High resolution files {"\n"}
              Logo transparency {"\n"}
              Source files {"\n"}
              Social media kit
            </ThemedText>
            <ThemedText className="font-bold mt-2">$199.00</ThemedText>
          </View>
        </View>
      </View>

      {/* Project Requirements */}
      <View className="p-global bg-light-secondary dark:bg-dark-secondary rounded-lg mt-4">
        <ThemedText className="text-lg font-bold mb-4">
          Project Requirements
        </ThemedText>
        <View className="">
          <View className="flex-row mb-2">
            <ThemedText className="font-bold w-1/3">Brand:</ThemedText>
            <ThemedText className="flex-1">Horizon Tech</ThemedText>
          </View>
          <View className="flex-row mb-2">
            <ThemedText className="font-bold w-1/3">Industry:</ThemedText>
            <ThemedText className="flex-1">Technology</ThemedText>
          </View>
          <View className="flex-row mb-2">
            <ThemedText className="font-bold w-1/3">Style:</ThemedText>
            <ThemedText className="flex-1">Modern, Minimalist</ThemedText>
          </View>
          <View className="flex-row mb-2">
            <ThemedText className="font-bold w-1/3">Colors:</ThemedText>
            <ThemedText className="flex-1">Blue, White, Gray</ThemedText>
          </View>
        </View>
      </View>

      {/* Payment Method */}
      <View className="p-global bg-light-secondary dark:bg-dark-secondary rounded-lg mt-4">
        <ThemedText className="text-lg font-bold mb-4">
          Payment Method
        </ThemedText>
        <View className="rounded-lg flex-row items-center">
          <Icon name="CreditCard" size={24} />
          <View className="ml-4">
            <ThemedText className="font-bold">Visa ending in 4242</ThemedText>
            <ThemedText className="text-light-subtext dark:text-dark-subtext">
              Expires 12/25
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Timeline */}
      <View className="p-global bg-light-secondary dark:bg-dark-secondary rounded-lg mt-4">
        <ThemedText className="text-lg font-bold mb-4">
          Delivery Timeline
        </ThemedText>
        <View className="rounded-lg flex-row items-center">
          <Icon name="Clock" size={24} />
          <View className="ml-4">
            <ThemedText className="font-bold">5 business days</ThemedText>
            <ThemedText className="text-light-subtext dark:text-dark-subtext">
              First draft delivery by Dec 20, 2023
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Order Summary */}
      <View className="px-global py-7">
        <ThemedText className="text-lg font-bold mb-4">
          Order Summary
        </ThemedText>
        <View className=" rounded-lg">
          <View className="flex-row justify-between mb-2">
            <ThemedText>Service Package</ThemedText>
            <ThemedText>$199.00</ThemedText>
          </View>
          <View className="flex-row justify-between mb-2">
            <ThemedText>Platform Fee</ThemedText>
            <ThemedText>$19.90</ThemedText>
          </View>
          <View className="h-[1px] bg-light-secondary dark:bg-dark-secondary my-4" />
          <View className="flex-row justify-between mb-10">
            <ThemedText className="font-bold text-lg">Total</ThemedText>
            <ThemedText className="font-bold text-lg">$218.90</ThemedText>
          </View>
        </View>
      </View>
    </View>
  </ScrollView>
);

const CheckoutScreen = () => {
  const router = useRouter();
  const [_currentStep, setCurrentStep] = useState(0);

  return (
    <MultiStep
      onClose={() => router.back()}
      onComplete={() =>
        router.push("/screens/order-detail?id=1&fromCheckout=true")
      }
      onStepChange={(nextStep) => {
        setCurrentStep(nextStep);
        return true;
      }}
      showHeader={true}
      showStepIndicator={false}
    >
      <Step title="Project Details">
        <ProjectDetailsStep />
      </Step>

      <Step title="Payment">
        <PaymentStep />
      </Step>

      <Step title="Review">
        <ReviewStep />
      </Step>
    </MultiStep>
  );
};

export default CheckoutScreen;
