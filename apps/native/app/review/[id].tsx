// app/reviews/[id].tsx

import ReviewsView, {
  type ReviewItem,
} from "@app/components/pages/history/ViewReviewScreen";
import { useRoomReviews } from "@app/services/client/reviews";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReviewsScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data, isLoading } = useRoomReviews(id || "", !!id);

  const items: ReviewItem[] = useMemo(() => {
    if (!data?.reviews) return [];
    return data.reviews.map((review) => ({
      id: review.id,
      name: review.user?.name || "Anonymous",
      date: new Date(review.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      rating: review.rating,
      comment: review.comment,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: dark ? "#0B0F13" : "#FFFFFF" }}
      >
        <ReviewsView
          onBack={() => router.back()}
          overallRating={0}
          reviews={[]}
          title="Reviews"
          totalReviews={0}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: dark ? "#0B0F13" : "#FFFFFF" }}
    >
      <ReviewsView
        onBack={() => router.back()}
        overallRating={data?.averageRating || 0}
        reviews={items}
        title="Reviews"
        totalReviews={data?.totalReviews || 0}
      />
    </SafeAreaView>
  );
}
