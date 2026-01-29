import AntDesign from "@expo/vector-icons/AntDesign";
import useThemeColors from "@propia/app/contexts/ThemeColors";
import { Button } from "@propia/components/Button";
import { CardScroller } from "@propia/components/CardScroller";
import Input from "@propia/components/forms/Input";
import Header from "@propia/components/Header";
import Icon from "@propia/components/Icon";
import ThemedText from "@propia/components/ThemedText";
import Toggle from "@propia/components/Toggle";
import { shadowPresets } from "@propia/utils/useShadow";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
// Sample payment methods
const initialPaymentMethods = [
  {
    id: "1",
    type: "credit_card",
    cardNumber: "4242",
    cardHolder: "John Doe",
    expiryDate: "05/25",
    isDefault: true,
    brand: "Visa",
  },
  {
    id: "2",
    type: "credit_card",
    cardNumber: "5678",
    cardHolder: "John Doe",
    expiryDate: "08/24",
    isDefault: false,
    brand: "Mastercard",
  },
];

export default function PaymentsScreen() {
  const colors = useThemeColors();
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Get card brand icon based on card number
  const _getCardBrandIcon = (brand: string) => {
    switch (brand) {
      case "Visa":
        return "CreditCard" as const; // Using Icon component - ideally would use specific card logos
      case "Mastercard":
        return "CreditCard" as const;
      case "Amex":
        return "CreditCard" as const;
      default:
        return "CreditCard" as const;
    }
  };

  // Handle add new card
  const _handleAddCard = () => {
    setCardNumber("");
    setCardHolder("");
    setExpiryDate("");
    setCvv("");
    setIsDefault(paymentMethods.length === 0);
    setIsModalVisible(true);
  };

  // Handle save card
  const handleSaveCard = () => {
    // Simple validation
    if (!(cardNumber && cardHolder && expiryDate && cvv)) {
      // Would show validation errors in a real app
      return;
    }

    const maskedCardNumber = `•••• •••• •••• ${cardNumber.slice(-4)}`;

    const newCard = {
      id: `${Date.now()}`,
      type: "credit_card",
      cardNumber: maskedCardNumber,
      cardHolder,
      expiryDate,
      isDefault,
      brand: "Visa", // Would determine based on card number in real app
    };

    if (isDefault) {
      // Update other methods to not be default
      setPaymentMethods((prevMethods) =>
        prevMethods.map((method) => ({ ...method, isDefault: false }))
      );
    }

    setPaymentMethods((prevMethods) => [...prevMethods, newCard]);
    setIsModalVisible(false);
  };

  // Handle set default
  const handleSetDefault = (id: string) => {
    setPaymentMethods((prevMethods) =>
      prevMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  // Handle delete card
  const handleDeleteCard = (id: string) => {
    setPaymentMethods((prevMethods) =>
      prevMethods.filter((method) => method.id !== id)
    );
  };

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header showBackButton title="Payment Methods" />

      <ScrollView className="flex-1">
        {/*<Section
          title="Your cards"
          className="px-global pt-10"
          titleSize='xl'
          />*/}

        <View className="px-global mt-4">
          <CardScroller>
            {paymentMethods.map((method) => (
              <CardPreview
                brand={method.brand}
                cardHolder={method.cardHolder}
                cardNumber={method.cardNumber}
                expiryDate={method.expiryDate}
                isDefault={method.isDefault}
                key={method.id}
                onDelete={() => handleDeleteCard(method.id)}
                onSetDefault={() => handleSetDefault(method.id)}
              />
            ))}
          </CardScroller>
          {/*<Button
            title="Add New Card"
            iconStart="Plus"
            variant="outline"
            className="mt-4"
            onPress={handleAddCard}
          />*/}
        </View>

        {/*} <Section
          title="Digital Wallets"
          className="px-global mt-14"
        />*/}

        <View className="px-global pb-8 mt-4">
          {/* Apple Pay - only on iOS */}

          <TouchableOpacity className="flex-row items-center border-b border-light-secondary dark:border-dark-secondary py-4">
            <View className="w-12 h-12 rounded-lg bg-light-secondary dark:bg-dark-secondary items-center justify-center mr-4">
              <AntDesign color={colors.icon} name="apple" size={24} />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold">Apple Pay</ThemedText>
              <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                Set up Apple Pay for faster checkout
              </ThemedText>
            </View>
            <Icon name="ChevronRight" size={20} />
          </TouchableOpacity>

          {/* Google Pay - available on both platforms */}
          <TouchableOpacity className="flex-row items-center border-b border-light-secondary dark:border-dark-secondary py-4">
            <View className="w-12 h-12 rounded-lg bg-light-secondary dark:bg-dark-secondary items-center justify-center mr-4">
              <AntDesign color={colors.icon} name="google" size={24} />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold">Google Pay</ThemedText>
              <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                Set up Google Pay for faster checkout
              </ThemedText>
            </View>
            <Icon name="ChevronRight" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal animationType="fade" transparent visible={isModalVisible}>
        <View className="flex-1 bg-black/50 justify-center h-screen p-global">
          <View className="bg-light-primary dark:bg-dark-primary rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-6">
              <ThemedText className="text-xl font-semibold">
                Add New Card
              </ThemedText>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Icon name="X" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView className=" pt-4">
              <Input
                keyboardType="numeric"
                label="Card Number"
                onChangeText={setCardNumber}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
              />

              <Input
                label="Cardholder Name"
                onChangeText={setCardHolder}
                placeholder="John Doe"
                value={cardHolder}
              />

              {/* Inputs in a row with the fixed input component */}

              <Input
                containerClassName="flex-1"
                inRow={true}
                label="Expiry Date"
                onChangeText={setExpiryDate}
                placeholder="MM/YY"
                value={expiryDate}
              />

              <Input
                containerClassName="flex-1"
                inRow={true}
                keyboardType="numeric"
                label="CVV"
                onChangeText={setCvv}
                placeholder="123"
                secureTextEntry
                value={cvv}
              />

              <View className="flex-row items-center justify-between py-4 mb-4">
                <ThemedText>Set as default payment method</ThemedText>
                <Toggle onChange={setIsDefault} value={isDefault} />
              </View>
            </ScrollView>

            <View className="flex-row mt-4 gap-4 pt-2 border-t border-light-secondary dark:border-dark-secondary">
              <Button
                className="flex-1"
                onPress={() => setIsModalVisible(false)}
                title="Cancel"
                variant="ghost"
              />
              <Button
                className="flex-1"
                onPress={handleSaveCard}
                title="Save Card"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CardPreview = (props: {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  brand: string;
  isDefault: boolean;
  onSetDefault: () => void;
  onDelete: () => void;
}) => {
  return (
    <View
      className={`h-60 rounded-2xl flex flex-col justify-end ${props.brand === "Visa" ? "bg-lime-300" : "bg-sky-300"}`}
      style={{ width: width - 40, ...shadowPresets.large }}
    >
      <LinearGradient
        className="h-full rounded-2xl p-6 flex flex-col justify-end"
        colors={[
          props.brand === "Visa" ? "#BBF451" : "#74D4FF",
          props.brand === "Visa" ? "#DEFF9F" : "#ACE3FF",
        ]}
        end={{ x: 1, y: 0 }}
        start={{ x: 0, y: 0 }}
      >
        <Text className="font-outfit-bold text-xl">
          •••• •••• •••• {props.cardNumber}
        </Text>
        <View className="flex-row justify-between">
          <Text>{props.cardHolder}</Text>
          <Text>{props.expiryDate}</Text>
        </View>

        <View className="absolute top-6 right-6 flex-row w-full justify-between">
          <Text className="font-outfit-bold text-lg">{props.brand}</Text>
          {/*<TouchableOpacity onPress={props.onDelete} className='ml-auto mr-4'>
            <Icon name="Trash2" size={20} color="black" />
          </TouchableOpacity>*/}
          {props.isDefault ? (
            <View className="px-2 py-1 bg-black rounded-full items-center justify-center">
              <Text className="text-white text-xs">Default</Text>
            </View>
          ) : (
            <Pressable
              className="px-2 py-1 bg-white rounded-full items-center justify-center"
              onPress={props.onSetDefault}
            >
              <Text className="text-black text-xs">Set as default</Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};
