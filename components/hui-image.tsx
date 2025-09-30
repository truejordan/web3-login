import { View } from "react-native";
import React from "react";
import { Image } from "expo-image";

const HuiImage = ({
  source,
  className = "",
  resizeMode = "contain",
}: {
  source: string;
  className: string;
  resizeMode: "contain" | "cover" | "stretch" | "repeat" | "center";
}) => {
  return (
    <View className={className}>
      <Image
        source={{ uri: source }}
        style={{ width: "100%", height: "100%", resizeMode: resizeMode }}
      />
    </View>
  );
};

export default HuiImage;
