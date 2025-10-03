import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "heroui-native";
import { useW3SuiAuth } from "@/contexts/w3SuiAuth";
import AuthConsole from "@/components/auth/AuthConsole";
import { useW3IotaAuth } from "@/contexts/w3IotaAuth";

export default function FunctionsScreen() {
  const {
    uiConsole,
    getAddress,
    getUserInfo,
    getChainId,
    getBalance,
    requestFaucet,
    sendTransaction,
    signMessage,
    launchWalletServices,
    requestSignature,
    logout,
  } = useW3IotaAuth();

  const loggedInView = (
    <View className="flex-1 items-center gap-4 pb-24 pt-8">
      <Button size="sm" onPress={() => uiConsole(getUserInfo())}>
        <Button.LabelContent className="w-full">
          Get User Info
        </Button.LabelContent>
      </Button>
      <Button size="sm" onPress={() => getChainId()}>
        <Button.LabelContent className="w-full">
          Get Chain ID
        </Button.LabelContent>
      </Button>
      <Button size="sm" onPress={() => getAddress()}>
        <Button.LabelContent className="w-full">
          Get Accounts
        </Button.LabelContent>
      </Button>
      <Button size="sm" onPress={() => getBalance()}>
        <Button.LabelContent className="w-full">
          Get Balance
        </Button.LabelContent>
      </Button>
      <Button size="sm" onPress={() => requestFaucet()}>
        <Button.LabelContent className="w-full">
          Request Faucet
        </Button.LabelContent>
      </Button>
      <Button
        size="sm"
        onPress={() =>
          sendTransaction(
            "0x41d4d47f7e2a9169f514ee4af2018bf486d53a347899ad21e16ba5ddc24e7fe3", // use input for recipient address
            15.2
          )
        }
      >
        <Button.LabelContent className="w-full">
          Send 0.2 Sui
        </Button.LabelContent>
      </Button>
      <Button size="sm" onPress={() => signMessage()}>
        <Button.LabelContent className="w-full">
          Sign Message
        </Button.LabelContent>
      </Button>

      <Button size="sm" onPress={() => launchWalletServices()}>
        <Button.LabelContent className="w-full">
          Show Wallet UI
        </Button.LabelContent>
      </Button>
      <Button size="sm" onPress={() => requestSignature()}>
        <Button.LabelContent className="w-full">
          Request Signature from Wallet Services
        </Button.LabelContent>
      </Button>
      <Button variant="danger" size="sm" onPress={() => logout()}>
        <Button.LabelContent className="w-full">Log Out</Button.LabelContent>
      </Button>
    </View>
  );
  return (
    <SafeAreaView className="flex-1  p-8">
      <AuthConsole />
      <ScrollView
        className="flex-1 h-full w-full gap-4"
        showsVerticalScrollIndicator={false}
      >
        {loggedInView}
      </ScrollView>
    </SafeAreaView>
  );
}
