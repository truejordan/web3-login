import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Button,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";
import Web3Auth, {
  TypeOfLogin,
  // WEB3AUTH_NETWORK,
  LOGIN_PROVIDER,
} from "@web3auth/react-native-sdk";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { SuiConfigType } from "./SuiConfigType";
import {
  SuiClient,
  getFullnodeUrl,
  CoinBalance,
  ZkLoginIntentScope,
} from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { getFaucetHost, requestSuiFromFaucetV2 } from "@mysten/sui/faucet";

const scheme = "web3login"; // Or your desired app redirection scheme
const resolvedRedirectUrl = Linking.createURL("auth", { scheme: scheme });

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.OTHER as any,
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
  network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  clientId: process.env.EXPO_PUBLIC_CLIENT_ID!,
  redirectUrl: resolvedRedirectUrl,
  browserRedirectUrl: resolvedRedirectUrl,
  // clientSecret: process.env.EXPO_PUBLIC_CLIENT_SECRET!,
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
// console.log("SdkInitParams:", SdkInitParams);
const web3auth = new Web3Auth(WebBrowser, SecureStore, SdkInitParams);

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  //   const resolvedRedirectUrl = `${scheme}://auth`;
  const [provider, setProvider] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [web3authConsole, setWeb3authConsole] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [open, setOpen] = useState(false);

  // console.log(web3authConsole);

  useEffect(() => {
    const init = async () => {
      // IMP START - SDK Initialization
      await web3auth.init();

      try {
        if (!process.env.EXPO_PUBLIC_CLIENT_ID) {
          setWeb3authConsole(
            (prev) => `Missing EXPO_PUBLIC_CLIENT_ID at runtime.\n` + prev
          );
          console.warn("[Web3Auth] Missing EXPO_PUBLIC_CLIENT_ID");
          return;
        }

        await web3auth.init();
        console.log(
          "Web3auth initialized; ready=",
          web3auth.ready,
          "connected=",
          web3auth.connected
        );

        if (web3auth.connected) {
          // IMP END - SDK Initialization
          setProvider(privateKeyProvider);
          setLoggedIn(true);
        }
      } catch (error) {
        console.error("web3auth.init error", error);
        setWeb3authConsole((prev) => `init error: ${String(error)}\n` + prev);
      }
    };
    init();
    console.log("Web3auth initialized", web3auth.ready);
  }, []);

  const getPrivateKey = async () => {
    const privateKey = await provider.request({ method: "private_key" });
    return privateKey;
  };

  // Create an instance of the Sui local key pair manager for signing transactions
  const getKeyPair = async () => {
    const privateKey = await getPrivateKey();
    const privateKeyUint8Array = new Uint8Array(
      privateKey.match(/.{1,2}/g)!.map((byte: any) => parseInt(byte, 16))
    );
    const keyPair = Ed25519Keypair.fromSecretKey(privateKeyUint8Array);
    return keyPair;
  };
  // Clear the key pair from memory after use
  const clearKeyPair = (keyPair: Ed25519Keypair) => {
    // Access the private key bytes and clear them
    const privateKeyBytes = (keyPair as any).secretKey;
    if (privateKeyBytes && privateKeyBytes.fill) {
      privateKeyBytes.fill(0);
    }
  };

  const getAddress = async () => {
    const keyPair = await getKeyPair();
    const address = keyPair.toSuiAddress();
    clearKeyPair(keyPair);
    setAddress(address);
    uiConsole(`Sui account: ${address}`);
    console.log(`Sui account: ${address}`);
  };

  const suiRPC = () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const client = new SuiClient({
      url: getFullnodeUrl(provider?.config?.chainConfig?.displayName), // Or 'testnet' or 'mainnet'
    });
    return client;
  };

  const uiConsole = (...args: unknown[]) => {
    setWeb3authConsole(
      `${JSON.stringify(args || {}, null, 2)}\n\n\n\n${web3authConsole}`
    );
  };

  const login = async (loginProvider: string) => {
    try {
      if (!web3auth.ready) {
        setWeb3authConsole("Web3auth not initialized");
        return;
      }
      setWeb3authConsole("Logging in");
      console.log("login in:", loginProvider);
      await web3auth.login({
        loginProvider,
        redirectUrl: resolvedRedirectUrl,
        mfaLevel: "none",
        // extraLoginOptions: {
        //   login_hint: "email",
        // },
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
      console.log("error:", error);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      setWeb3authConsole("Web3auth not initialized");
      return;
    }

    setWeb3authConsole("Logging out");
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

    const rpc = suiRPC();
    setWeb3authConsole("Getting chain id");
    const networkDetails = await rpc?.getChainIdentifier(); // should get chain id
    uiConsole(networkDetails);
  };

  const balance = (balance: CoinBalance) => {
    return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    try {
      if (!address) {
        uiConsole("address not initialized yet");
        return;
      }
      const rpc = suiRPC();
      setWeb3authConsole("Fetching balance");
      const balanceResponse = await rpc?.getBalance({ owner: address });
      const suiBalance = balance(balanceResponse as CoinBalance);
      uiConsole(`Sui Balance: ${suiBalance}`);
      console.log(`Sui Balance: ${suiBalance}`);
    } catch (error) {
      uiConsole("error fetching balance:", error);
      console.log("error fetching balance:", error);
    }
  };

  const requestFaucet = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    try {
      // Get the address first
      await getAddress();

      if (!address) {
        uiConsole("Address not available");
        return;
      }

      setWeb3authConsole("Requesting faucet...");

      await requestSuiFromFaucetV2({
        host: getFaucetHost("devnet"), // Use devnet to match your chain config
        recipient: address,
      });

      uiConsole("Faucet request successful! Check your balance.");
      console.log("Faucet request successful!");
    } catch (error) {
      uiConsole("Error requesting faucet:", error);
      console.log("Error requesting faucet:", error);
    }
  };

  const sendTransaction = async (
    recipientAddress?: string,
    amount?: number
  ) => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    if (!address) {
      uiConsole("Address not available");
      return;
    }
    if (!recipientAddress || !amount) {
      uiConsole("recipientAddress and amount are required");
      return;
    }

    try {
      // const rpc = suiRPC();
      setWeb3authConsole("Sending transaction");
      const tx = await new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [
        tx.pure.u64(amount * Number(MIST_PER_SUI)),
      ]);

      // Transfer to a recipient address (replace with actual recipient)
      tx.transferObjects([coin], tx.pure.address(recipientAddress));
      // const pk = await getPrivateKey();
      const kp = await getKeyPair();
      const result = await suiRPC()?.signAndExecuteTransaction({
        signer: kp,
        transaction: tx,
      });

      uiConsole(
        `transaction: ${result?.digest} amount: ${amount} recipientAddress: ${recipientAddress}`
      );
      console.log(
        `transaction: ${tx} amount: ${amount} recipientAddress: ${recipientAddress}`
      );
    } catch (error) {
      uiConsole("error sending transaction:", error);
      console.log("error sending transaction:", error);
    }
  };

  const signMessage = async (message?: string) => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    // Use provided message or fallback
    const messageToSign = message || "Signee confirmation";
    const timestamp = new Date().toISOString();
    const fullMessage = `${messageToSign} at ${timestamp}`;

    try {
      setWeb3authConsole(`Signing message: ${fullMessage}`);
      const kp = await getKeyPair();
      const messageBytes = new TextEncoder().encode(fullMessage);
      const signature = await kp.signPersonalMessage(messageBytes);

      const result = {
        message: fullMessage,
        signature: signature.signature,
        publicKey: kp.getPublicKey().toSuiPublicKey(),
        address: kp.toSuiAddress(),
        timestamp,
      };

      clearKeyPair(kp);
      uiConsole(
        `Message signed successfully: ${JSON.stringify(result, null, 2)}`
      );
      console.log("Message signed:", result);
      return result;
    } catch (error) {
      uiConsole("Error signing message:", error);
    console.log("Error signing message:", error);
    return null;
    }
  };

  const launchWalletServices = async () => {
    if (!web3auth) {
      setWeb3authConsole("Web3auth not initialized");
      return;
    }

    setWeb3authConsole("Launch Wallet Services");
    await web3auth.launchWalletServices(chainConfig);
  };

  const requestSignature = async () => {
    if (!web3auth) {
      setWeb3authConsole("Web3auth not initialized");
      return;
    }
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    // const rpc = suiRPC();
    const address = await getAddress();

    const params = ["Hello World", address];

    setWeb3authConsole("Request Signature");
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
