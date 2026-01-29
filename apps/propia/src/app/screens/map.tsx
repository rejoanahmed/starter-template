import useThemeColors from "@propia/app/contexts/ThemeColors";
import CustomCard from "@propia/components/CustomCard";
import Header, { HeaderIcon } from "@propia/components/Header";
import ImageCarousel from "@propia/components/ImageCarousel";
import PriceMarker from "@propia/components/PriceMarker";
import SearchBar from "@propia/components/SearchBar";
import ShowRating from "@propia/components/ShowRating";
import ThemedText from "@propia/components/ThemedText";
import React, { useRef } from "react";
import { Text, View } from "react-native";
import ActionSheet, {
  type ActionSheetRef,
  FlatList,
} from "react-native-actions-sheet";
import MapView from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// type IconName = Exclude<
//   keyof typeof LucideIcons,
//   "createLucideIcon" | "default"
// >;

// const { height } = Dimensions.get("window");

const properties = [
  {
    id: 1,
    title: "Beachfront Villa",
    price: "$200",
    rating: "4.9",
    description: "Stay with Julia",
    lat: 40.7589, // Manhattan - Times Square area
    lng: -73.9851,
    image: ["https://tinyurl.com/2blrf2sk", "https://tinyurl.com/2yyfr9rc"], // Multiple images for the first property
  },
  {
    id: 2,
    title: "Cozy Surf Shack",
    price: "$120",
    rating: "4.6",
    description: "Stay with John",
    lat: 40.6892, // Brooklyn - Park Slope
    lng: -73.9814,
    image: "https://tinyurl.com/2cmu4ns5", // Single image for the second property
  },
  {
    id: 3,
    title: "Luxury Penthouse",
    price: "$350",
    rating: "4.8",
    description: "Stay with Tomas",
    lat: 40.7505, // Manhattan - Chelsea
    lng: -73.9934,
    image: ["https://tinyurl.com/2yyfr9rc", "https://tinyurl.com/2blrf2sk"], // Multiple images for the last property
  },
  {
    id: 4,
    title: "Modern Loft",
    price: "$180",
    rating: "4.7",
    description: "Stay with Sarah",
    lat: 40.7282, // Lower East Side
    lng: -73.9942,
    image: ["https://tinyurl.com/2blrf2sk"],
  },
  {
    id: 5,
    title: "Brooklyn Heights Apartment",
    price: "$160",
    rating: "4.5",
    description: "Stay with Mike",
    lat: 40.6962, // Brooklyn Heights
    lng: -73.9969,
    image: ["https://tinyurl.com/2yyfr9rc"],
  },
  {
    id: 6,
    title: "Queens Studio",
    price: "$95",
    rating: "4.3",
    description: "Stay with Anna",
    lat: 40.7282, // Long Island City, Queens
    lng: -73.9442,
    image: ["https://tinyurl.com/2cmu4ns5"],
  },
];

const MapScreen = () => {
  const colors = useThemeColors();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const mapRef = useRef<MapView>(null);
  const _insets = useSafeAreaInsets();
  const [selectedMarkerId, setSelectedMarkerId] = React.useState<number | null>(
    null
  );
  const [_currentSnapIndex, _setCurrentSnapIndex] = React.useState(0);
  React.useEffect(() => {
    actionSheetRef.current?.show();
  }, []);

  const rightComponents = [
    <>
      {/*<HeaderIcon
            onPress={() => {
                if (!actionSheetRef.current) return;
                const nextIndex = actionSheetRef.current.currentSnapIndex() === 0 ? 1 : 0;
                actionSheetRef.current.snapToIndex(nextIndex);
                setSnapIndex(nextIndex);
            }}
            icon="Map" href="0" />,*/}
      <HeaderIcon href="/screens/filters" icon="SlidersHorizontal" />
    </>,
  ];

  const [_snapIndex, _setSnapIndex] = React.useState(0);
  return (
    <>
      <Header
        middleComponent={<SearchBar />}
        rightComponents={rightComponents}
        showBackButton
      />

      <View className="flex-1 bg-light-primary dark:bg-dark-primary">
        <MapView
          className="w-full h-[100vh]"
          initialRegion={{
            latitude: 40.7282, // Center of New York City
            longitude: -73.9776,
            latitudeDelta: 0.1, // Zoom out to show more of NYC
            longitudeDelta: 0.1,
          }}
          ref={mapRef}
        >
          {properties.map((property) => (
            <PriceMarker
              coordinate={{ latitude: property.lat, longitude: property.lng }}
              isSelected={selectedMarkerId === property.id}
              key={property.id}
              onPress={() => {
                setSelectedMarkerId(property.id);
                // Optionally scroll to the property in the list
                console.log("Selected property:", property.title);
              }}
              price={property.price}
              title={property.title}
            />
          ))}
        </MapView>

        <ActionSheet
          backgroundInteractionEnabled
          CustomHeaderComponent={
            <View className="w-full items-center justify-center mb-2">
              <View className="w-14 h-2 mt-2 rounded-full bg-light-secondary dark:bg-dark-secondary" />
              <ThemedText className="font-bold mt-3">345 Properties</ThemedText>
            </View>
          }
          closable={false}
          containerStyle={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: colors.bg,
          }}
          gestureEnabled
          initialSnapIndex={1}
          isModal={false}
          overdrawEnabled={false}
          ref={actionSheetRef}
          snapPoints={[10, 100]}
        >
          <FlatList
            className="px-2"
            data={properties}
            keyExtractor={(item) => item.id.toString()}
            // ListHeaderComponent={
            //     <View className='w-full items-center justify-center mb-2'>
            //         <ThemedText className='font-bold mt-3'>345 Properties</ThemedText>
            //     </View>
            // }
            renderItem={({ item }) => (
              <CustomCard
                className="my-0 w-full overflow-hidden"
                href="/screens/product-detail"
                padding="md"
              >
                <ImageCarousel
                  className="w-full"
                  height={300}
                  images={Array.isArray(item.image) ? item.image : [item.image]}
                  rounded="xl"
                />

                <View className="pb-global pt-2">
                  <View className="flex-row items-center justify-between">
                    <ThemedText className="text-base font-bold">
                      {item.title}
                    </ThemedText>
                    <ShowRating rating={Number(item.rating)} size="md" />
                  </View>
                  <Text className="text-sm text-light-subtext dark:text-dark-subtext">
                    {item.description}
                  </Text>
                  <ThemedText className="font-bold text-base mt-2">
                    {item.price} <Text className="font-normal">night</Text>
                  </ThemedText>
                </View>
              </CustomCard>
            )}
            showsVerticalScrollIndicator={false}
          />
        </ActionSheet>
      </View>
    </>
  );
};
export default MapScreen;
