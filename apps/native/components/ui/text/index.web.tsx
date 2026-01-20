import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import type React from "react";
import { textStyle } from "./styles";

type ITextProps = React.ComponentProps<"span"> & VariantProps<typeof textStyle>;

const Text = function Text({
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
}: { className?: string } & ITextProps) {
  return (
    <span
      className={textStyle({
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
      {...props}
      ref={ref}
    />
  );
};

Text.displayName = "Text";

export { Text };
