import React from "react";
import { Stack } from "expo-router";
import { useW3SuiAuth } from "@/contexts/w3SuiAuth";

const RootStacks = () => {
  const { loggedIn } = useW3SuiAuth();
  return (
    <Stack>
      <Stack.Protected guard={!loggedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={loggedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack.Protected>
    </Stack>
  );
};

export default RootStacks;
