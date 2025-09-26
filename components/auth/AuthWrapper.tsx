import React, { useEffect, useState } from "react";
import { Button, TextField, FormField } from "heroui-native";
import { Text, View, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useW3SuiAuth } from "@/contexts/w3SuiAuth";
import { LOGIN_PROVIDER } from "@web3auth/react-native-sdk";

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
    <View className="flex-1 grow-[2} items-center justify-around pb-30">
      {/* <FormField className=" flex-row gap-1 justify-between w-72">
        <FormField.Content>
          <TextField className="w-52" >
            <TextField.Input placeholder="Enter your email" />
          </TextField>
        </FormField.Content>
        <FormField.Indicator>
          <Button onPress={() => login(LOGIN_PROVIDER.EMAIL_PASSWORDLESS)}>
            <Button.LabelContent>
              Login
            </Button.LabelContent>
          </Button>
        </FormField.Indicator>
        <FormField.ErrorMessage>This field is required</FormField.ErrorMessage>
      </FormField> */}
      <TextField className="flex-row gap-1 justify-between items-center">
        {/* <TextField.Label>Email</TextField.Label> */}
        <TextField.Input className="w-64" placeholder="Enter your email" onChangeText={setEmailLogin} />
        <TextField.InputEndContent>
          <Button onPress={() => login(LOGIN_PROVIDER.EMAIL_PASSWORDLESS)}>
            <Button.LabelContent>Login</Button.LabelContent>
          </Button>
        </TextField.InputEndContent>
        <TextField.ErrorMessage>This field is required</TextField.ErrorMessage>
      </TextField>

      <Text className="text-white">or</Text>
      <Button onPress={() => login(LOGIN_PROVIDER.GOOGLE)}>
        <Button.LabelContent>Login with Google</Button.LabelContent>
      </Button>
      <Button onPress={() => login(LOGIN_PROVIDER.TWITTER)}>
        <Button.LabelContent>Login with Twitter</Button.LabelContent>
      </Button>
      <Button onPress={() => login(LOGIN_PROVIDER.APPLE)}>
        <Button.LabelContent>Login with Apple</Button.LabelContent>
      </Button>
    </View>
  );

  return (
    <>
      {open ? (
        <>{children}</>
      ) : (
        <View className="flex-1 justify-center items-center pt-14 pb-8">
          {loggedIn ? loggedInView : unloggedInView}
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
