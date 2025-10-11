import React from "react";
import { Button, TextField, Divider } from "heroui-native";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useW3SuiAuth } from "@/contexts/w3SuiAuth";
import { LOGIN_PROVIDER } from "@web3auth/react-native-sdk";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import HuiImage from "@/components/hui-image";
import HuiExternalLink from "@/components/hui-external-link";
import { HuiText } from "@/components/hui-text";
import AuthConsole from "@/components/auth/AuthConsole";

const AuthWrapper = () => {
  const { login, setEmailLogin, emailLogin } = useW3SuiAuth();
  console.log("emailLogin", emailLogin);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 items-center pt-14 pb-8 bg-background">
        <View className="flex-1 w-full grow-[2} items-center gap-8 pt-32 pb-30">
          <HuiImage
            className="w-24 h-24 m-8"
            source="https://www.d3jordan.com/d3j-logo-new.svg"
            resizeMode="contain"
          />
          <TextField className="flex gap-4 items-center rounded-r-none">
            <TextField.Label>Email Login</TextField.Label>
            <TextField.Input
              className="w-72 h-[48px]"
              placeholder="Enter your email"
              onChangeText={setEmailLogin}
            />
            <TextField.InputEndContent>
              <Button
                variant="secondary"
                className="w-72"
                onPress={() => login(LOGIN_PROVIDER.EMAIL_PASSWORDLESS)}
              >
                <Button.LabelContent>Login</Button.LabelContent>
              </Button>
            </TextField.InputEndContent>
            <TextField.ErrorMessage>
              This field is required
            </TextField.ErrorMessage>
          </TextField>
          <View className="flex flex-row gap-8 items-center justify-center w-64 overflow-hidden">
            <Divider
              orientation="horizontal"
              variant="thin"
              className=" w-full"
            />
            <HuiText className="text-lg">or</HuiText>
            <Divider
              orientation="horizontal"
              variant="thin"
              className=" w-full"
            />
          </View>
          <View className="flex flex-row gap-4">
            <Button
              className="w-20"
              onPress={() => login(LOGIN_PROVIDER.GOOGLE)}
            >
              <Button.LabelContent>
                <FontAwesome6 name="google" size={24} color="black" />
              </Button.LabelContent>
            </Button>
            <Button
              className="w-20"
              onPress={() => login(LOGIN_PROVIDER.TWITTER)}
            >
              <Button.LabelContent>
                <FontAwesome6 name="x-twitter" size={24} color="black" />
              </Button.LabelContent>
            </Button>
            <Button
              className="w-20"
              onPress={() => login(LOGIN_PROVIDER.APPLE)}
            >
              <Button.LabelContent>
                <FontAwesome6 name="apple" size={24} color="black" />
              </Button.LabelContent>
            </Button>
          </View>
          <HuiExternalLink
            href="https://x.com/0xPlayer1"
            className="text-white"
          >
            <View className="flex flex-col items-center gap-2">
              <HuiText className=" text-xs">Follow me on X</HuiText>
              <HuiText className="text-cyan-400">@0xPlayer1</HuiText>
            </View>
          </HuiExternalLink>
          {/* Use auth console to see sign in logs */}
          {/* <View className="w-full p-4">
              <AuthConsole />
            </View> */}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AuthWrapper;
