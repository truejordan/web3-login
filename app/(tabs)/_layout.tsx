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
import { hslToHex } from "@/utils/HlstoHex";

export default function TabLayout() {
  const { colors } = useTheme();
  console.log(colors.foreground);

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
          <TabTrigger name="activity" href="/(tabs)/activity" asChild>
            <TabButton icon="arrow.up.arrow.down.square.fill">
              Activity
            </TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/(tabs)/explore" asChild>
            <TabButton icon="paperplane.fill">Explore</TabButton>
          </TabTrigger>
        </BlurView>
      </TabList>
    </Tabs>
  );
}
