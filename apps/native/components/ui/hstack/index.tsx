import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import type React from "react";
import type { ViewProps } from "react-native";
import { View } from "react-native";
import { hstackStyle } from "./styles";

type IHStackProps = ViewProps & VariantProps<typeof hstackStyle>;

const HStack = function HStack({
  className,
  space,
  reversed,
  ref,
  ...props
}: IHStackProps & {
  ref?: React.RefObject<React.ComponentRef<typeof View> | null>;
}) {
  return (
    <View
      className={hstackStyle({
        space,
        reversed: reversed as boolean,
        class: className,
      })}
      {...props}
      ref={ref}
    />
  );
};

HStack.displayName = "HStack";

export { HStack };
