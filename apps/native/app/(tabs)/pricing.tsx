// app/merchant/PricingScreen.tsx

import { ThemedText } from "@app/components/ThemedText";
import { Colors } from "@app/constants/Colors";
import { selectedRoomAtom } from "@app/lib/atoms/merchant";
import {
  type PricingOverride,
  pricingService,
} from "@app/services/merchant/pricing";
import { useMerchantRooms } from "@app/services/merchant/rooms";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useAtom } from "jotai";
import { useColorScheme } from "nativewind";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/* ---------------- Override Row Component ---------------- */
const OverrideRow = memo(function OverrideRow({
  item,
  palette,
  onEdit,
  onDelete,
}: {
  item: PricingOverride;
  palette: typeof Colors.light;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const getOverrideLabel = () => {
    if (item.type === "day") {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const startDay = dayNames[item.startDayOfWeek ?? 0];
      const endDay = dayNames[item.endDayOfWeek ?? 0];
      return `${startDay} ${item.startTime} - ${endDay} ${item.endTime}`;
    }
    const start = item.startDate
      ? new Date(item.startDate).toLocaleDateString()
      : "";
    const end = item.endDate ? new Date(item.endDate).toLocaleDateString() : "";
    return `${start} - ${end}`;
  };

  const getOverrideType = () => {
    return item.type === "day" ? "Recurring (Weekly)" : "Date Range";
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${palette.tint}15`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Ionicons
          color={palette.tint}
          name={item.type === "day" ? "calendar-outline" : "calendar"}
          size={20}
        />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontSize: 15, fontWeight: "600" }}>
          {getOverrideLabel()}
        </ThemedText>
        <ThemedText style={{ fontSize: 13, color: palette.icon, marginTop: 2 }}>
          {getOverrideType()}
          {item.hourlyTiers && ` • ${item.hourlyTiers.length} tier(s)`}
          {item.extraPersonChargePerHour &&
            ` • $${item.extraPersonChargePerHour}/person/hr`}
        </ThemedText>
      </View>

      <Pressable
        onPress={() => onEdit(item.id)}
        style={{ padding: 8, marginRight: 4 }}
      >
        <Ionicons color={palette.tint} name="pencil" size={20} />
      </Pressable>
      <Pressable onPress={() => onDelete(item.id)} style={{ padding: 8 }}>
        <Ionicons color={palette.icon} name="trash-outline" size={20} />
      </Pressable>
    </View>
  );
});

/* ---------------- Screen ---------------- */

export default function PricingScreen() {
  const { colorScheme } = useColorScheme();
  const inset = useSafeAreaInsets();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Room selection
  const [selectedRoomId, setSelectedRoomId] = useAtom(selectedRoomAtom);
  const { data: rooms, isLoading: roomsLoading } = useMerchantRooms();
  const [showRoomSelector, setShowRoomSelector] = useState(false);

  // Overrides data
  const [overrides, setOverrides] = useState<PricingOverride[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get selected room details
  const selectedRoom = useMemo(
    () => rooms?.find((r) => r.id === selectedRoomId),
    [rooms, selectedRoomId]
  );

  // Fetch overrides when room changes
  const fetchOverrides = useCallback(async () => {
    if (!selectedRoomId) {
      setOverrides([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("[Pricing] Fetching overrides for room:", selectedRoomId);
      const response = await pricingService.getPricingOverrides(selectedRoomId);
      console.log("[Pricing] Overrides response:", response);
      setOverrides(response.overrides || []);
    } catch (err) {
      console.error("Failed to fetch overrides:", err);
      setError("Failed to load pricing overrides");
    } finally {
      setLoading(false);
    }
  }, [selectedRoomId]);

  useEffect(() => {
    fetchOverrides();
  }, [fetchOverrides]);

  // Refetch when screen comes into focus (e.g., after saving an override)
  useFocusEffect(
    useCallback(() => {
      fetchOverrides();
    }, [fetchOverrides])
  );

  const handleDelete = async (id: string) => {
    try {
      await pricingService.deletePricingOverride(id);
      setOverrides((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Failed to delete override:", err);
      setError("Failed to delete pricing override");
    }
  };

  const handleEdit = (id: string) => {
    router.push(
      `/merchant/pricing/addOverride?roomId=${selectedRoomId}&overrideId=${id}`
    );
  };

  // Group overrides by type
  const dayOverrides = useMemo(
    () => overrides.filter((o) => o.type === "day"),
    [overrides]
  );

  const dateOverrides = useMemo(
    () => overrides.filter((o) => o.type === "date"),
    [overrides]
  );

  // Get default pricing from room
  const defaultPricing = useMemo(() => {
    if (!selectedRoom) return null;
    return {
      includedGuests: selectedRoom.includedGuests || 1,
      hourlyTiers:
        (selectedRoom.hourlyTiers as Array<{ hours: number; price: number }>) ||
        [],
      extraPersonChargePerHour: selectedRoom.extraPersonChargePerHour || "0",
    };
  }, [selectedRoom]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: inset.top,
          backgroundColor: palette.background,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: palette.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingBottom: 10,
          }}
        >
          <ThemedText type="title">Pricing</ThemedText>
        </View>

        {/* Room Selector */}
        <Pressable
          onPress={() => setShowRoomSelector(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginHorizontal: 16,
            marginBottom: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: palette.border,
            borderRadius: 12,
            backgroundColor: palette.surface,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons color={palette.icon} name="home-outline" size={18} />
            <ThemedText style={{ fontSize: 14 }}>
              {selectedRoom
                ? selectedRoom.title || "Untitled Room"
                : "Select a room"}
            </ThemedText>
          </View>
          <Ionicons color={palette.icon} name="chevron-down" size={18} />
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Math.max(inset.bottom, 24),
        }}
      >
        {selectedRoomId ? (
          loading ? (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <ActivityIndicator color={palette.tint} size="large" />
              <ThemedText style={{ marginTop: 16, color: palette.icon }}>
                Loading pricing...
              </ThemedText>
            </View>
          ) : error ? (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Ionicons color={palette.icon} name="alert-circle" size={64} />
              <ThemedText
                style={{
                  marginTop: 16,
                  fontSize: 16,
                  fontWeight: "600",
                  color: palette.text,
                }}
              >
                {error}
              </ThemedText>
              <Pressable
                onPress={fetchOverrides}
                style={{
                  marginTop: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: palette.tint,
                }}
              >
                <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                  Retry
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Default Pricing Section */}
              {defaultPricing && (
                <View
                  style={{
                    marginBottom: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: palette.border,
                    backgroundColor: palette.surface,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: palette.border,
                    }}
                  >
                    <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                      Default Pricing
                    </ThemedText>
                    <Pressable
                      onPress={() =>
                        router.push(
                          `/merchant/pricing/editDefaultPricing?roomId=${selectedRoomId}`
                        )
                      }
                    >
                      <Ionicons color={palette.tint} name="pencil" size={20} />
                    </Pressable>
                  </View>

                  <View style={{ padding: 16 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <ThemedText style={{ fontSize: 14, color: palette.icon }}>
                        Included guests
                      </ThemedText>
                      <ThemedText style={{ fontSize: 14, fontWeight: "600" }}>
                        {defaultPricing.includedGuests}
                      </ThemedText>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                      <ThemedText
                        style={{
                          fontSize: 14,
                          color: palette.icon,
                          marginBottom: 8,
                        }}
                      >
                        Hourly tiers
                      </ThemedText>
                      {defaultPricing.hourlyTiers.length === 0 ? (
                        <ThemedText
                          style={{
                            fontSize: 13,
                            color: palette.icon,
                            fontStyle: "italic",
                          }}
                        >
                          No tiers configured
                        </ThemedText>
                      ) : (
                        defaultPricing.hourlyTiers.map((tier) => (
                          <View
                            key={`${tier.hours}-${tier.price}`}
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              paddingVertical: 4,
                            }}
                          >
                            <ThemedText style={{ fontSize: 13 }}>
                              {tier.hours} {tier.hours === 1 ? "hour" : "hours"}
                            </ThemedText>
                            <ThemedText
                              style={{ fontSize: 13, fontWeight: "600" }}
                            >
                              ${tier.price}
                            </ThemedText>
                          </View>
                        ))
                      )}
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <ThemedText style={{ fontSize: 14, color: palette.icon }}>
                        Extra person charge
                      </ThemedText>
                      <ThemedText style={{ fontSize: 14, fontWeight: "600" }}>
                        ${defaultPricing.extraPersonChargePerHour}/person/hr
                      </ThemedText>
                    </View>
                  </View>
                </View>
              )}

              {/* Day-based Overrides */}
              <View
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: palette.border,
                  }}
                >
                  <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                    Recurring Pricing (Weekly)
                  </ThemedText>
                  <ThemedText style={{ fontSize: 13, color: palette.icon }}>
                    {dayOverrides.length}
                  </ThemedText>
                </View>

                {dayOverrides.length === 0 ? (
                  <View style={{ padding: 24, alignItems: "center" }}>
                    <Ionicons
                      color={palette.icon}
                      name="calendar-outline"
                      size={40}
                    />
                    <ThemedText
                      style={{
                        marginTop: 12,
                        fontSize: 14,
                        color: palette.icon,
                        textAlign: "center",
                      }}
                    >
                      No recurring pricing configured
                    </ThemedText>
                  </View>
                ) : (
                  dayOverrides.map((override) => (
                    <OverrideRow
                      item={override}
                      key={override.id}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      palette={palette}
                    />
                  ))
                )}
              </View>

              {/* Date-based Overrides */}
              <View
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: palette.border,
                  }}
                >
                  <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                    Special Dates
                  </ThemedText>
                  <ThemedText style={{ fontSize: 13, color: palette.icon }}>
                    {dateOverrides.length}
                  </ThemedText>
                </View>

                {dateOverrides.length === 0 ? (
                  <View style={{ padding: 24, alignItems: "center" }}>
                    <Ionicons color={palette.icon} name="calendar" size={40} />
                    <ThemedText
                      style={{
                        marginTop: 12,
                        fontSize: 14,
                        color: palette.icon,
                        textAlign: "center",
                      }}
                    >
                      No special date pricing configured
                    </ThemedText>
                  </View>
                ) : (
                  dateOverrides.map((override) => (
                    <OverrideRow
                      item={override}
                      key={override.id}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      palette={palette}
                    />
                  ))
                )}
              </View>

              {/* Add Override Button */}
              <Pressable
                onPress={() =>
                  router.push(
                    `/merchant/pricing/addOverride?roomId=${selectedRoomId}`
                  )
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: palette.tint,
                }}
              >
                <Ionicons color="#fff" name="add-circle-outline" size={20} />
                <ThemedText
                  style={{
                    marginLeft: 8,
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#fff",
                  }}
                >
                  Add Special Pricing
                </ThemedText>
              </Pressable>
            </>
          )
        ) : (
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <Ionicons color={palette.icon} name="home-outline" size={64} />
            <ThemedText
              style={{
                marginTop: 16,
                fontSize: 16,
                fontWeight: "600",
                color: palette.text,
              }}
            >
              Select a room
            </ThemedText>
            <ThemedText
              style={{
                marginTop: 8,
                fontSize: 14,
                color: palette.icon,
                textAlign: "center",
              }}
            >
              Choose a room to view and manage its pricing configuration
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Room Selector Modal */}
      <Modal
        animationType="slide"
        onRequestClose={() => setShowRoomSelector(false)}
        transparent
        visible={showRoomSelector}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: palette.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "70%",
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: palette.border,
              }}
            >
              <ThemedText style={{ fontSize: 18, fontWeight: "600" }}>
                Select Room
              </ThemedText>
              <Pressable
                hitSlop={10}
                onPress={() => setShowRoomSelector(false)}
              >
                <Ionicons color={palette.text} name="close" size={24} />
              </Pressable>
            </View>

            {/* Room List */}
            {roomsLoading ? (
              <View style={{ padding: 24, alignItems: "center" }}>
                <ActivityIndicator color={palette.tint} size="large" />
                <ThemedText style={{ marginTop: 12, color: palette.icon }}>
                  Loading rooms...
                </ThemedText>
              </View>
            ) : !rooms || rooms.length === 0 ? (
              <View style={{ padding: 24, alignItems: "center" }}>
                <Ionicons color={palette.icon} name="home-outline" size={48} />
                <ThemedText
                  style={{ marginTop: 12, fontSize: 16, fontWeight: "600" }}
                >
                  No rooms found
                </ThemedText>
                <ThemedText
                  style={{ marginTop: 4, color: palette.icon, fontSize: 14 }}
                >
                  Create a room to get started
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={rooms}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setSelectedRoomId(item.id);
                      setShowRoomSelector(false);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: palette.border,
                      backgroundColor:
                        selectedRoomId === item.id
                          ? `${palette.tint}10`
                          : "transparent",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={{
                          fontSize: 16,
                          fontWeight:
                            selectedRoomId === item.id ? "600" : "400",
                          color:
                            selectedRoomId === item.id
                              ? palette.tint
                              : palette.text,
                        }}
                      >
                        {item.title || "Untitled Room"}
                      </ThemedText>
                      <ThemedText
                        style={{
                          fontSize: 13,
                          color: palette.icon,
                          marginTop: 2,
                        }}
                      >
                        {item.district || item.address || "No location"}
                      </ThemedText>
                    </View>
                    {selectedRoomId === item.id && (
                      <Ionicons
                        color={palette.tint}
                        name="checkmark-circle"
                        size={24}
                      />
                    )}
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
