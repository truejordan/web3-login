import React, { useEffect, useState } from "react";
import { Button, TextField, FormField, Divider } from "heroui-native";
import { Text, View, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useW3SuiAuth } from "@/contexts/w3SuiAuth";
import { LOGIN_PROVIDER } from "@web3auth/react-native-sdk";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image } from "expo-image";

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    loggedIn,
    open,
    uiConsole,
    getUserInfo,
    getChainId,
    getAddress,
    getBalance,
    requestFaucet,
    sendTransaction,
    signMessage,
    launchWalletServices,
    requestSignature,
    web3authConsole,
    login,
    logout,
    setEmailLogin,
    emailLogin,
  } = useW3SuiAuth();

  console.log("emailLogin", emailLogin);

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

  const unloggedInView = (
    <View className="flex-1 grow-[2} items-center gap-8 pt-32 pb-30">
      <Image style={{ width: 96, height: 96 }} source={{uri:"https://www.d3jordan.com/d3j-logo-new.svg"}} />
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
        <TextField.ErrorMessage>This field is required</TextField.ErrorMessage>
      </TextField>
      <View className="flex flex-row gap-8 items-center justify-center w-64 overflow-hidden">
        <Divider orientation="horizontal" variant="thin" className=" w-full" />
        <Text className="text-white">or</Text>
        <Divider orientation="horizontal" variant="thin" className=" w-full" />
      </View>
      <View className="flex flex-row gap-4">
        <Button className="w-20" onPress={() => login(LOGIN_PROVIDER.GOOGLE)}>
          <Button.LabelContent>
            <FontAwesome6 name="google" size={24} color="black" />
          </Button.LabelContent>
        </Button>
        <Button className="w-20" onPress={() => login(LOGIN_PROVIDER.TWITTER)}>
          <Button.LabelContent>
            <FontAwesome6 name="x-twitter" size={24} color="black" />
          </Button.LabelContent>
        </Button>
        <Button className="w-20" onPress={() => login(LOGIN_PROVIDER.APPLE)}>
          <Button.LabelContent>
            <FontAwesome6 name="apple" size={24} color="black" />
          </Button.LabelContent>
        </Button>
      </View>
    </View>
  );

  return (
    <>
      {loggedIn ? (
        <>{children}</>
      ) : (
        <View className="flex-1 items-center pt-14 pb-8">
          {unloggedInView}
          {/* <View className=" flex-1 w-full items-center justify-center m-5">
            <Text className="text-white">Console:</Text>
            <ScrollView className=" flex-1 bg-slate-400 p-4 w-[80%]">
              <Text>{web3authConsole}</Text>
            </ScrollView>
          </View> */}
        </View>
      )}
    </>
  );
};

export default AuthWrapper;
