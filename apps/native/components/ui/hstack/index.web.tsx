import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import type React from "react";
import { hstackStyle } from "./styles";

type IHStackProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof hstackStyle>;

const HStack = function HStack({
  className,
  space,
  reversed,
  ref,
  ...props
}: IHStackProps & { ref?: React.RefObject<React.ComponentRef<"div"> | null> }) {
  return (
    <div
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
