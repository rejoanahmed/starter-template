import { Button } from "@propia/components/Button";
import Header from "@propia/components/Header";
import Divider from "@propia/components/layout/Divider";
import ThemedText from "@propia/components/ThemedText";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddPropertyStart() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Header showBackButton />
      <View className=" flex-1 px-6  flex justify-start h-full bg-light-primary dark:bg-dark-primary">
        <View className="pb-6 mt-4">
          <ThemedText className="text-4xl font-semibold mb-8">
            It's easy to get started on Propia
          </ThemedText>
        </View>

        <IntroStep
          description="Share your property with the world."
          image={require("@propia/assets/img/bed.png")}
          number="1"
          title="Add your property"
        />
        <Divider className="my-4" />
        <IntroStep
          description="Add photos, a description, and amenities to make your property stand out."
          image={require("@propia/assets/img/sofa.png")}
          number="2"
          title="Make it stand out"
        />
        <Divider className="my-4" />
        <IntroStep
          description="Choose price, availability, and publish your property."
          image={require("@propia/assets/img/door.png")}
          number="3"
          title="Finish up and publish"
        />

        <View
          className=" pb-2 mt-auto"
          style={{ paddingBottom: insets.bottom }}
        >
          <Button
            className="bg-highlight"
            href="/screens/add-property"
            rounded="full"
            size="large"
            textClassName="text-white"
            title="Let's go"
          />
        </View>
      </View>
    </>
  );
}

const IntroStep = (props: {
  number: string;
  title: string;
  description: string;
  image: any;
}) => {
  return (
    <View className="flex-row items-start py-4">
      <ThemedText className="text-lg font-semibold mr-4">
        {props.number}
      </ThemedText>
      <View className="flex-1 mr-6">
        <ThemedText className="text-lg font-semibold">{props.title}</ThemedText>
        <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
          {props.description}
        </ThemedText>
      </View>
      <Image className="w-16 h-16 ml-auto" source={props.image} />
    </View>
  );
};
