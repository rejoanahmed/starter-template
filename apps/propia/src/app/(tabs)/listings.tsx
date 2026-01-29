import useThemeColors from "@propia/app/contexts/ThemeColors";
import AniamatedView from "@propia/components/AnimatedView";
import { Chip } from "@propia/components/Chip";
import Header, { HeaderIcon } from "@propia/components/Header";
import ThemedText from "@propia/components/ThemedText";
import ThemedScroller from "@propia/components/ThemeScroller";
import { router } from "expo-router";
import { Image, Pressable, View } from "react-native";

const EmptyScreen = () => {
  const _colors = useThemeColors();

  return (
    <AniamatedView animation="scaleIn" className="flex-1">
      <Header
        rightComponents={[
          <HeaderIcon
            href="/screens/add-property-start"
            icon="PlusCircle"
            key="plusCircle"
          />,
        ]}
        //showBackButton
        title=" "
      />
      <ThemedScroller
        className="flex-1 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText className="text-3xl font-semibold">
          Your listings
        </ThemedText>
        <View className="flex-row gap-2 mt-2 mb-10">
          <Chip isSelected label="All" size="lg" />
          <Chip label="Homes" size="lg" />
          <Chip label="Experiences" size="lg" />
        </View>
        <ListingCard
          description="Brooklyn, NY"
          image={require("@propia/assets/img/room-2.avif")}
          title="Apartment in New York"
        />
        <ListingCard
          description="Barcelona, Spain"
          image={require("@propia/assets/img/room-1.avif")}
          title="House in Barcelona"
        />
        <ListingCard
          description="Brooklyn, NY"
          image={require("@propia/assets/img/room-3.avif")}
          title="Lofthouse in New York"
        />
        <ListingCard
          description="Brooklyn, NY"
          image={require("@propia/assets/img/room-4.avif")}
          title="Apartment in New York"
        />
        <ListingCard
          description="Siargao, Philippines"
          image={require("@propia/assets/img/room-5.avif")}
          title="Beach house"
        />
        <ListingCard
          description="Rocky mountain, USA"
          image={require("@propia/assets/img/room-6.avif")}
          title="Forest house"
        />
      </ThemedScroller>
    </AniamatedView>
  );
};

const ListingCard = (props: any) => {
  return (
    <Pressable
      className="flex-row gap-2 items-center mb-5"
      onPress={() => router.push("/screens/product-detail")}
    >
      <Image className="w-20 h-20 rounded-2xl mr-3" source={props.image} />
      <View>
        <ThemedText className="text-base font-semibold">
          {props.title}
        </ThemedText>
        <ThemedText className="font-light mt-1">{props.description}</ThemedText>
      </View>
    </Pressable>
  );
};

export default EmptyScreen;
