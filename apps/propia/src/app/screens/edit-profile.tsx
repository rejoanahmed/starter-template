import { Button } from "@propia/components/Button";
import { Chip } from "@propia/components/Chip";
import Expandable from "@propia/components/Expandable";
import Input from "@propia/components/forms/Input";
import Header from "@propia/components/Header";
import Icon from "@propia/components/Icon";
import Section from "@propia/components/layout/Section";
import ThemedScroller from "@propia/components/ThemeScroller";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";

export default function EditProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <>
      <Header
        rightComponents={[
          <Button
            key="save-changes"
            textClassName="text-white"
            title="Save changes"
          />,
        ]}
        showBackButton
      />
      <ThemedScroller>
        <Section
          className="pt-4 pb-10"
          subtitle="Manage your account settings"
          title="Profile Settings"
          titleSize="3xl"
        />

        <View className="items-center flex-col mb-8 mt-6">
          <TouchableOpacity
            activeOpacity={0.9}
            className="relative"
            onPress={pickImage}
          >
            {profileImage ? (
              <Image
                className="w-28 h-28 rounded-full border border-light-primary dark:border-dark-primary"
                source={{ uri: profileImage }}
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-light-secondary dark:bg-dark-secondary items-center justify-center">
                <Icon
                  className="text-light-subtext dark:text-dark-subtext"
                  name="Plus"
                  size={25}
                />
              </View>
            )}
          </TouchableOpacity>
          <View className="mt-4">
            <Button
              onPress={pickImage}
              title={profileImage ? "Change photo" : "Upload photo"}
              variant="outline"
            />

            {profileImage && (
              <Button
                className="mt-2"
                onPress={() => setProfileImage(null)}
                title="Remove photo"
                variant="ghost"
              />
            )}
          </View>
        </View>
        <Expandable
          description="Manage your personal information"
          icon="UserRoundPen"
          title="Personal information"
        >
          <View className="flex-col gap-2">
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="First Name"
              value="John"
            />
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="Last Name"
              value="Doe"
            />
          </View>
        </Expandable>
        <Expandable
          description="Personalize your experience"
          icon="Lightbulb"
          title="Interests"
        >
          <View className="flex-row gap-2 flex-wrap">
            <Chip label="Beach" />
            <Chip label="Mountain" />
            <Chip label="City" />
            <Chip label="Countryside" />
            <Chip label="Lake" />
            <Chip label="Forest" />
            <Chip label="Desert" />
            <Chip label="Snow" />
            <Chip label="Arctic" />
            <Chip label="Tropical" />
            <Chip label="Tundra" />
            <Chip label="Volcanic" />
          </View>
        </Expandable>

        <Expandable
          description="Manage your email"
          icon="Mail"
          title="Email and phone"
        >
          <View className="flex-col gap-2">
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="Email"
              value="john.doe@example.com"
            />
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="Phone"
              value="+1234567890"
            />
          </View>
        </Expandable>

        <Expandable
          description="Manage your password"
          icon="LockIcon"
          title="Password"
        >
          <View className="flex-col gap-2">
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="Current password"
              value="********"
            />
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="New password"
              value="********"
            />
          </View>
        </Expandable>
      </ThemedScroller>
    </>
  );
}
