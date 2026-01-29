import { Button } from "@native/components/Button";
import Header from "@native/components/Header";
import ThemedText from "@native/components/ThemedText";
import ThemedFooter from "@native/components/ThemeFooter";
import ThemedScroller from "@native/components/ThemeScroller";
import { Image, View } from "react-native";

export default function LinkScreen() {
  return (
    <>
      <Header showBackButton />
      <ThemedScroller className="flex-1">
        <ThemedText className="text-4xl font-bold text-center mt-4">
          Share link or QR code
        </ThemedText>
        <ThemedText className="text-base text-center">
          Request a payment from someone
        </ThemedText>
        <View className="w-full flex-1 flex-row items-center justify-center">
          <Image
            className="w-52 h-52 rounded-2xl mt-8"
            source={require("@native/assets/img/qr.png")}
          />
        </View>
      </ThemedScroller>
      <ThemedFooter className="flex-row gap-2">
        <Button
          className="flex-1"
          rounded="full"
          size="large"
          title="Copy link"
          variant="outline"
        />
        <Button
          className="flex-1 !bg-highlight"
          rounded="full"
          size="large"
          textClassName="!text-black"
          title="Share QR code"
        />
      </ThemedFooter>
    </>
  );
}
