import { HStack } from "@app/components/ui/hstack";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
} from "@app/components/ui/modal";
import { Text } from "@app/components/ui/text";
import { VStack } from "@app/components/ui/vstack";
import type { TimeSelection } from "@app/services/merchant/schedule";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

type TimeBlockingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  timeSelection: TimeSelection | null;
  onConfirm: (cleaningDuration: number) => void;
};

export function TimeBlockingModal({
  isOpen,
  onClose,
  timeSelection,
  onConfirm,
}: TimeBlockingModalProps) {
  const { colorScheme } = useColorScheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [guestCount, setGuestCount] = useState("6");
  const [cleaningDuration, setCleaningDuration] = useState(60); // Default 60 minutes

  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#999" : "#666";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const placeholderColor = isDark ? "#6b7280" : "#9ca3af";

  const cleaningOptions = [30, 60, 90, 120]; // 30min, 60min, 90min, 120min

  const handleSave = () => {
    // You can add validation here
    onConfirm(cleaningDuration);
    // Reset form
    setTitle("");
    setDescription("");
    setGuestCount("6");
    setCleaningDuration(60);
  };

  if (!timeSelection) {
    return null;
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours, 10);
    const ampm = hour >= 12 ? "pm" : "am";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return `${date.getDate()}/${date.getMonth() + 1}, ${dayNames[date.getDay()]}`;
  };

  return (
    <Modal className="bg-slate-500" isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="max-w-lg">
        <ModalBody className="p-0">
          <VStack className="p-4" space="md">
            {/* Header with Cancel and Save */}
            <HStack className="mb-2 items-center justify-between">
              <TouchableOpacity onPress={onClose}>
                <Text className="text-base text-primary-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text className="font-semibold text-base text-primary-500">
                  Save
                </Text>
              </TouchableOpacity>
            </HStack>

            {/* Title Input */}
            <TextInput
              className="border-outline-200 border-b pb-2 font-medium text-xl"
              onChangeText={setTitle}
              placeholder="Add title"
              placeholderTextColor={placeholderColor}
              style={{ color: textColor }}
              value={title}
            />

            {/* Description Input */}
            <TextInput
              className="border-outline-200 border-b pb-2 text-base"
              multiline
              onChangeText={setDescription}
              placeholder="Add description"
              placeholderTextColor={placeholderColor}
              style={{ color: textColor }}
              value={description}
            />

            {/* Guest Count */}
            <HStack
              className="items-center border-outline-200 border-b py-3"
              space="md"
            >
              <MaterialIcons color={iconColor} name="people" size={24} />
              <TextInput
                className="flex-1 text-base"
                keyboardType="numeric"
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9]/g, "");
                  setGuestCount(num);
                }}
                placeholder="6 ppl"
                placeholderTextColor={placeholderColor}
                style={{ color: textColor }}
                value={`${guestCount} ppl`}
              />
            </HStack>

            {/* Date and Time */}
            <HStack
              className="items-center border-outline-200 border-b py-3"
              space="md"
            >
              <MaterialIcons color={iconColor} name="schedule" size={24} />
              <VStack className="flex-1">
                <Text className="text-base" style={{ color: textColor }}>
                  {formatDate(timeSelection.date)}
                </Text>
                <Text className="text-base" style={{ color: textColor }}>
                  {formatTime(timeSelection.startTime)} —{" "}
                  {formatTime(timeSelection.endTime)}
                </Text>
              </VStack>
            </HStack>

            {/* Cleaning Duration Dropdown */}
            <HStack
              className="items-center border-outline-200 border-b py-3"
              space="md"
            >
              <MaterialIcons
                color={iconColor}
                name="cleaning-services"
                size={24}
              />
              <View className="flex-1 flex-row items-center justify-between">
                <Text className="text-base" style={{ color: textColor }}>
                  {cleaningDuration} mins
                </Text>
                <TouchableOpacity>
                  <MaterialIcons
                    color={iconColor}
                    name="keyboard-arrow-down"
                    size={20}
                  />
                </TouchableOpacity>
              </View>
            </HStack>

            {/* Cleaning Duration Options (shown when dropdown clicked) */}
            <View className="flex-row flex-wrap gap-2">
              {cleaningOptions.map((duration) => (
                <TouchableOpacity
                  className={`rounded-lg border px-4 py-2 ${
                    cleaningDuration === duration
                      ? "border-primary-500 bg-primary-500"
                      : "border-outline-200 bg-background-0"
                  }`}
                  key={duration}
                  onPress={() => setCleaningDuration(duration)}
                >
                  <Text
                    className={
                      cleaningDuration === duration
                        ? "text-white"
                        : "text-typography-700"
                    }
                  >
                    {duration} mins
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
