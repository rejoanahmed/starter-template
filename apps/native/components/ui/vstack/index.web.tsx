import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import type React from "react";

import { vstackStyle } from "./styles";

type IVStackProps = React.ComponentProps<"div"> &
  VariantProps<typeof vstackStyle>;

const VStack = function VStack({
  className,
  space,
  reversed,
  ref,
  ...props
}: IVStackProps & { ref?: React.RefObject<React.ComponentRef<"div"> | null> }) {
  return (
    <div
      className={vstackStyle({
        space,
        reversed: reversed as boolean,
        class: className,
      })}
      {...props}
      ref={ref}
    />
  );
};

VStack.displayName = "VStack";

export { VStack };
