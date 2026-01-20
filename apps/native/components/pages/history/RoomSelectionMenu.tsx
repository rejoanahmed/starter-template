import { Button, ButtonIcon } from "@app/components/ui/button";
import { HStack } from "@app/components/ui/hstack";
import { Icon } from "@app/components/ui/icon";
import { Menu, MenuItem, MenuItemLabel } from "@app/components/ui/menu";
import { Text } from "@app/components/ui/text";
import Colors from "@app/constants/Colors";
import { useMerchantRooms } from "@app/services/merchant/rooms";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";

type RoomSelectionMenuProps = {
  selectedRoomId?: string;
  onRoomSelect?: (roomId: string | null) => void;
};

export function RoomSelectionMenu({
  selectedRoomId,
  onRoomSelect,
}: RoomSelectionMenuProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const p = Colors[isDark ? "dark" : "light"];

  const { data: rooms, isLoading } = useMerchantRooms();
  const selectedRoom = rooms?.find((r) => r.id === selectedRoomId);
  console.log("selected", selectedRoom);
  return (
    <Menu
      className="rounded-xl"
      offset={5}
      // If your Menu supports styling via className/style, keep the menu sheet readable in both themes
      placement="bottom right"
      style={{
        backgroundColor: p.surface2,
        borderColor: p.border,
        borderWidth: 1,
      }}
      trigger={(triggerProps) => (
        <Button
          {...triggerProps}
          className="px-0"
          size="sm"
          style={{ gap: 4 }}
          variant="link"
        >
          <HStack className="items-center" space="xs">
            {selectedRoom && (
              <Text className="mr-1" size="sm" style={{ color: p.text }}>
                {selectedRoom.title}
              </Text>
            )}
            <ButtonIcon
              as={() => <MaterialIcons color={p.icon} name="home" size={20} />}
            />
            <ButtonIcon
              as={() => (
                <MaterialIcons
                  color={p.icon}
                  name="keyboard-arrow-down"
                  size={18}
                />
              )}
            />
          </HStack>
        </Button>
      )}
    >
      {/* All rooms */}
      <MenuItem
        key="all"
        onPress={() => onRoomSelect?.(null)}
        style={{ backgroundColor: "transparent" }}
        textValue="All Rooms"
      >
        <HStack className="items-center" space="sm">
          {selectedRoomId === null ? (
            <Icon
              as={() => <MaterialIcons color={p.tint} name="check" size={18} />}
            />
          ) : (
            <Icon
              as={() => (
                <MaterialIcons color="transparent" name="check" size={18} />
              )}
            />
          )}
          <MenuItemLabel size="sm" style={{ color: p.text }}>
            All Rooms
          </MenuItemLabel>
        </HStack>
      </MenuItem>

      {/* Loading */}
      {isLoading && (
        <MenuItem key="loading" textValue="Loading...">
          <MenuItemLabel size="sm" style={{ color: p.muted }}>
            Loading...
          </MenuItemLabel>
        </MenuItem>
      )}

      {/* Empty state */}
      {!isLoading && (!rooms || rooms.length === 0) && (
        <MenuItem key="empty" textValue="No rooms">
          <MenuItemLabel size="sm" style={{ color: p.muted }}>
            No rooms found
          </MenuItemLabel>
        </MenuItem>
      )}

      {/* Rooms */}
      {rooms?.map((room) => {
        const isSelected = selectedRoomId === room.id;
        return (
          <MenuItem
            key={room.id}
            onPress={() => onRoomSelect?.(room.id)}
            textValue={room.title}
          >
            <HStack className="items-center" space="sm">
              {isSelected ? (
                <Icon
                  as={() => (
                    <MaterialIcons color={p.tint} name="check" size={18} />
                  )}
                />
              ) : (
                <Icon
                  as={() => (
                    <MaterialIcons color="transparent" name="check" size={18} />
                  )}
                />
              )}
              <MenuItemLabel
                size="sm"
                style={{ color: isSelected ? p.text : p.text }}
              >
                {room.title}
              </MenuItemLabel>
            </HStack>
          </MenuItem>
        );
      })}

      {/* Divider (optional, if your Menu supports it) */}
      {/* <MenuSeparator /> */}

      {/* Add new room */}
      <MenuItem
        key="add-new"
        onPress={() =>
          router.push("/merchant/roomManagement/newRoom/addNewRoom")
        }
        textValue="Add new room"
      >
        <HStack className="items-center" space="sm">
          <Icon
            as={() => <MaterialIcons color={p.tint} name="add" size={20} />}
          />
          <MenuItemLabel size="sm" style={{ color: p.text }}>
            Add new room
          </MenuItemLabel>
        </HStack>
      </MenuItem>
    </Menu>
  );
}
