import { useCollapsibleTitle } from "@propia/app/hooks/useCollapsibleTitle";
import AnimatedView from "@propia/components/AnimatedView";
import Card from "@propia/components/Card";
import Favorite from "@propia/components/Favorite";
import Header, { HeaderIcon } from "@propia/components/Header";
import Icon from "@propia/components/Icon";
import Grid from "@propia/components/layout/Grid";
import { Placeholder } from "@propia/components/Placeholder";
import ShowRating from "@propia/components/ShowRating";
import ThemedText from "@propia/components/ThemedText";
import ThemeScroller from "@propia/components/ThemeScroller";
import { shadowPresets } from "@propia/utils/useShadow";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";

const savedItems = [
  {
    id: 1,
    title: "Barcelona",
    descrition: "5 saved",
    image: require("@propia/assets/img/room-1.avif"),
  },
  {
    id: 2,
    title: "Paris",
    descrition: "3 saved",
    image: require("@propia/assets/img/room-2.avif"),
  },
  {
    id: 3,
    title: "London",
    descrition: "2 saved",
    image: require("@propia/assets/img/room-3.avif"),
  },
  {
    id: 4,
    title: "Rome",
    descrition: "1 saved",
    image: require("@propia/assets/img/room-4.avif"),
  },
  {
    id: 5,
    title: "New York",
    descrition: "0 saved",
    image: require("@propia/assets/img/room-5.avif"),
  },
];

const FavoritesScreen = () => {
  const { width: _ } = Dimensions.get("window");
  const [isEditMode, setIsEditMode] = useState(false);
  const { scrollY, scrollHandler, scrollEventThrottle } = useCollapsibleTitle();
  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <AnimatedView animation="scaleIn" className="flex-1">
        <Header
          rightComponents={[
            <HeaderIcon
              href="/screens/favorites"
              icon={isEditMode ? "Check" : "Edit2"}
              key="edit"
              onPress={() => setIsEditMode(!isEditMode)}
            />,
          ]}
          scrollY={scrollY}
          title="Favorites"
          variant="collapsibleTitle"
        />
        <ThemeScroller
          className="pt-4"
          onScroll={scrollHandler}
          scrollEventThrottle={scrollEventThrottle}
        >
          {savedItems.length > 0 ? (
            <Grid className="mt-2" columns={2} spacing={20}>
              {savedItems.map((item) => (
                <Card
                  description={item.descrition}
                  href={"/screens/favorite-list"}
                  image={item.image}
                  imageHeight={180}
                  key={item.id}
                  rounded="2xl"
                  title={item.title}
                >
                  {isEditMode && (
                    <Pressable className="absolute top-2 right-2 w-7 h-7 rounded-full bg-light-primary dark:bg-dark-primary items-center justify-center">
                      <Icon name="X" size={18} strokeWidth={2} />
                    </Pressable>
                  )}
                </Card>
              ))}
            </Grid>
          ) : (
            <Placeholder
              subtitle="Browse services and save your favorites"
              title="No saved items in this category"
            />
          )}
        </ThemeScroller>
      </AnimatedView>
    </View>
  );
};

type SavedItemCardProps = {
  title: string;
  image: any;
  price: string;
  rating: number;
};

const _SavedItemCard = ({
  title,
  image,
  price,
  rating,
}: SavedItemCardProps) => {
  return (
    <Link asChild href="/screens/product-detail">
      <TouchableOpacity
        activeOpacity={0.8}
        className="w-full mb-4 flex flex-row rounded-lg bg-light-secondary dark:bg-dark-secondary"
        style={{
          ...shadowPresets.card,
        }}
      >
        <View className="w-1/3 h-[110px] relative">
          <Image className="w-full h-full rounded-l-lg" source={image} />
          <LinearGradient
            className="absolute w-full h-full top-0 left-0 items-start justify-start p-3 rounded-l-lg"
            colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0)"]}
            dither={false}
          >
            <Favorite initialState={true} isWhite size={20} />
          </LinearGradient>
        </View>
        <View className="p-3 flex-1 justify-between">
          <View className="flex-1 justify-start">
            <ThemedText className="text-sm font-semibold">{title}</ThemedText>
          </View>
          <View className="flex-row justify-between items-end flex-1">
            <ShowRating rating={rating} size="sm" />
            <ThemedText className="text-sm font-semibold">{price}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default FavoritesScreen;
