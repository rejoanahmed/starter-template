/// <reference types="nativewind/types" />

declare module "*.svg" {
  import type React from "react";
  import type { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "*.png" {
  const content: import("react-native").ImageSourcePropType;
  export default content;
}

declare module "*.jpg" {
  const content: import("react-native").ImageSourcePropType;
  export default content;
}
