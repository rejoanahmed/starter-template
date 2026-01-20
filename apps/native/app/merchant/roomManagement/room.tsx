// components/pages/merchant/rooms/ManageRoomsScreen.tsx

import { Colors } from "@app/constants/Colors";
import {
  type Room,
  useDeleteRoom,
  useMerchantRooms,
  useUpdateRoomStatus,
} from "@app/services/merchant/rooms";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageRoomsScreen() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  const {
    data: rooms,
    isLoading,
    error: queryError,
    refetch,
    isRefetching,
  } = useMerchantRooms();

  const updateStatusMutation = useUpdateRoomStatus();
  const deleteRoomMutation = useDeleteRoom();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const onToggle = useCallback(
    (id: string) => {
      if (!rooms) {
        return;
      }
      const room = rooms.find((r) => r.id === id);
      if (!room) {
        return;
      }

      const newStatus =
        room.status === "active"
          ? "inactive"
          : room.status === "inactive"
            ? "active"
            : "active";

      updateStatusMutation.mutate(
        { roomId: id, status: newStatus },
        {
          onError: (err) => {
            console.error("Failed to toggle room status:", err);
            Alert.alert(
              "Error",
              err instanceof Error
                ? err.message
                : "Failed to update room status"
            );
          },
        }
      );
    },
    [rooms, updateStatusMutation]
  );

  const onDelete = useCallback(
    (id: string, title: string) => {
      Alert.alert(
        "Delete Room",
        `Are you sure you want to delete "${title}"? This action cannot be undone.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteRoomMutation.mutate(id, {
                onError: (err) => {
                  console.error("Failed to delete room:", err);
                  const errorMsg =
                    err instanceof Error
                      ? err.message
                      : "Failed to delete room. It may have active bookings.";
                  Alert.alert("Error", errorMsg);
                },
              });
            },
          },
        ]
      );
    },
    [deleteRoomMutation]
  );

  const getCoverPhoto = (room: Room) => {
    if (!(room.photos && Array.isArray(room.photos))) {
      return null;
    }
    const photos = room.photos;
    const cover = photos.find((p) => p.isCover);
    return cover?.url || photos[0]?.url || null;
  };

  const renderItem = ({ item }: { item: Room }) => {
    const coverPhoto = getCoverPhoto(item);
    const isActive = item.status === "active";

    return (
      <View
        className="flex-row rounded-2xl border p-3"
        style={{
          backgroundColor: palette.surface,
          borderColor: palette.border,
        }}
      >
        {coverPhoto ? (
          <Image
            className="mr-3 h-[90px] w-[120px] rounded-xl"
            source={{ uri: coverPhoto }}
          />
        ) : (
          <View
            className="mr-3 h-[90px] w-[120px] items-center justify-center rounded-xl"
            style={{ backgroundColor: palette.border }}
          >
            <MaterialIcons color={palette.icon} name="image" size={32} />
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="flex-1 font-extrabold text-lg"
              numberOfLines={1}
              style={{ color: palette.text }}
            >
              {item.title}
            </Text>
            <View
              className="rounded-full px-2 py-1"
              style={{
                backgroundColor:
                  item.status === "draft"
                    ? "#FFF3E0"
                    : isActive
                      ? "#E8F5E9"
                      : "#FFEBEE",
              }}
            >
              <Text
                className="font-semibold text-xs"
                style={{
                  color:
                    item.status === "draft"
                      ? "#F57C00"
                      : isActive
                        ? "#2E7D32"
                        : "#C62828",
                }}
              >
                {item.status?.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text
            className="mt-1 text-[13px] leading-5"
            numberOfLines={2}
            style={{ color: palette.icon }}
          >
            {item.address}, {item.district}
          </Text>
          <Text className="mt-1 text-[13px]" style={{ color: palette.icon }}>
            {item.maxGuests} People
          </Text>

          <View className="mt-2 flex-row gap-6">
            <Pressable
              className="active:opacity-60"
              onPress={() => {
                router.push(`/merchant/roomManagement/editRoom/${item.id}`);
              }}
            >
              <Text
                className="font-semibold text-[15px]"
                style={{ color: palette.tint }}
              >
                Edit
              </Text>
            </Pressable>

            <Pressable
              className="active:opacity-60"
              onPress={() => onToggle(item.id)}
            >
              <Text
                className="font-semibold text-[15px]"
                style={{ color: isActive ? palette.tint : palette.icon }}
              >
                {isActive ? "Disable" : "Enable"}
              </Text>
            </Pressable>

            <Pressable
              className="active:opacity-60"
              onPress={() => onDelete(item.id, item.title)}
            >
              <Text className="font-semibold text-[15px] text-red-600">
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center border-b px-4 pt-1 pb-2"
        style={{ borderColor: palette.border }}
      >
        <Pressable
          className="pr-2 active:opacity-60"
          hitSlop={8}
          onPress={() => router.push("/(tabs)/history")}
        >
          <Ionicons color={palette.text} name="chevron-back" size={26} />
        </Pressable>
        <Text
          className="font-extrabold text-2xl"
          style={{ color: palette.text }}
        >
          Manage Room
        </Text>
      </View>

      {/* Add button */}
      <Pressable
        className="mx-4 mt-4 flex-row items-center gap-2 rounded-xl border px-3 py-2 active:opacity-90"
        onPress={() =>
          router.push("/merchant/roomManagement/newRoom/addNewRoom")
        }
        style={{
          backgroundColor: palette.primaryButton,
          borderColor: palette.border,
        }}
      >
        <MaterialIcons color="#fff" name="home-work" size={18} />
        <Text className="font-semibold text-base text-white">Add new room</Text>
      </Pressable>

      {/* Loading State */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={palette.tint} size="large" />
          <Text className="mt-2" style={{ color: palette.icon }}>
            Loading rooms...
          </Text>
        </View>
      )}

      {/* Error State */}
      {!isLoading && queryError && (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons color={palette.icon} name="error-outline" size={48} />
          <Text className="mt-2 text-center" style={{ color: palette.text }}>
            {queryError instanceof Error
              ? queryError.message
              : "Failed to load rooms"}
          </Text>
          <Pressable
            className="mt-4 rounded-full px-6 py-3"
            onPress={() => refetch()}
            style={{ backgroundColor: palette.primaryButton }}
          >
            <Text className="font-semibold text-white">Try Again</Text>
          </Pressable>
        </View>
      )}

      {/* List */}
      {isLoading || queryError ? null : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          data={rooms}
          ItemSeparatorComponent={() => <View className="h-4" />}
          keyExtractor={(i) => i.id}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <MaterialIcons color={palette.icon} name="home-work" size={64} />
              <Text
                className="mt-4 font-semibold text-lg"
                style={{ color: palette.text }}
              >
                No rooms yet
              </Text>
              <Text
                className="mt-2 text-center"
                style={{ color: palette.icon }}
              >
                Add your first room to get started
              </Text>
            </View>
          }
          ListHeaderComponent={<View className="h-3" />}
          refreshControl={
            <RefreshControl
              onRefresh={onRefresh}
              refreshing={isRefetching}
              tintColor={palette.tint}
            />
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
