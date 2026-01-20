import { Button, ButtonIcon } from "@app/components/ui/button";
import { Menu, MenuItem, MenuItemLabel } from "@app/components/ui/menu";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type FilterMenuProps = {
  filterOptions: {
    waiting: boolean;
    oneWeek: boolean;
    oneMonth: boolean;
  };
  onToggleFilter: (key: "waiting" | "oneWeek" | "oneMonth") => void;
};

export function FilterMenu({ filterOptions, onToggleFilter }: FilterMenuProps) {
  return (
    <Menu
      offset={5}
      placement="bottom left"
      trigger={(triggerProps) => (
        <Button {...triggerProps} className="px-0" size="sm" variant="link">
          <ButtonIcon
            as={() => <MaterialIcons color="#666" name="menu" size={24} />}
          />
        </Button>
      )}
    >
      <MenuItem
        key="waiting"
        onPress={() => onToggleFilter("waiting")}
        textValue="Waiting for check-in/confirmation"
      >
        <MenuItemLabel size="sm">
          {filterOptions.waiting ? "✓ " : "  "}
          Waiting for check-in/confirmation
        </MenuItemLabel>
      </MenuItem>

      <MenuItem
        key="oneWeek"
        onPress={() => onToggleFilter("oneWeek")}
        textValue="All bookings in one week"
      >
        <MenuItemLabel size="sm">
          {filterOptions.oneWeek ? "✓ " : "  "}
          All bookings in one week
        </MenuItemLabel>
      </MenuItem>

      <MenuItem
        key="oneMonth"
        onPress={() => onToggleFilter("oneMonth")}
        textValue="All bookings in one month"
      >
        <MenuItemLabel size="sm">
          {filterOptions.oneMonth ? "✓ " : "  "}
          All bookings in one month
        </MenuItemLabel>
      </MenuItem>
    </Menu>
  );
}
