import { Text, View, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { useW3SuiAuth } from "@/contexts/w3SuiAuth";
import { Card, useTheme } from "heroui-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { hslToHex } from "@/utils/HlstoHex";
import { SuiConfigType } from "@/components/auth/SuiConfigType";
import * as WebBrowser from "expo-web-browser";

const ActivityItem = ({ item }: { item: any }) => {
  const { colors } = useTheme();
  const formatTimestamp = (timestamp: string | number) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return new Date(Number(timestamp))
      .toLocaleString("en-GB", options as any)
      .replace("at", ",");
  };
  return (
    <TouchableOpacity
      onPress={() =>
        WebBrowser.openBrowserAsync(
          `${SuiConfigType.blockExplorerUrl.devnet}/tx/${item.id}`,
          {
            presentationStyle:
              WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
            showTitle: true,
          }
        )
      }
    >
      <Card className="bg-purple-800/10 border-0 mb-2">
        <Card.Body className="flex-row items-center gap-4 px-2 ">
          <View className="flex-row items-center gap-2 bg-muted-foreground/20 p-2 rounded-sm text-purple-600">
            <IconSymbol
              name={
                item.type === "sent"
                  ? "arrow.up.right.square"
                  : "arrow.down.left.square"
              }
              size={18}
              color={
                item.type === "sent"
                  ? hslToHex(colors.danger)
                  : hslToHex(colors.success)
              }
            />
          </View>
          <View className="flex-1 flex-row items-center justify-between gap-2">
            <View>
              <Text className="text-md font-medium text-foreground capitalize">
                {item.type}
              </Text>
              <Text className="text-xs text-foreground">
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text
                className={`text-sm ${item.type === "sent" ? "text-danger" : "text-success"}`}
              >
                {item.type === "sent" ? "-" : ""}
                {item.amount}
              </Text>
            </View>
          </View>
        </Card.Body>
      </Card>
    </TouchableOpacity>
  );
};

const Activity = () => {
  const { accountActivity } = useW3SuiAuth();
  // removes duplicate transactions when sending
  const deduplicatedActivity = accountActivity.reduce((acc, current) => {
    const existing = acc.find((item: any) => item.id === current.id);
    
    if (!existing) {
      // First occurrence, add it
      acc.push(current);
    } else {
      // Duplicate found - keep the "sent" version
      if (existing.type === 'received' && current.type === 'sent') {
        // Replace received with sent
        const index = acc.findIndex((item: any) => item.id === current.id);
        acc[index] = current;
      }
      // If existing is already sent or both are same type, keep existing
    }
    
    return acc;
  }, [] as typeof accountActivity);
  const orderedAccountActivity = deduplicatedActivity.sort(
    (a: any, b: any) => b.timestamp - a.timestamp
  );
  console.log("orderedAccountActivity", orderedAccountActivity);
  return (
    <SafeAreaView className="flex-1 p-8">
      <FlatList
        data={orderedAccountActivity}
        renderItem={({ item }) => <ActivityItem item={item} />}
        keyExtractor={(item) => `${item.id}-${item.type}`}
        contentContainerStyle={{ paddingBottom: 38 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Activity;
