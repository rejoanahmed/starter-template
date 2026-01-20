"use client";
import { createModal } from "@gluestack-ui/core/modal/creator";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import {
  tva,
  useStyleContext,
  withStyleContext,
} from "@gluestack-ui/utils/nativewind-utils";
import {
  AnimatePresence,
  createMotionAnimatedComponent,
  Motion,
  type MotionComponentProps,
} from "@legendapp/motion";
import { cssInterop } from "nativewind";
import type React from "react";
import { Pressable, ScrollView, View, type ViewStyle } from "react-native";

type IAnimatedPressableProps = React.ComponentProps<typeof Pressable> &
  // @ts-expect-error
  MotionComponentProps<typeof Pressable, ViewStyle, unknown, unknown, unknown>;

const AnimatedPressable = createMotionAnimatedComponent(
  // @ts-expect-error
  Pressable
) as React.ComponentType<IAnimatedPressableProps>;
const SCOPE = "MODAL";

type IMotionViewProps = React.ComponentProps<typeof View> &
  // @ts-expect-error
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>;

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>;

const UIModal = createModal({
  // @ts-expect-error
  Root: withStyleContext(View, SCOPE),
  Backdrop: AnimatedPressable,
  Content: MotionView,
  Body: ScrollView,
  CloseButton: Pressable,
  Footer: View,
  Header: View,
  AnimatePresence,
});

// @ts-expect-error
cssInterop(AnimatedPressable, { className: "style" });
// @ts-expect-error
cssInterop(MotionView, { className: "style" });

const modalStyle = tva({
  base: "group/modal w-full h-full justify-center items-center web:pointer-events-none",
  variants: {
    size: {
      xs: "",
      sm: "",
      md: "",
      lg: "",
      full: "",
    },
  },
});

const modalBackdropStyle = tva({
  base: "absolute left-0 top-0 right-0 bottom-0 bg-background-dark web:cursor-default",
});

const modalContentStyle = tva({
  base: "bg-background-0 rounded-md overflow-hidden border border-outline-100 shadow-hard-2 p-6",
  parentVariants: {
    size: {
      xs: "w-[60%] max-w-[360px]",
      sm: "w-[70%] max-w-[420px]",
      md: "w-[80%] max-w-[510px]",
      lg: "w-[90%] max-w-[640px]",
      full: "w-full",
    },
  },
});

const modalBodyStyle = tva({
  base: "mt-2 mb-6",
});

const modalCloseButtonStyle = tva({
  base: "group/modal-close-button z-10 rounded data-[focus-visible=true]:web:bg-background-100 web:outline-0 cursor-pointer",
});

const modalHeaderStyle = tva({
  base: "justify-between items-center flex-row",
});

const modalFooterStyle = tva({
  base: "flex-row justify-end items-center gap-2",
});

type IModalProps = React.ComponentProps<typeof UIModal> &
  VariantProps<typeof modalStyle> & { className?: string };

type IModalBackdropProps = React.ComponentProps<typeof UIModal.Backdrop> &
  VariantProps<typeof modalBackdropStyle> & { className?: string };

type IModalContentProps = React.ComponentProps<typeof UIModal.Content> &
  VariantProps<typeof modalContentStyle> & { className?: string };

type IModalHeaderProps = React.ComponentProps<typeof UIModal.Header> &
  VariantProps<typeof modalHeaderStyle> & { className?: string };

type IModalBodyProps = React.ComponentProps<typeof UIModal.Body> &
  VariantProps<typeof modalBodyStyle> & { className?: string };

type IModalFooterProps = React.ComponentProps<typeof UIModal.Footer> &
  VariantProps<typeof modalFooterStyle> & { className?: string };

type IModalCloseButtonProps = React.ComponentProps<typeof UIModal.CloseButton> &
  VariantProps<typeof modalCloseButtonStyle> & { className?: string };

const Modal = ({
  className,
  size = "md",
  ref,
  ...props
}: IModalProps & {
  ref?: React.RefObject<React.ComponentRef<typeof UIModal> | null>;
}) => (
  <UIModal
    ref={ref}
    {...props}
    className={modalStyle({ size, class: className })}
    context={{ size }}
    pointerEvents="box-none"
  />
);

const ModalBackdrop = function ModalBackdrop({
  className,
  ref,
  ...props
}: IModalBackdropProps & {
  ref?: React.RefObject<React.ComponentRef<typeof UIModal.Backdrop> | null>;
}) {
  return (
    <UIModal.Backdrop
      animate={{
        opacity: 0.5,
      }}
      exit={{
        opacity: 0,
      }}
      initial={{
        opacity: 0,
      }}
      ref={ref}
      transition={{
        type: "spring",
        damping: 18,
        stiffness: 250,
        opacity: {
          type: "timing",
          duration: 250,
        },
      }}
      {...props}
      className={modalBackdropStyle({
        class: className,
      })}
    />
  );
};

const ModalContent = function ModalContent({
  className,
  size,
  ref,
  ...props
}: IModalContentProps & {
  ref?: React.RefObject<React.ComponentRef<typeof UIModal.Content> | null>;
}) {
  const { size: parentSize } = useStyleContext(SCOPE);

  return (
    <UIModal.Content
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
      }}
      initial={{
        opacity: 0,
        scale: 0.9,
      }}
      ref={ref}
      transition={{
        type: "spring",
        damping: 18,
        stiffness: 250,
        opacity: {
          type: "timing",
          duration: 250,
        },
      }}
      {...props}
      className={modalContentStyle({
        parentVariants: {
          size: parentSize,
        },
        size,
        class: className,
      })}
      pointerEvents="auto"
    />
  );
};

const ModalHeader = function ModalHeader({
  className,
  ref,
  ...props
}: IModalHeaderProps & {
  ref?: React.RefObject<React.ComponentRef<typeof UIModal.Header> | null>;
}) {
  return (
    <UIModal.Header
      ref={ref}
      {...props}
      className={modalHeaderStyle({
        class: className,
      })}
    />
  );
};

const ModalBody = function ModalBody({
  className,
  ref,
  ...props
}: IModalBodyProps & {
  ref?: React.RefObject<React.ComponentRef<typeof UIModal.Body> | null>;
}) {
  return (
    <UIModal.Body
      ref={ref}
      {...props}
      className={modalBodyStyle({
        class: className,
      })}
    />
  );
};

const ModalFooter = function ModalFooter({
  className,
  ref,
  ...props
}: IModalFooterProps & {
  ref?: React.RefObject<React.ComponentRef<typeof UIModal.Footer> | null>;
}) {
  return (
    <UIModal.Footer
      ref={ref}
      {...props}
      className={modalFooterStyle({
        class: className,
      })}
    />
  );
};

const ModalCloseButton = function ModalCloseButton({
  className,
  ref,
  ...props
}: IModalCloseButtonProps & {
  ref?: React.RefObject<React.ComponentRef<typeof UIModal.CloseButton> | null>;
}) {
  return (
    <UIModal.CloseButton
      ref={ref}
      {...props}
      className={modalCloseButtonStyle({
        class: className,
      })}
    />
  );
};

Modal.displayName = "Modal";
ModalBackdrop.displayName = "ModalBackdrop";
ModalContent.displayName = "ModalContent";
ModalHeader.displayName = "ModalHeader";
ModalBody.displayName = "ModalBody";
ModalFooter.displayName = "ModalFooter";
ModalCloseButton.displayName = "ModalCloseButton";

export {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
};
