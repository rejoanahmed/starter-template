import useThemeColors from "@propia/app/contexts/ThemeColors";
import { shadowPresets } from "@propia/utils/useShadow";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import type React from "react";
import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedView from "./AnimatedView";

// Reanimated 4 supports sharedTransitionTag at runtime; types omit it (experimental API).
const ReanimatedView = Animated.View as React.ComponentType<
  React.ComponentProps<typeof Animated.View> & { sharedTransitionTag?: string }
>;

import { Button } from "./Button";
import DateRangeCalendar from "./DateRangeCalendar";
import Counter from "./forms/Counter";
import Icon from "./Icon";
import Divider from "./layout/Divider";
import ThemedText from "./ThemedText";
import ThemedScroller from "./ThemeScroller";

const SearchBar = (props: any) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <View className="px-global  bg-light-primary dark:bg-dark-primary w-full relative z-50">
        <Pressable className="" onPress={() => setShowModal(true)}>
          <ReanimatedView
            className="bg-light-primary flex-row justify-center relative z-50 py-4 px-10 mt-3 mb-4  dark:bg-white/20 rounded-full"
            sharedTransitionTag="searchBar"
            style={{
              elevation: 10,
              height: 50,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 8.84,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <Icon name="Search" size={16} strokeWidth={3} />
            <ThemedText className="text-black dark:text-white font-medium ml-2 mr-4">
              Search here
            </ThemedText>
          </ReanimatedView>
        </Pressable>
      </View>

      <SearchModal setShowModal={setShowModal} showModal={showModal} />
    </>
  );
};

const SearchModal = ({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}) => {
  const insets = useSafeAreaInsets();
  const [openAccordion, setOpenAccordion] = useState<string | null>("where");

  return (
    <Modal
      animationType="fade"
      className="flex-1"
      statusBarTranslucent={true}
      transparent={true}
      visible={showModal}
    >
      <BlurView
        className="flex-1 "
        experimentalBlurMethod="none"
        intensity={20}
        tint="systemUltraThinMaterialLight"
      >
        <AnimatedView
          animation="slideInTop"
          className="flex-1"
          delay={0}
          duration={Platform.OS === "ios" ? 500 : 0}
        >
          <View className="flex-1 bg-neutral-200/70 dark:bg-black/90 ">
            <ThemedScroller
              className="bg-transparent"
              style={{ paddingTop: insets.top + 10 }}
            >
              <Pressable
                className="items-center justify-center w-12 my-3 h-12 rounded-full ml-auto bg-light-primary dark:bg-dark-secondary"
                onPress={() => setShowModal(false)}
                style={{
                  ...shadowPresets.card,
                  elevation: 10,
                  height: 50,
                  shadowColor: "#000",
                  shadowOpacity: 0.3,
                  shadowRadius: 8.84,
                  shadowOffset: { width: 0, height: 0 },
                }}
              >
                <Icon name="X" size={24} strokeWidth={2} />
              </Pressable>
              <AccordionItem
                isOpen={openAccordion === "where"}
                label="New York"
                onPress={() =>
                  setOpenAccordion(openAccordion === "where" ? null : "where")
                }
                title="Where?"
              >
                <Where />
              </AccordionItem>

              <AccordionItem
                isOpen={openAccordion === "when"}
                label="Jul 21"
                onPress={() =>
                  setOpenAccordion(openAccordion === "when" ? null : "when")
                }
                title="When?"
              >
                <DateRangeCalendar
                  className="mt-4"
                  minDate={new Date().toISOString().split("T")[0]}
                  onDateRangeChange={(range) => {
                    console.log("Date range selected:", range);
                  }}
                />
              </AccordionItem>

              <AccordionItem
                isOpen={openAccordion === "who"}
                label="1 adult"
                onPress={() =>
                  setOpenAccordion(openAccordion === "who" ? null : "who")
                }
                title="Who?"
              >
                <CounterRow label="Adults" legend="Ages 13 or above" />
                <Divider />
                <CounterRow label="Children" legend="Ages 2-12" />
                <Divider />
                <CounterRow label="Infants" legend="Under 2" />
                <Divider />
                <CounterRow label="Pets" legend="Bringing a service animal?" />
              </AccordionItem>
            </ThemedScroller>
            <View
              className="flex-row w-full px-6 justify-between"
              style={{ paddingBottom: insets.bottom + 10 }}
            >
              <Button
                className=""
                onPress={() => setShowModal(false)}
                title="Clear "
                variant="ghost"
              />
              <Button
                className=""
                iconColor="white"
                iconStart="Search"
                onPress={() => {
                  setShowModal(false);
                  router.push("/screens/map");
                }}
                textClassName="text-white"
                title="Search"
                variant="primary"
              />
            </View>
          </View>
        </AnimatedView>
      </BlurView>
    </Modal>
  );
};

const AccordionItem = ({
  title,
  children,
  isOpen,
  label,
  onPress,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  label?: string;
  onPress: () => void;
}) => {
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(animatedHeight.value, { duration: 200 }),
    overflow: "hidden",
  }));

  useEffect(() => {
    animatedHeight.value = isOpen ? contentHeight : 0;
  }, [isOpen, contentHeight, animatedHeight]);

  return (
    <View
      className="bg-light-primary relative dark:bg-dark-secondary rounded-2xl mb-global"
      style={{ ...shadowPresets.large }}
    >
      <Pressable className="w-full p-global" onPress={onPress}>
        <View className="flex-row w-full justify-between items-center">
          <ThemedText
            className={` ${isOpen ? "text-lg" : "text-lg"} font-semibold`}
          >
            {title}
          </ThemedText>
          {isOpen ? null : (
            <ThemedText className="text-sm font-semibold">{label}</ThemedText>
          )}
        </View>
      </Pressable>

      <Animated.View style={animatedStyle}>
        <View
          className="absolute w-full px-global pb-2 pt-0 -mt-4"
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const CounterRow = (props: { label: string; legend: string }) => {
  return (
    <View className="flex-row items-center justify-between py-4">
      <View>
        <ThemedText className="text-base font-semibold">
          {props.label}
        </ThemedText>
        <ThemedText className="text-sm">{props.legend}</ThemedText>
      </View>
      <Counter />
    </View>
  );
};

const Where = () => {
  const colors = useThemeColors();
  return (
    <>
      <View className="relative">
        <Icon
          className="absolute left-4 top-1/2 -translate-y-1/2"
          name="Search"
          size={16}
          strokeWidth={3}
        />
        <TextInput
          className="p-4 pl-10 mt-4 border border-neutral-500 dark:border-neutral-300 rounded-xl"
          placeholder="Search destinations"
          placeholderTextColor={colors.text}
        />
      </View>
      <ThemedText className="text-xs mt-4">Recent searches</ThemedText>
      <DestinationRow
        description="Week in July"
        icon="MapPin"
        title="New York"
      />
      <ThemedText className="text-xs mt-4">Suggested destinations</ThemedText>
      <DestinationRow
        description="Explore the area"
        icon="Send"
        iconbg="bg-sky-100 dark:bg-sky-900"
        title="Nearby"
      />
      <DestinationRow
        description="Week in July"
        icon="Building2"
        iconbg="bg-amber-100 dark:bg-amber-900"
        title="New Jersey"
      />
      <DestinationRow
        description="Week in July"
        icon="MapPin"
        iconbg="bg-amber-100 dark:bg-amber-900"
        title="Washington DC"
      />
    </>
  );
};

const DestinationRow = (props: any) => {
  return (
    <View className="flex-row items-center justify-start my-2">
      <Icon
        className={`w-12 h-12 rounded-xl bg-light-secondary dark:bg-dark-primary ${props.iconbg}`}
        name={props.icon}
        size={25}
        strokeWidth={1.2}
      />
      <View className="ml-4">
        <ThemedText className="text-sm font-semibold">{props.title}</ThemedText>
        <ThemedText className="text-xs text-neutral-500">
          {props.description}
        </ThemedText>
      </View>
    </View>
  );
};

export default SearchBar;
