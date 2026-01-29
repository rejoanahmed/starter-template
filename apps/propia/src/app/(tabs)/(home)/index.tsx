import AnimatedView from "@propia/components/AnimatedView";
import Card from "@propia/components/Card";
import { CardScroller } from "@propia/components/CardScroller";
import Section from "@propia/components/layout/Section";
import ThemedText from "@propia/components/ThemedText";
import ThemeScroller from "@propia/components/ThemeScroller";
import { shadowPresets } from "@propia/utils/useShadow";
import { router } from "expo-router";
import { useContext } from "react";
import { Animated, Image, Pressable, View } from "react-native";
import { ScrollContext } from "./_layout";

const HomeScreen = () => {
  const scrollY = useContext(ScrollContext);

  return (
    <ThemeScroller
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      <AnimatedView animation="scaleIn" className="flex-1 mt-4">
        <Pressable
          className="p-5 mb-8 flex flex-row items-center rounded-2xl bg-light-primary dark:bg-dark-secondary"
          onPress={() => router.push("/screens/map")}
          style={{ ...shadowPresets.large }}
        >
          <ThemedText className="text-base font-medium flex-1 pr-2">
            Continue searching for experiences in New York
          </ThemedText>
          <View className="w-20 h-20 relative">
            <View className="w-full h-full rounded-xl relative z-20 overflow-hidden border-2 border-light-primary dark:border-dark-primary">
              <Image
                className="w-full h-full"
                source={{
                  uri: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?q=80&w=400",
                }}
              />
            </View>
            <View className="w-full h-full absolute top-0 left-1 rotate-12 rounded-xl overflow-hidden border-2 border-light-primary dark:border-dark-primary">
              <Image
                className="w-full h-full"
                source={{
                  uri: "https://images.pexels.com/photos/69903/pexels-photo-69903.jpeg?auto=compress&cs=tinysrgb&w=1200",
                }}
              />
            </View>
          </View>
        </Pressable>
        {[
          {
            title: "Popular homes in New York",
            properties: [
              {
                title: "Apartment in Brooklyn",
                image: require("@propia/assets/img/room-1.avif"),
                price: "$85",
              },
              {
                title: "Flat in Manhattan",
                image: require("@propia/assets/img/room-2.avif"),
                price: "$90",
              },
              {
                title: "House in Long Island",
                image: require("@propia/assets/img/room-3.avif"),
                price: "$110",
              },
              {
                title: "Flat in Manhattan",
                image: require("@propia/assets/img/room-4.avif"),
                price: "$95",
              },
            ],
          },
          {
            title: "Trending in Queens",
            properties: [
              {
                title: "Modern Loft in Astoria",
                image: require("@propia/assets/img/room-5.avif"),
                price: "$85",
              },
              {
                title: "Studio in Long Island",
                image: require("@propia/assets/img/room-6.avif"),
                price: "$90",
              },
              {
                title: "Condo in Forest Hills",
                image: require("@propia/assets/img/room-7.avif"),
                price: "$110",
              },
              {
                title: "Apartment in Flushing",
                image: require("@propia/assets/img/room-1.avif"),
                price: "$95",
              },
            ],
          },
          {
            title: "Best rated in The Bronx",
            properties: [
              {
                title: "Cozy Home in Riverdale",
                image: require("@propia/assets/img/room-2.avif"),
                price: "$75",
              },
              {
                title: "Apartment at Riverdale",
                image: require("@propia/assets/img/room-3.avif"),
                price: "$80",
              },
              {
                title: "Loft in Mott Haven",
                image: require("@propia/assets/img/room-4.avif"),
                price: "$95",
              },
              {
                title: "Condo in Fordham",
                image: require("@propia/assets/img/room-5.avif"),
                price: "$85",
              },
            ],
          },
          {
            title: "Top picks in Staten Island",
            properties: [
              {
                title: "House in St. George",
                image: require("@propia/assets/img/room-6.avif"),
                price: "$120",
              },
              {
                title: "Apartment in George",
                image: require("@propia/assets/img/room-7.avif"),
                price: "$95",
              },
              {
                title: "Bungalow in Great Kills",
                image: require("@propia/assets/img/room-1.avif"),
                price: "$110",
              },
              {
                title: "Condo in Todt Hill",
                image: require("@propia/assets/img/room-2.avif"),
                price: "$135",
              },
            ],
          },
          {
            title: "New listings in Harlem",
            properties: [
              {
                title: "Brownstone in Hamilton",
                image: require("@propia/assets/img/room-3.avif"),
                price: "$125",
              },
              {
                title: "Studio in East Harlem",
                image: require("@propia/assets/img/room-4.avif"),
                price: "$90",
              },
              {
                title: "Apartment in Sugar Hill",
                image: require("@propia/assets/img/room-5.avif"),
                price: "$105",
              },
              {
                title: "Loft in Manhattanville",
                image: require("@propia/assets/img/room-6.avif"),
                price: "$115",
              },
            ],
          },
          {
            title: "Featured in Williamsburg",
            properties: [
              {
                title: "Industrial Loft",
                image: require("@propia/assets/img/room-7.avif"),
                price: "$140",
              },
              {
                title: "Rooftop Apartment",
                image: require("@propia/assets/img/room-1.avif"),
                price: "$125",
              },
              {
                title: "Modern Studio",
                image: require("@propia/assets/img/room-2.avif"),
                price: "$110",
              },
              {
                title: "Converted Warehouse",
                image: require("@propia/assets/img/room-3.avif"),
                price: "$130",
              },
            ],
          },
        ].map((section, index) => (
          <Section
            key={`ny-section-${index}`}
            link="/screens/map"
            linkText="View all"
            title={section.title}
            titleSize="lg"
          >
            <CardScroller className="mt-1.5 pb-4" space={15}>
              {section.properties.map((property, propIndex) => (
                <Card
                  hasFavorite
                  href="/screens/product-detail"
                  image={property.image}
                  imageHeight={160}
                  key={`property-${index}-${propIndex}`}
                  price={property.price}
                  rating={4.5}
                  rounded="2xl"
                  title={property.title}
                  width={160}
                />
              ))}
            </CardScroller>
          </Section>
        ))}
      </AnimatedView>
    </ThemeScroller>
  );
};

export default HomeScreen;
