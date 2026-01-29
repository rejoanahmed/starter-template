import { Button } from "@propia/components/Button";
import { Chip } from "@propia/components/Chip";
import Counter from "@propia/components/forms/Counter";
import Switch from "@propia/components/forms/Switch";
import Header from "@propia/components/Header";
import Section from "@propia/components/layout/Section";
import ThemedText from "@propia/components/ThemedText";
import ThemeFooter from "@propia/components/ThemeFooter";
import ThemedScroller from "@propia/components/ThemeScroller";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function FiltersScreen() {
  const router = useRouter();
  const [price, setPrice] = useState(50);

  const handleApplyFilters = () => {
    // Handle applying filters here
    router.back();
  };

  return (
    <>
      <Header showBackButton title="Filters" />
      <ThemedScroller className="flex-1 bg-light-primary dark:bg-dark-primary">
        <Section
          className="mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary"
          subtitle={`Up to $${Math.round(price)} USD`}
          title="Price"
        >
          <Slider
            maximumTrackTintColor="rgba(0,0,0,0.2)"
            maximumValue={1000}
            minimumTrackTintColor="#FF2358"
            minimumValue={100}
            onValueChange={setPrice}
            step={10}
            style={{ width: "100%", height: 40 }}
            value={price}
          />
        </Section>

        <Section
          className="mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary"
          title="Rooms and beds"
        >
          <CounterRow label="Bedrooms" />
          <CounterRow label="Beds" />
          <CounterRow label="Bathrooms" />
        </Section>

        <Section
          className="mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary"
          title="Amenities"
        >
          <View className="flex-row flex-wrap gap-2 mt-2">
            <Chip icon="Bed" label="Kitchen" selectable size="lg" />
            <Chip
              icon="Snowflake"
              label="Air conditioning"
              selectable
              size="lg"
            />
            <Chip icon="Wifi" label="Wifi" selectable size="lg" />
            <Chip icon="Tv" label="TV" selectable size="lg" />
            <Chip icon="Car" label="Parking" selectable size="lg" />
          </View>
        </Section>

        <Section
          className="mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary"
          title="Additional Options"
        >
          <View className="mt-4 space-y-4">
            <Switch label="Step free bedroom access" />
            <Switch label="Shower grab bar" />
            <Switch label="Disabled paraking spot" />
          </View>
        </Section>
      </ThemedScroller>
      <ThemeFooter>
        <Button
          className="bg-highlight"
          onPress={handleApplyFilters}
          rounded="full"
          size="large"
          textClassName="text-white"
          title="Apply Filters"
        />
      </ThemeFooter>
    </>
  );
}

const CounterRow = (props: { label: string }) => {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View>
        <ThemedText className="text-base font-normal">{props.label}</ThemedText>
      </View>
      <Counter />
    </View>
  );
};
