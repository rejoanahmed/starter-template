import AnimatedView from "@propia/components/AnimatedView";
import { Button } from "@propia/components/Button";
import Header from "@propia/components/Header";
import Icon from "@propia/components/Icon";
import ThemedText from "@propia/components/ThemedText";
import ThemedScroller from "@propia/components/ThemeScroller";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

type Currency = {
  code: string;
  title: string;
};

const CurrencyScreen = () => {
  const navigation = useNavigation();
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const currencies: Currency[] = [
    { code: "USD", title: "United States Dollar" },
    { code: "EUR", title: "Euro" },
    { code: "GBP", title: "British Pound" },
    { code: "CAD", title: "Canadian Dollar" },
    { code: "AUD", title: "Australian Dollar" },
    { code: "CHF", title: "Swiss Franc" },
    { code: "JPY", title: "Japanese Yen" },
    { code: "CNY", title: "Chinese Yuan" },
    { code: "INR", title: "Indian Rupee" },
    { code: "BRL", title: "Brazilian Real" },
    { code: "ZAR", title: "South African Rand" },
    { code: "MXN", title: "Mexican Peso" },
  ];

  const saveSettings = () => {
    // Here you would save the selected currency
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg">
      <Header
        rightComponents={[
          <Button key="save-settings" onPress={saveSettings} title="Save" />,
        ]}
        showBackButton
        title="Currency"
      />
      <ThemedScroller>
        {currencies.map((currency) => (
          <CurrencyItem
            code={currency.code}
            key={currency.code}
            onSelect={() => setSelectedCurrency(currency.code)}
            selected={selectedCurrency === currency.code}
            title={currency.title}
          />
        ))}
      </ThemedScroller>
    </View>
  );
};

type CurrencyItemProps = {
  title: string;
  code: string;
  selected: boolean;
  onSelect: () => void;
};

const CurrencyItem = ({
  title,
  code,
  selected,
  onSelect,
}: CurrencyItemProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`flex-row items-center justify-between py-4 border-b border-light-secondary dark:border-dark-secondary ${selected ? "opacity-100" : "opacity-100 "}`}
      onPress={onSelect}
    >
      <View>
        <ThemedText className="text-lg font-bold">{code}</ThemedText>
        <ThemedText className="text-light-subtext dark:text-dark-subtext">
          {title}
        </ThemedText>
      </View>
      {selected && (
        <AnimatedView animation="bounceIn" duration={500}>
          <Icon name="Check" size={25} />
        </AnimatedView>
      )}
    </TouchableOpacity>
  );
};

export default CurrencyScreen;
