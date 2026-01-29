import { Button } from "@native/components/Button";
import Icon, { type IconName } from "@native/components/Icon";
import ThemedText from "@native/components/ThemedText";
import { type StyleProp, View, type ViewStyle } from "react-native";

type PlaceholderProps = {
  title: string;
  subtitle?: string;
  button?: string;
  href?: string;
  icon?: IconName;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function Placeholder({
  title,
  subtitle,
  button,
  href,
  icon = "Inbox",
  className = "",
  style,
}: PlaceholderProps) {
  return (
    <View
      className={` items-center justify-center p-4 ${className}`}
      style={style}
    >
      <View className="w-20 h-20 bg-secondary border border-secondary rounded-full items-center justify-center mb-4">
        <Icon name={icon} size={30} />
      </View>

      <ThemedText className="text-xl font-bold text-center">{title}</ThemedText>

      {subtitle && (
        <ThemedText className=" text-center mb-4">{subtitle}</ThemedText>
      )}

      {button && href && (
        <Button
          className="mt-4"
          href={href}
          rounded="full"
          title={button}
          variant="outline"
        />
      )}
    </View>
  );
}
