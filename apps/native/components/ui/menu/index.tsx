"use client";
import { createMenu } from "@gluestack-ui/core/menu/creator";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import {
  AnimatePresence,
  Motion,
  type MotionComponentProps,
} from "@legendapp/motion";
import { cssInterop } from "nativewind";
import type React from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";

type IMotionViewProps = React.ComponentProps<typeof View> &
  // @ts-expect-error
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>;

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>;

const menuStyle = tva({
  base: "rounded-md bg-background-0 border border-outline-100 p-1 shadow-hard-5",
});

const menuItemStyle = tva({
  base: "min-w-[200px] p-3 flex-row items-center rounded data-[hover=true]:bg-background-50 data-[active=true]:bg-background-100 data-[focus=true]:bg-background-50 data-[focus=true]:web:outline-none data-[focus=true]:web:outline-0 data-[disabled=true]:opacity-40 data-[disabled=true]:web:cursor-not-allowed data-[focus-visible=true]:web:outline-2 data-[focus-visible=true]:web:outline-primary-700 data-[focus-visible=true]:web:outline data-[focus-visible=true]:web:cursor-pointer data-[disabled=true]:data-[focus=true]:bg-transparent",
});

const menuBackdropStyle = tva({
  base: "absolute top-0 bottom-0 left-0 right-0 web:cursor-default",
  // add this classnames if you want to give background color to backdrop
  // opacity-50 bg-background-500,
});

const menuSeparatorStyle = tva({
  base: "bg-background-200 h-px w-full",
});

const menuItemLabelStyle = tva({
  base: "text-typography-700 font-normal font-body",

  variants: {
    isTruncated: {
      true: "web:truncate",
    },
    bold: {
      true: "font-bold",
    },
    underline: {
      true: "underline",
    },
    strikeThrough: {
      true: "line-through",
    },
    size: {
      "2xs": "text-2xs",
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
    },
    sub: {
      true: "text-xs",
    },
    italic: {
      true: "italic",
    },
    highlight: {
      true: "bg-yellow-500",
    },
  },
});

const BackdropPressable = function BackdropPressable({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof Pressable> &
  VariantProps<typeof menuBackdropStyle> & {
    ref?: React.RefObject<React.ComponentRef<typeof Pressable> | null>;
  }) {
  return (
    <Pressable
      className={menuBackdropStyle({
        class: className,
      })}
      ref={ref}
      {...props}
    />
  );
};

type IMenuItemProps = VariantProps<typeof menuItemStyle> & {
  className?: string;
} & React.ComponentPropsWithoutRef<typeof Pressable>;

const Item = function Item({
  className,
  ref,
  ...props
}: IMenuItemProps & {
  ref?: React.RefObject<React.ComponentRef<typeof Pressable> | null>;
}) {
  return (
    <Pressable
      className={menuItemStyle({
        class: className,
      })}
      ref={ref}
      {...props}
    />
  );
};

const Separator = function Separator({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof View> &
  VariantProps<typeof menuSeparatorStyle> & {
    ref?: React.RefObject<React.ComponentRef<typeof View> | null>;
  }) {
  return (
    <View
      className={menuSeparatorStyle({ class: className })}
      ref={ref}
      {...props}
    />
  );
};
export const UIMenu = createMenu({
  Root: MotionView,
  Item,
  Label: Text,
  Backdrop: BackdropPressable,
  AnimatePresence,
  Separator,
});

cssInterop(MotionView as any, { className: "style" });

type IMenuProps = React.ComponentProps<typeof UIMenu> &
  VariantProps<typeof menuStyle> & { className?: string };
type IMenuItemLabelProps = React.ComponentProps<typeof UIMenu.ItemLabel> &
  VariantProps<typeof menuItemLabelStyle> & { className?: string };

const Menu = function Menu({
  className,
  ref,
  ...props
}: IMenuProps & {
  ref?: React.RefObject<React.ComponentRef<typeof UIMenu> | null>;
}) {
  return (
    <UIMenu
      animate={{
        opacity: 1,
        scale: 1,
      }}
      className={menuStyle({
        class: className,
      })}
      exit={{
        opacity: 0,
        scale: 0.8,
      }}
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      ref={ref}
      transition={{
        type: "timing",
        duration: 100,
      }}
      {...props}
    />
  );
};

const MenuItem = UIMenu.Item;

const MenuItemLabel = function MenuItemLabel({
  className,
  isTruncated,
  bold,
  underline,
  strikeThrough,
  size = "md",
  sub,
  italic,
  highlight,
  ref,
  ...props
}: IMenuItemLabelProps & {
  ref?: React.RefObject<React.ComponentRef<typeof UIMenu.ItemLabel> | null>;
}) {
  return (
    <UIMenu.ItemLabel
      className={menuItemLabelStyle({
        isTruncated: isTruncated as boolean,
        bold: bold as boolean,
        underline: underline as boolean,
        strikeThrough: strikeThrough as boolean,
        size,
        sub: sub as boolean,
        italic: italic as boolean,
        highlight: highlight as boolean,
        class: className,
      })}
      ref={ref}
      {...props}
    />
  );
};

const MenuSeparator = UIMenu.Separator;

Menu.displayName = "Menu";
MenuItem.displayName = "MenuItem";
MenuItemLabel.displayName = "MenuItemLabel";
MenuSeparator.displayName = "MenuSeparator";
export { Menu, MenuItem, MenuItemLabel, MenuSeparator };
