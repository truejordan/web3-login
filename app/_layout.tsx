import React from "react";
import "./global.css";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import "react-native-reanimated";
// import "nativewind/metro";
import QuickCrypto, {
  install as installQuickCrypto,
} from "react-native-quick-crypto";
import "../globals";
import { Buffer } from "buffer";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AuthWrapper from "@/components/auth/AuthWrapper";
import { W3SuiAuthProvider } from "@/contexts/w3SuiAuth";
import Authenticator from "@/components/auth/Authenticator";
import { HeroUINativeProvider } from "heroui-native";

installQuickCrypto();

if (!(global as any).QuickCrypto) (global as any).QuickCrypto = QuickCrypto;

// global.Buffer = Buffer;
if (typeof global !== "undefined" && (global as any).Buffer === undefined) {
  (global as any).Buffer = Buffer;
}

console.log("crypto.subtle exists (entry):", !!globalThis.crypto?.subtle);

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
      <HeroUINativeProvider config={{colorScheme: 'dark'}}>
    {/* <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
        <W3SuiAuthProvider>
          {/* <Authenticator> */}
          <AuthWrapper>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>
          </AuthWrapper>
          {/* </Authenticator> */}
        </W3SuiAuthProvider>
      <StatusBar style="auto" />
    {/* </ThemeProvider> */}
      </HeroUINativeProvider>
  );
}
