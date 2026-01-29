import useThemeColors from "@propia/app/contexts/ThemeColors";

import Header from "@propia/components/Header";
import Icon from "@propia/components/Icon";
import ThemedText from "@propia/components/ThemedText";
import ThemedScroller from "@propia/components/ThemeScroller";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

const EarningsScreen = () => {
  const colors = useThemeColors();
  const screenWidth = Dimensions.get("window").width;

  // Sample earnings data for 12 months
  const earningsData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        data: [
          45_000, 28_000, 35_000, 85_000, 120_000, 95_000, 110_000, 75_000,
          90_000, 105_000, 80_000, 125_000,
        ],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.bg,
    backgroundGradientFrom: colors.bg,
    backgroundGradientTo: colors.bg,
    decimalPlaces: 0,
    color: (_opacity = 1) => colors.highlight,
    labelColor: (_opacity = 1) => colors.placeholder,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "0",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: colors.border,
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: "500",
    },
    formatYLabel: (value: string) => {
      const num = Number.parseInt(value, 10);
      if (num >= 1_000_000) {
        return `₱${(num / 1_000_000).toFixed(0)}M`;
      }
      if (num >= 1000) {
        return `₱${(num / 1000).toFixed(0)}K`;
      }
      return `₱${num}`;
    },
    barPercentage: 0.8,
    fillShadowGradientFrom: colors.highlight,
    fillShadowGradientTo: colors.bg,
    fillShadowGradientFromOpacity: 1,
    fillShadowGradientToOpacity: 1,
  };

  return (
    <>
      <Header showBackButton title="" />
      <ThemedScroller
        className="flex-1 px-0"
        keyboardShouldPersistTaps="handled"
      >
        <Counter />

        {/* Scrollable Bar Chart */}
        <View className="mb-6">
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20 }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <BarChart
              chartConfig={chartConfig}
              data={earningsData} // Make chart wider than screen for scrolling
              fromZero={true}
              height={300}
              segments={4}
              showBarTops={false}
              showValuesOnTopOfBars={false}
              style={{
                borderRadius: 16,
              }}
              width={screenWidth * 1.5}
              withInnerLines={true}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </ScrollView>
        </View>
        <View className="px-global border-t-8 pt-global border-light-secondary dark:border-dark-secondary">
          <ThemedText className="text-2xl font-semibold mb-4">
            Upcoming
          </ThemedText>
          <UpcomingList amount="$1,200.00" date="June 12" status="Scheduled" />
          <UpcomingList amount="$4,200.00" date="June 16" status="Scheduled" />
          <UpcomingList amount="$2,200.00" date="June 20" status="Scheduled" />
          <UpcomingList amount="$3,200.00" date="June 24" status="Scheduled" />
          <UpcomingList amount="$5,200.00" date="June 28" status="Scheduled" />
        </View>
      </ThemedScroller>
    </>
  );
};

const UpcomingList = (props: any) => {
  return (
    <View className="flex-row items-center justify-between my-3">
      <View>
        <ThemedText className="text-base opacity-50">{props.status}</ThemedText>
        <ThemedText className="text-lg">{props.date}</ThemedText>
      </View>
      <ThemedText className="text-lg">{props.amount}</ThemedText>
    </View>
  );
};

const Counter = (_props: any) => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const countAnim = useRef(new Animated.Value(0)).current;

  const monthsData = [
    { month: "this month", amount: 10_201 },
    { month: "in April", amount: 8750 },
    { month: "in March", amount: 12_340 },
    { month: "in February", amount: 9680 },
    { month: "in January", amount: 11_520 },
    { month: "in December", amount: 15_200 },
  ];

  const currentData = monthsData[currentMonthIndex];
  const [displayAmount, setDisplayAmount] = useState(currentData.amount);

  useEffect(() => {
    // Animate number counting
    const startValue = displayAmount;
    const endValue = currentData.amount;

    countAnim.setValue(0);

    const listener = countAnim.addListener(({ value }) => {
      const currentAmount = Math.round(
        startValue + (endValue - startValue) * value
      );
      setDisplayAmount(currentAmount);
    });

    Animated.timing(countAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();

    return () => {
      countAnim.removeListener(listener);
    };
  }, [countAnim, currentData.amount, displayAmount]);

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(callback, 200);
  };

  const goToPrevious = () => {
    if (currentMonthIndex < monthsData.length - 1) {
      animateTransition(() => {
        setCurrentMonthIndex(currentMonthIndex + 1);
      });
    }
  };

  const goToNext = () => {
    if (currentMonthIndex > 0) {
      animateTransition(() => {
        setCurrentMonthIndex(currentMonthIndex - 1);
      });
    }
  };

  return (
    <View className="mt-14 mb-20 px-global">
      <ThemedText className="text-5xl font-semibold">You've made</ThemedText>
      <ThemedText className="text-5xl text-highlight font-semibold">
        ${displayAmount.toLocaleString()}
      </ThemedText>
      <View className="flex-row items-center justify-between">
        <Animated.View style={{ opacity: fadeAnim }}>
          <ThemedText className="text-5xl font-semibold">
            {currentData.month}
          </ThemedText>
        </Animated.View>
        <View className="flex-row items-center justify-center">
          <Pressable
            className={`w-10 h-10 items-center justify-center mr-2 rounded-full border border-neutral-300 ${
              currentMonthIndex >= monthsData.length - 1
                ? "opacity-30"
                : "opacity-100"
            }`}
            disabled={currentMonthIndex >= monthsData.length - 1}
            onPress={goToPrevious}
          >
            <Icon className="-translate-x-px" name="ChevronLeft" size={24} />
          </Pressable>
          <Pressable
            className={`w-10 h-10 items-center justify-center rounded-full border border-neutral-300 ${
              currentMonthIndex <= 0 ? "opacity-30" : "opacity-100"
            }`}
            disabled={currentMonthIndex <= 0}
            onPress={goToNext}
          >
            <Icon className="translate-x-px" name="ChevronRight" size={24} />
          </Pressable>
        </View>
      </View>
      <ThemedText className="text-lg">
        Upcoming{" "}
        <ThemedText className="text-lg font-semibold">$3,201</ThemedText>
      </ThemedText>
    </View>
  );
};

export default EarningsScreen;
