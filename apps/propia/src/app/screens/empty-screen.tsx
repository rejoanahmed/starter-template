import useThemeColors from "@propia/app/contexts/ThemeColors";

import Header from "@propia/components/Header";
import ThemedFooter from "@propia/components/ThemeFooter";
import ThemedScroller from "@propia/components/ThemeScroller";

const EmptyScreen = () => {
  const _colors = useThemeColors();

  return (
    <>
      <Header showBackButton title=" " />
      <ThemedScroller
        className="flex-1 pt-8"
        keyboardShouldPersistTaps="handled"
      />
      <ThemedFooter />
    </>
  );
};

export default EmptyScreen;
