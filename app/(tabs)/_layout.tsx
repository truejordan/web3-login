// import { Tabs } from "expo-router";
import React from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "heroui-native";
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable } from "react-native";
import { HuiText } from "@/components/hui-text";
import { BlurView } from "expo-blur";

export default function TabLayout() {
  const { colors } = useTheme();
  console.log(colors.foreground);

  const hslToHex = (hsl: string): string => {
    // Extract HSL values from string like "hsl(300 0% 99%)" (no commas)
    const match = hsl.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
    if (!match) return hsl; // Return original if not HSL format

    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };
  const foregroundColor: string = hslToHex(colors.mutedForeground);
  console.log("foregroundColor", foregroundColor);
  const activeColor: string = hslToHex(colors.foreground);
  console.log("foregroundColor", foregroundColor);

  const TabButton = ({
    icon,
    children,
    isFocused,
    ...props
  }: TabTriggerSlotProps & {
    icon: string;
    children?: React.ReactNode;
  }) => (
    <Pressable
      {...props}
      className="flex-col items-center justify-center gap-1 p-2"
      style={{ display: "flex" }}
    >
      <IconSymbol
        size={28}
        name={icon as any}
        color={isFocused ? activeColor : foregroundColor}
      />
      {children && (
        <HuiText
          style={[
            { fontSize: 12 },
            isFocused ? { color: activeColor } : { color: foregroundColor },
          ]}
        >
          {children}
        </HuiText>
      )}
    </Pressable>
  );

  return (
    <Tabs className="flex-1 bg-background">
      <TabSlot />
      <TabList
        asChild
        className="mb-8 px-4 items-center absolute bottom-0 left-0 right-0"
        style={{
          justifyContent: "space-around",
          shadowColor: "black",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <BlurView
          intensity={100}
          className="mx-8 px-8 p-2 bg-neutral-900/40 overflow-hidden rounded-full"
        >
          <TabTrigger name="home" href="/(tabs)" asChild>
            <TabButton icon="house.fill">Home</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/(tabs)/explore" asChild>
            <TabButton icon="paperplane.fill">Explore</TabButton>
          </TabTrigger>
        </BlurView>
      </TabList>
    </Tabs>
  );
}
