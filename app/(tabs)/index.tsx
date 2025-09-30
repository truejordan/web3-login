import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, TextField, Spinner } from "heroui-native";
import { useW3SuiAuth } from "@/contexts/w3SuiAuth";
import { HuiText } from "@/components/hui-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { FadeIn } from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";
import { isValidSuiAddress } from "@mysten/sui/utils";

export default function HomeScreen() {
  const {
    requestFaucet,
    sendTransaction,
    launchWalletServices,
    address,
    mybalance,
  } = useW3SuiAuth();
  const [getFaucet, setGetFaucet] = useState(false);
  const [amount, setAmount] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [errors, setErrors] = useState<{ amount: boolean; address: boolean }>({
    amount: false,
    address: false,
  });
  const [isDisabled, setIsDisabled] = useState(false);

  const validateAmount = (value: any) => {
    return !!(value && !isNaN(Number(value)) && Number(value) > 0);
  };

  const validateAddress = (value: string) => {
    return !!(value && isValidSuiAddress(value));
  };

  const isValidAmount = validateAmount(amount);
  const isValidAddress = validateAddress(recipientAddress);
  const isFormValid = isValidAmount && isValidAddress;

  const onSendPress = () => {
    if (!isFormValid) {
      setErrors({
        amount: !validateAmount(amount),
        address: !validateAddress(recipientAddress),
      });
      return;
    }
    // valid – clear any previous errors and proceed
    setErrors({ amount: false, address: false });
    sendTransaction(recipientAddress.trim(), Number(amount));
    setIsDisabled(true);
    setTimeout(() => {
      setIsDisabled(false);
    }, 3000);
  };

  const onTextChange = (text: string, type: "amount" | "address") => {
    if (type === "amount") {
      setAmount(Number(text));
      if (text === "" || text === "0") {
        setErrors((e) => ({ ...e, amount: false }));
      }
    } else {
      setRecipientAddress(text);
      if (text.trim() === "") {
        setErrors((e) => ({ ...e, address: false }));
      }
    }
  };

  const copyToClipboard = () => {
    Clipboard.setStringAsync(address);
    console.log("copy address", address);
  };

  const onFaucetPress = () => {
    setGetFaucet(true);
    requestFaucet();
    setTimeout(() => {
      setGetFaucet(false);
    }, 4500);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1  p-8">
        <Card className="flex w-full overflow-visible">
          <Card.Body className="flex flex-col w-full p-4 relative items-center bg-stone-500/20 rounded-sm ">
            <View className="flex w-full flex-col gap-8">
              <View className="flex-row items-end gap-2">
                <HuiText className="text-4xl">{`${mybalance}`}</HuiText>
                <HuiText className="text-md text-cyan-300 pb-2">Sui💧</HuiText>
              </View>
              <TouchableOpacity
                onPress={copyToClipboard}
                className="flex-row w-full items-center gap-2 align-center"
              >
                <HuiText className="text-xs w-[88%] text-muted-foreground">
                  {address}
                </HuiText>
                <IconSymbol
                  name="rectangle.on.rectangle"
                  size={18}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </Card.Body>
        </Card>
        <View className="flex-row w-full justify-around items-center  py-8">
          <Button
            layout={FadeIn.duration(0.01)}
            variant="tertiary"
            className="w-44"
            onPress={() => onFaucetPress()}
          >
            <Button.LabelContent>
              {getFaucet ? (
                <Spinner entering={FadeIn.delay(150)} color="white" />
              ) : (
                "Faucet 🚰"
              )}
            </Button.LabelContent>
          </Button>
          <Button
            layout={FadeIn.duration(0.01)}
            variant="tertiary"
            className="w-44"
            onPress={() => launchWalletServices()}
          >
            <Button.LabelContent>Wallet 💳</Button.LabelContent>
          </Button>
        </View>
        <TextField className="gap-2">
          <TextField.Label>Transfer</TextField.Label>
          <TextField.Input
            isInvalid={errors.amount}
            placeholder="amount"
            keyboardType="numeric"
            inputMode="numeric"
            onChangeText={(text) => onTextChange(text, "amount")}
          />
          <TextField.ErrorMessage isInvalid={errors.amount}>
            must be a valid amount
          </TextField.ErrorMessage>
          <TextField className="gap-2"></TextField>
          <TextField.Input
            isInvalid={errors.address}
            placeholder="address"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(text) => onTextChange(text, "address")}
          />
          <TextField.ErrorMessage isInvalid={errors.address}>
            must be a valid address
          </TextField.ErrorMessage>
        </TextField>
        <Button
          layout={FadeIn.duration(0.01)}
          onPress={() => onSendPress()}
          isDisabled={isDisabled}
          className="bg-purple-900 mt-4"
        >
          <Button.LabelContent classNames={{ text: "text-white" }}>
            {isDisabled ? (
              <Spinner entering={FadeIn.delay(150)} color="white" />
            ) : (
              "Send"
            )}
          </Button.LabelContent>
        </Button>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
