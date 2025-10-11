import React from "react";
import { Stack } from "expo-router";
import { useW3IotaAuth } from "@/contexts/w3IotaAuth";

const RootStacks = () => {
  const { loggedIn } = useW3IotaAuth();
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