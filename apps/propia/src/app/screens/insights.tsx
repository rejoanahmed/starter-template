import useThemeColors from "@propia/app/contexts/ThemeColors";

import Header from "@propia/components/Header";
import Icon from "@propia/components/Icon";
import Grid from "@propia/components/layout/Grid";
import Section from "@propia/components/layout/Section";
import ThemedText from "@propia/components/ThemedText";
import ThemedScroller from "@propia/components/ThemeScroller";
import { shadowPresets } from "@propia/utils/useShadow";
import { View } from "react-native";

const InsightsScreen = () => {
  const _colors = useThemeColors();

  return (
    <>
      <Header showBackButton title=" " />
      <ThemedScroller className="flex-1" keyboardShouldPersistTaps="handled">
        <Section className="py-10" title="Insights" titleSize="3xl" />
        <Grid columns={2} spacing={10}>
          <InsightCard
            amount="1/4"
            icon="Calendar"
            percentage={25}
            title="Longer Stays"
          />
          <InsightCard
            amount="2/4"
            icon="WashingMachine"
            percentage={50}
            title="Amenities"
          />
          <InsightCard
            amount="3/4"
            icon="SlidersHorizontal"
            percentage={75}
            title="Flexible Stays"
          />
          <InsightCard
            amount="2/4"
            icon="Users"
            percentage={50}
            title="Family Travel"
          />
          <InsightCard
            amount="1/4"
            icon="Waves"
            percentage={25}
            title="Beachfront"
          />
          <InsightCard
            amount="2/4"
            icon="Dog"
            percentage={50}
            title="Pet Friendly"
          />
          <InsightCard amount="3/4" icon="Home" percentage={75} title="Star" />
        </Grid>
      </ThemedScroller>
    </>
  );
};

const InsightCard = (props: any) => {
  return (
    <View
      className="bg-light-primary dark:bg-dark-secondary rounded-3xl p-4"
      style={{ ...shadowPresets.large }}
    >
      <Icon
        className="bg-highlight w-12 h-12 rounded-full mb-20"
        color="white"
        name={props.icon}
        size={20}
        strokeWidth={2}
      />
      <ThemedText className="text-xl font-semibold mb-1">
        {props.title}
      </ThemedText>
      <View className="flex-row items-center w-full">
        <View className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 flex-1 mr-3">
          <View
            className="h-full bg-highlight rounded-full "
            style={{ width: `${props.percentage}%` }}
          />
        </View>
        <ThemedText className="text-sm opacity-50">{props.amount}</ThemedText>
      </View>
    </View>
  );
};

export default InsightsScreen;
