import React from "react";
import { Text, TextProps } from "react-native";

interface HuiTextProps extends TextProps {
  children: React.ReactNode;
  className?: string;
}

export const HuiText: React.FC<HuiTextProps> = ({
  children,
  className = "",
  style,
  ...props
}) => {
  // Add text-foreground as default if no text color class is present
  const hasTextColorClass =
    /\btext-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|black|white|foreground|background|primary|secondary|muted|accent|destructive|card|popover|border|input|ring)\b/.test(
      className
    );
  const defaultColorClass = hasTextColorClass ? "" : "text-foreground";
  const combinedClassName = [defaultColorClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Text className={combinedClassName} style={style} {...props}>
      {children}
    </Text>
  );
};

export default HuiText;
