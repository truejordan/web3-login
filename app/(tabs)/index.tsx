import { View, StyleSheet, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card,Button } from "heroui-native";
import { useW3SuiAuth } from "@/contexts/w3SuiAuth";


export default function HomeScreen() {
  const { loggedIn, web3authConsole,uiConsole, getAddress, getUserInfo, getChainId, getBalance, requestFaucet, sendTransaction, signMessage, launchWalletServices, requestSignature, logout } = useW3SuiAuth();

  const loggedInView = (
    <View className="flex-1 grow-[2] items-center justify-around pb-30">
      <Button onPress={() => uiConsole(getUserInfo())}>
        <Button.LabelContent>Get User Info</Button.LabelContent>
      </Button>
      <Button onPress={() => getChainId()}>
        <Button.LabelContent>Get Chain ID</Button.LabelContent>
      </Button>
      <Button onPress={() => getAddress()}>
        <Button.LabelContent>Get Accounts</Button.LabelContent>
      </Button>
      <Button onPress={() => getBalance()}>
        <Button.LabelContent>Get Balance</Button.LabelContent>
      </Button>
      <Button onPress={() => requestFaucet()}>
        <Button.LabelContent>Request Faucet</Button.LabelContent>
      </Button>
      <Button
        onPress={() =>
          sendTransaction(
            "0x41d4d47f7e2a9169f514ee4af2018bf486d53a347899ad21e16ba5ddc24e7fe3", // use input for recipient address
            0.2
          )
        }
      >
        <Button.LabelContent>Send 0.2 Sui</Button.LabelContent>
      </Button>
      <Button variant="primary" onPress={() => signMessage()}>
        <Button.LabelContent>Sign Message</Button.LabelContent>
      </Button>

      <Button onPress={() => launchWalletServices()}>
        <Button.LabelContent>Show Wallet UI</Button.LabelContent>
      </Button>
      <Button onPress={() => requestSignature()}>
        <Button.LabelContent>
          Request Signature from Wallet Services
        </Button.LabelContent>
      </Button>
      <Button onPress={() => logout()}>
        <Button.LabelContent>Log Out</Button.LabelContent>
      </Button>
    </View>
  );
  return (
    <SafeAreaView className="flex-1 bg-background p-8">
      <Card className="flex">
        <Card.Body className=" text-white ">
          <Text className="text-white">Console:</Text>
          <ScrollView className="flex h-52 bg-green-400/10">
            <Text className="text-green-700">{web3authConsole}</Text>
          </ScrollView>
        </Card.Body>
      </Card>
      <View>
        {loggedInView}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
