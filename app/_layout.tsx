import React from "react";
import "./global.css";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import "react-native-reanimated";
import QuickCrypto, {
  install as installQuickCrypto,
} from "react-native-quick-crypto";
import "../globals";
import { Buffer } from "buffer";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { LogBox } from "react-native";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { W3IotaAuthProvider } from "@/contexts/w3IotaAuth";
import RootStacks from "@/components/rootStacks";

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
  LogBox.ignoreLogs([
    // /Web3Auth/,
    // /LoginError/,
    /login flow failed/,
    /LoginError.*cancel/,
  ]);

  console.log("isLiquidGlassAvailable", isLiquidGlassAvailable());

  return (
    <HeroUINativeProvider config={{ colorScheme: "dark" }}>
      <W3IotaAuthProvider>
        <RootStacks />
      </W3IotaAuthProvider>
      <StatusBar style="auto" />
    </HeroUINativeProvider>
  );
}
