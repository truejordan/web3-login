import React, { useEffect, useState } from "react";
import { Text, View, Button, StyleSheet, Dimensions, ScrollView } from "react-native";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";
import Web3Auth, {
  TypeOfLogin,
  WEB3AUTH_NETWORK,
  LOGIN_PROVIDER,
} from "@web3auth/react-native-sdk";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import EncryptedStorage from "react-native-encrypted-storage";
import { SuiConfigType } from "./SuiConfigType";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

const scheme = "web3login"; // Or your desired app redirection scheme
const resolvedRedirectUrl =
  Constants.executionEnvironment === "storeClient" ||
  Constants.executionEnvironment === "standalone"
    ? Linking.createURL("web3auth", {})
    : Linking.createURL("web3auth", { scheme: scheme }); // replace with your own scheme

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.OTHER,
  chainId: SuiConfigType.chainId.devnet,
  // Avoid using public rpcTarget in production.
  // Use services like Infura, QuickNode, etc.
  rpcTarget: SuiConfigType.rpcTarget.devnet,
  displayName: SuiConfigType.displayName.devnet,
  blockExplorerUrl: SuiConfigType.blockExplorerUrl.devnet,
  ticker: SuiConfigType.ticker,
  tickerName: SuiConfigType.ticker,
  logo: SuiConfigType.logo,
};

const privateKeyProvider = new CommonPrivateKeyProvider({
  config: {
    chainConfig,
  },
});

const SdkInitParams = {
  network: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  clientId: process.env.EXPO_PUBLIC_CLIENT_ID,
  redirectUrl: resolvedRedirectUrl,
  browserRedirectUrl: resolvedRedirectUrl,
  clientSecret: process.env.EXPO_PUBLIC_CLIENT_SECRET,
  // useCoreKitKey: true, // for custom auth jwt login
  privateKeyProvider,
  // for custom auth jwt login
  // loginConfig: {
  //     jwt: {
  //       verifier: "w3a-auth0-demo",
  //       typeOfLogin: "jwt" as TypeOfLogin,
  //       clientId: process.env.EXPO_PUBLIC_CLIENT_ID,
  //     },
  //   },
};

const web3auth = new Web3Auth(WebBrowser, EncryptedStorage, SdkInitParams);

const AuthWrapper = () => {
  //   const resolvedRedirectUrl = `${scheme}://auth`;
  const [provider, setProvider] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [console, setConsole] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      // IMP START - SDK Initialization
      await web3auth.init();

      if (web3auth.connected) {
        // IMP END - SDK Initialization
        setProvider(privateKeyProvider);
        setLoggedIn(true);
      }
    };
    init();
  }, []);

  const suiRPC = (provider: any) => {
    const client = new SuiClient({
      url: getFullnodeUrl(provider), // Or 'testnet' or 'mainnet'
    });
    return client;
  };

  const uiConsole = (...args: unknown[]) => {
    setConsole(`${JSON.stringify(args || {}, null, 2)}\n\n\n\n${console}`);
  };

  const login = async (loginProvider: string) => {
    try {
      setConsole("Logging in");
      await web3auth.login({
        loginProvider,
        mfaLevel: "none",
      });

      uiConsole("Logged In");
      if (web3auth.connected) {
        // IMP END - Login
        setProvider(privateKeyProvider);
        uiConsole("Logged In");
        setLoggedIn(true);
      }
    } catch (error) {
      uiConsole("error:", error);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      setConsole("Web3auth not initialized");
      return;
    }

    setConsole("Logging out");
    await web3auth.logout();

    if (!web3auth.connected) {
      setProvider(null);
      uiConsole("Logged out");
      setLoggedIn(false);
    }
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const rpc = suiRPC(provider);
    setConsole("Getting chain id");
    const networkDetails = await rpc.getChainIdentifier(); // should get chain id
    uiConsole(networkDetails);
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const rpc = suiRPC(provider);
    setConsole("Getting account");
    const address = await rpc.getAccounts(); // should get address
    setAddress(address);
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const rpc = suiRPC(provider);
    setConsole("Fetching balance");
    const balance = await rpc.getBalance(address);
    uiConsole(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const rpc = suiRPC(provider);
    setConsole("Sending transaction");
    const tx = await rpc.sendTransaction();
    uiConsole(tx);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const rpc = suiRPC(provider);
    setConsole("Signing message");
    const message = await rpc.signMessage();
    uiConsole(message);
  };

  const launchWalletServices = async () => {
    if (!web3auth) {
      setConsole("Web3auth not initialized");
      return;
    }

    setConsole("Launch Wallet Services");
    await web3auth.launchWalletServices(chainConfig);
  };

  const requestSignature = async () => {
    if (!web3auth) {
      setConsole("Web3auth not initialized");
      return;
    }
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const rpc = suiRPC(provider);
    const address = await rpc.getAccounts();

    const params = ["Hello World", address];

    setConsole("Request Signature");
    const res = await web3auth.request(chainConfig, "personal_sign", params);
    uiConsole(res);
  };

  const loggedInView = (
    <View style={styles.buttonArea}>
      <Button
        title="Get User Info"
        onPress={() => uiConsole(web3auth.userInfo())}
      />
      <Button title="Get Chain ID" onPress={() => getChainId()} />
      <Button title="Get Accounts" onPress={() => getAccounts()} />
      <Button title="Get Balance" onPress={() => getBalance()} />
      <Button title="Send Transaction" onPress={() => sendTransaction()} />
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
      <Button title="Login with Google" onPress={() => login(LOGIN_PROVIDER.GOOGLE)} />
      <Button title="Login with Twitter" onPress={() => login(LOGIN_PROVIDER.TWITTER)} />
      <Button title="Login with Apple" onPress={() => login(LOGIN_PROVIDER.APPLE)} />
    </View>
  );

  return (
    <View style={styles.container}>
      {loggedIn ? loggedInView : unloggedInView}
      <View style={styles.consoleArea}>
        <Text style={styles.consoleText}>Console:</Text>
        <ScrollView style={styles.console}>
          <Text>{console}</Text>
        </ScrollView>
      </View>
    </View>
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
