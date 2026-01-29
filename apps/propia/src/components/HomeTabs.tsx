import { router, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, TouchableOpacity, View } from "react-native";
import ThemedText from "./ThemedText";

const HomeTabs = (props: any) => {
  // Get current path to determine active tab
  const currentPath = usePathname();

  return (
    <View
      className="w-full flex-row justify-center  bg-light-primary dark:bg-dark-primary border-b border-gray-200 dark:border-dark-secondary"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <TabItem
        active={currentPath === "/"}
        href="/"
        icon={require("@propia/assets/img/house.png")}
        label="Home"
        scrollY={props.scrollY}
      />
      <TabItem
        active={currentPath === "/experience"}
        href="/experience"
        icon={require("@propia/assets/img/experience.png")}
        label="Experiences"
        scrollY={props.scrollY}
      />
      <TabItem
        active={currentPath === "/services"}
        href="/services"
        icon={require("@propia/assets/img/services.png")}
        label="Services"
        scrollY={props.scrollY}
      />
    </View>
  );
};

const TabItem = (props: any) => {
  // Track if we're in expanded or collapsed state
  const [isExpanded, setIsExpanded] = useState(true);

  // Animated value for size only
  const animatedSize = useRef(new Animated.Value(45)).current;

  // Listen for scroll position changes
  useEffect(() => {
    const listenerId = props.scrollY.addListener(
      ({ value }: { value: number }) => {
        // Only trigger animation when crossing the threshold
        if (value > 20 && isExpanded) {
          setIsExpanded(false);

          // Size animation only
          Animated.timing(animatedSize, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start();
        } else if (value <= 10 && !isExpanded) {
          setIsExpanded(true);

          // Size animation only
          Animated.timing(animatedSize, {
            toValue: 45,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
      }
    );

    // Clean up listener
    return () => props.scrollY.removeListener(listenerId);
  }, [props.scrollY, animatedSize, isExpanded]);

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      className={`items-center pb-2 mx-8 border-b-2 ${props.active ? "border-black dark:border-white" : "border-transparent"}`}
      onPress={() => router.push(props.href)}
    >
      <Animated.View
        style={{
          width: animatedSize,
          height: animatedSize,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          className="w-full h-full"
          resizeMode="contain"
          source={props.icon}
        />
      </Animated.View>
      <ThemedText
        className={`text-xs mt-2 ${props.active ? "font-bold" : "font-normal text-gray-500 dark:text-gray-400"}`}
      >
        {props.label}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default HomeTabs;
