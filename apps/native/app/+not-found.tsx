import { ThemedText } from "@app/components/ThemedText";
import { ThemedView } from "@app/components/ThemedView";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView className="flex-1 items-center justify-center p-5">
        <ThemedText type="title">This screen doesn't exist.</ThemedText>
        <Link className="mt-4 py-4" href="/">
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}
