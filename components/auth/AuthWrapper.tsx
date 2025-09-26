import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Button,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { useW3SuiAuth } from "@/contexts/w3SuiAuth";
import {
  LOGIN_PROVIDER,
} from "@web3auth/react-native-sdk";

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
  } = useW3SuiAuth();

  const loggedInView = (
    <View style={styles.buttonArea}>
      <Button
        title="Get User Info"
        onPress={() => uiConsole(getUserInfo())}
      />
      <Button title="Get Chain ID" onPress={() => getChainId()} />
      <Button title="Get Accounts" onPress={() => getAddress()} />
      <Button title="Get Balance" onPress={() => getBalance()} />
      <Button title="Request Faucet" onPress={() => requestFaucet()} />
      <Button
        title="Send Transaction"
        onPress={() =>
          sendTransaction(
            "0x41d4d47f7e2a9169f514ee4af2018bf486d53a347899ad21e16ba5ddc24e7fe3",
            0.2
          )
        }
      />
      <Button title="Sign Message" onPress={() => signMessage()} />
      <Button title="Show Wallet UI" onPress={() => launchWalletServices()} />
      <Button
        title="Request Signature from Wallet Services"
        onPress={() => requestSignature()}
      />
      <Button title="Log Out" onPress={() => logout()} />
    </View>
  );

  const unloggedInView = (
    <View style={styles.buttonArea}>
      <Button
        title="Login with Auth0 Email Passwordless"
        onPress={() => login(LOGIN_PROVIDER.EMAIL_PASSWORDLESS)}
      />
      <Text>or</Text>
      <Button
        title="Login with Google"
        onPress={() => login(LOGIN_PROVIDER.GOOGLE)}
      />
      <Button
        title="Login with Twitter"
        onPress={() => login(LOGIN_PROVIDER.TWITTER)}
      />
      <Button
        title="Login with Apple"
        onPress={() => login(LOGIN_PROVIDER.APPLE)}
      />
    </View>
  );

  return (
    <>
      {open ? (
        <>{children}</>
      ) : (
        <View style={styles.container}>
          {loggedIn ? loggedInView : unloggedInView}
          <View style={styles.consoleArea}>
            <Text style={styles.consoleText}>Console:</Text>
            <ScrollView style={styles.console}>
              <Text>{web3authConsole}</Text>
            </ScrollView>
          </View>
        </View>
      )}
    </>
  );
};

export default AuthWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 30,
  },
  consoleArea: {
    margin: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  console: {
    flex: 1,
    backgroundColor: "#CCCCCC",
    color: "#ffffff",
    padding: 10,
    width: Dimensions.get("window").width - 60,
  },
  consoleText: {
    padding: 10,
  },
  buttonArea: {
    flex: 2,
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 30,
  },
});
