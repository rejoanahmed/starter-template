import FontAwesome from "@expo/vector-icons/FontAwesome";
import useThemeColors from "@propia/app/contexts/ThemeColors";
import { Button } from "@propia/components/Button";
import Input from "@propia/components/forms/Input";
import Header from "@propia/components/Header";
import ThemedText from "@propia/components/ThemedText";
import ThemedFooter from "@propia/components/ThemeFooter";
import ThemedScroller from "@propia/components/ThemeScroller";
import { router } from "expo-router";
import { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";

// type ReviewScreenProps = {
//   product: {
//     id: number;
//     name: string;
//     price: number;
//     image: string;
//   };
// };

const StarRating = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (rating: number) => void;
}) => {
  const colors = useThemeColors();

  const handlePress = (starIndex: number) => {
    const newRating = starIndex + 1;
    setRating(newRating === rating ? 0 : newRating);
  };

  return (
    <View className="flex-row justify-center my-6">
      {[0, 1, 2, 3, 4].map((starIndex) => (
        <TouchableOpacity
          className="w-10 h-10 justify-center items-center"
          key={starIndex}
          onPress={() => handlePress(starIndex)}
        >
          <FontAwesome
            color={rating > starIndex ? colors.icon : colors.text}
            name={rating > starIndex ? "star" : "star-o"}
            size={30}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ReviewScreen = () => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const _colors = useThemeColors();

  // Mock product data (replace with actual data)
  const product = {
    id: 1,
    name: "Luxury Beachfront Villa",
    date: "12 - 16 July, 2025",
    image: require("@propia/assets/img/room-1.avif"),
  };

  const handleSubmit = () => {
    // Implement review submission logic
    console.log({ rating, review });
    router.back();
  };

  return (
    <>
      <Header showBackButton title="Write a Review" />
      <ThemedScroller
        className="flex-1 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Product Information */}
        <View className="flex-col items-center mb-0">
          <Image
            className="w-32 h-32 rounded-lg bg-light-secondary dark:bg-dark-secondary"
            source={product.image}
          />
          <View className="flex-1 items-center justify-center">
            <ThemedText className="font-bold mt-global text-base">
              {product.name}
            </ThemedText>
            <ThemedText className="text-light-subtext dark:text-dark-subtext">
              {product.date}
            </ThemedText>
          </View>
        </View>

        {/* Star Rating */}
        <StarRating rating={rating} setRating={setRating} />

        {/* Review Input */}
        <Input
          isMultiline
          label="Write your review"
          onChangeText={setReview}
          style={{
            textAlignVertical: "top",
            height: 120,
          }}
          value={review}
        />
      </ThemedScroller>
      <ThemedFooter>
        <Button
          disabled={rating === 0 || !review.trim()}
          onPress={handleSubmit}
          title="Submit Review"
        />
      </ThemedFooter>
    </>
  );
};

export default ReviewScreen;
