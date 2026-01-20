import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import type React from "react";
import { memo } from "react";
import { Text } from "react-native";
import { headingStyle } from "./styles";

type IHeadingProps = VariantProps<typeof headingStyle> &
  React.ComponentPropsWithoutRef<typeof Text> & {
    as?: React.ComponentType<React.ComponentPropsWithoutRef<typeof Text>>;
    children?: React.ReactNode;
  };

const Heading = memo(function Heading({
  className,
  size = "lg",
  as: AsComp,
  isTruncated,
  bold,
  underline,
  strikeThrough,
  sub,
  italic,
  highlight,
  ...props
}: IHeadingProps) {
  const Component = AsComp || Text;

  return (
    <Component
      className={headingStyle({
        size,
        isTruncated: isTruncated as boolean,
        bold: bold as boolean,
        underline: underline as boolean,
        strikeThrough: strikeThrough as boolean,
        sub: sub as boolean,
        italic: italic as boolean,
        highlight: highlight as boolean,
        class: className,
      })}
      {...props}
    />
  );
});

Heading.displayName = "Heading";

export { Heading };
