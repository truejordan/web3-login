import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";
import Web3Auth, {
  LOGIN_PROVIDER,
  AuthUserInfo,
  TypeOfLogin
} from "@web3auth/react-native-sdk";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { SuiConfigType } from "../components/auth/SuiConfigType";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { SuiClient, getFullnodeUrl, CoinBalance, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { MIST_PER_SUI, normalizeSuiAddress } from "@mysten/sui/utils";
import { getFaucetHost, requestSuiFromFaucetV2 } from "@mysten/sui/faucet";
import { Transaction } from "@mysten/sui/transactions";
import { useQueryTxHelpers } from "@/utils/queryTxHelpers";

interface W3SuiAuthContextType {
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
  address: string;
  setAddress: (address: string) => void;
  provider: any;
  setProvider: (provider: any) => void;
  web3authConsole: string;
  setWeb3authConsole: (web3authConsole: string) => void;
  emailLogin: string;
  setEmailLogin: (emailLogin: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  getPrivateKey: () => Promise<string>; // type might be different
  getKeyPair: () => Promise<Ed25519Keypair>;
  clearKeyPair: (keyPair: Ed25519Keypair) => void;
  getAddress: () => Promise<string>;
  suiRPC: () => SuiClient | undefined;
  login: (loginProvider: string, auth0Provider?: string) => Promise<void>;
  logout: () => Promise<void>;
  getChainId: () => Promise<void>;
  balance: (balance: CoinBalance) => number;
  getBalance: () => Promise<void>;
  requestFaucet: () => Promise<void>;
  sendTransaction: (
    recipientAddress?: string,
    amount?: number
  ) => Promise<void>;
  signMessage: (
    message?: string
  ) => Promise<SignMessageResult | null | undefined>;
  launchWalletServices: () => Promise<void>;
  requestSignature: () => Promise<void>;
  getUserInfo: () => Promise<AuthUserInfo | undefined>;
  uiConsole: (...args: unknown[]) => void;
  mybalance: number;
  setMybalance: (mybalance: number) => void;
  accountActivity: any[];
  setAccountActivity: (accountActivity: any[]) => void;
}

type SignMessageResult = {
  message: string;
  signature: string;
  publicKey: string;
  address: string;
  timestamp: string;
};

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
  sessionTime: 86400 * 7,
  // clientSecret: process.env.EXPO_PUBLIC_CLIENT_SECRET!,
  // useCoreKitKey: true, // for custom auth jwt login
  privateKeyProvider,
  // for custom auth jwt login
  loginConfig: {
      jwt: {
        verifier: "3xl-sub-auth",
        typeOfLogin: "jwt" as TypeOfLogin,
        clientId: process.env.EXPO_PUBLIC_AUTHO_CLIENT_ID!,
      },
    },
};
const web3auth = new Web3Auth(WebBrowser, SecureStore, SdkInitParams);

const W3SuiAuthContext = createContext<W3SuiAuthContextType | undefined>(
  undefined
);

export const W3SuiAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [provider, setProvider] = useState<any>(null);
  const [web3authConsole, setWeb3authConsole] = useState<string>("");
  const [emailLogin, setEmailLogin] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [mybalance, setMybalance] = useState<number>(0);
  const [accountActivity, setAccountActivity] = useState<any[]>([]);
  console.log("network", provider?.config?.chainConfig?.displayName);

  // ui console util
  const uiConsole = useCallback(
    (...args: unknown[]) => {
      setWeb3authConsole(
        `${JSON.stringify(args || {}, null, 2)}\n\n\n\n${web3authConsole}`
      );
    },
    [web3authConsole]
  );

  const { sumSuiDeltaFor, gasFeeMist, getRecipientAddress } = useQueryTxHelpers();
  
  useEffect(() => {
    const init = async () => {
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

  useEffect(() => {
    const checkStoredToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("web3auth_token");
        if (storedToken && web3auth.connected) {
          setLoggedIn(true);
          setProvider(privateKeyProvider);
        }
      } catch (error) {
        console.error("Error checking stored token:", error);
      }
    };

    checkStoredToken();
  }, []);

  // Get the private key from the provider
  const getPrivateKey = useCallback(async () => {
    const privateKey = await provider.request({ method: "private_key" });
    return privateKey;
  }, [provider]);

  // Create an instance of the Sui local key pair manager for signing transactions
  const getKeyPair = useCallback(async () => {
    const privateKey = await getPrivateKey();
    const privateKeyUint8Array = new Uint8Array(
      privateKey.match(/.{1,2}/g)!.map((byte: any) => parseInt(byte, 16))
    );
    const keyPair = Ed25519Keypair.fromSecretKey(privateKeyUint8Array);
    return keyPair;
  }, [getPrivateKey]);

  // Clear the key pair from memory after use
  const clearKeyPair = useCallback((keyPair: Ed25519Keypair) => {
    // Access the private key bytes and clear them
    const privateKeyBytes = (keyPair as any).secretKey;
    if (privateKeyBytes && privateKeyBytes.fill) {
      privateKeyBytes.fill(0);
    }
  }, []);

  // get user info from web3auth
  // should add more safety checks
  const getUserInfo = async () => {
    if (!web3auth.connected) {
      setWeb3authConsole("Web3auth not connected");
      return;
    }
    const userInfo = await web3auth.userInfo();
    uiConsole(userInfo);
    console.log("User info:", userInfo);
    return userInfo;
  };

  // Get the address from the key pair
  const getAddress = useCallback(async () => {
    const keyPair = await getKeyPair();
    const address = keyPair.toSuiAddress();
    clearKeyPair(keyPair);
    setAddress(address);
    uiConsole(`Sui account: ${address}`);
    console.log(`Sui account: ${address}`);
    return address;
  }, [getKeyPair, clearKeyPair, uiConsole]);

  // Get the Sui RPC client
  const suiRPC = useCallback(() => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const client = new SuiClient({
      url: getFullnodeUrl(provider?.config?.chainConfig?.displayName), // Or 'testnet' or 'mainnet'
    });
    return client;
  }, [provider, uiConsole]);

  // Login with the given login provider
  const login = async (loginProvider: string, auth0Provider?: string) => {
    try {
      if (!web3auth.ready) {
        setWeb3authConsole("Web3auth not initialized");
        return;
      }
      setWeb3authConsole("Logging in");
      console.log("login in:", loginProvider);
      if (loginProvider === LOGIN_PROVIDER.JWT && auth0Provider === 'email' ) {
        if (!emailLogin) {
          uiConsole("Email is required");
          return;
        }
        await web3auth.login({
          loginProvider,
          redirectUrl: resolvedRedirectUrl,
          extraLoginOptions: {
            login_hint: emailLogin,
            domain:'https://dev-pqfoyphs7qp6u38e.uk.auth0.com', //replace with your authO domain
            verifierIdField: "sub",
            connection: 'email',
          },
        });
      } else {
        await web3auth.login({
          loginProvider,
          redirectUrl: resolvedRedirectUrl,
          mfaLevel: "none",
          extraLoginOptions: {
            domain:'https://dev-pqfoyphs7qp6u38e.uk.auth0.com', //replace with your authO domain
            verifierIdField: "sub",
            connection: auth0Provider
          },
        });
      }

      uiConsole("Logged In");
      if (web3auth.connected) {
        // IMP END - Login
        // get jwt token
        const userinfo = await getUserInfo();
        // await getAddress();
        const idToken = userinfo?.idToken;
        const auth0JWT = userinfo?.oAuthIdToken;
        if (!idToken || !auth0JWT) {
          uiConsole("jwt tokens not found");
          return;
        }

        // Store token securely
        await SecureStore.setItemAsync("web3auth_token", idToken);
        await SecureStore.setItemAsync("auth0_token", auth0JWT);
        setProvider(privateKeyProvider);
        uiConsole("Logged In");
        setLoggedIn(true);
      }
    } catch (error: any) {
      // Handle cancel error specifically
      if (error?.code === 5114) {
        console.log("error code 5114", error.code);
        uiConsole("Login cancelled by user");
        console.log("Login cancelled by user");
        return; // Don't show error for cancellation
      }
      uiConsole("error:", error);
      console.log("error:", error);
    }
  };

  // Logout from the web3auth
  const logout = async () => {
    if (!web3auth) {
      setWeb3authConsole("Web3auth not initialized");
      return;
    }

    setWeb3authConsole("Logging out");
    await web3auth.logout();

    if (!web3auth.connected) {
      // delete the token
      await SecureStore.deleteItemAsync("web3auth_token");
      await SecureStore.deleteItemAsync("auth0_token")
      setProvider(null);
      uiConsole("Logged out");
      setLoggedIn(false);
    }
  };

  // Get the chain id
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
  // convert the balance to sui
  const balance = (balance: CoinBalance) => {
    return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
  };

  // get the balance from the address
  const getBalance = useCallback(
    async (isPolling: boolean = false) => {
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
        if (!isPolling) {
          setWeb3authConsole("Fetching balance");
        }
        const balanceResponse = await rpc?.getBalance({ owner: address });
        const suiBalance = balance(balanceResponse as CoinBalance);
        setMybalance(suiBalance);
        // only log balance when called not from interval polling
        if (!isPolling) {
          uiConsole(`Sui Balance: ${suiBalance}`);
          console.log(`Sui Balance: ${suiBalance}`);
        }
      } catch (error) {
        uiConsole("error fetching balance:", error);
        console.log("error fetching balance:", error);
      }
    },
    [provider, address, suiRPC, uiConsole]
  );

  // rquest sui fromfuacet devnet/testnet
  const requestFaucet = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const supportedNetworks = ["devnet", "testnet"];
    if (
      !supportedNetworks.includes(provider?.config?.chainConfig?.displayName)
    ) {
      uiConsole("Requesting faucet is only supported for devnet/testnet");
      console.log("Requesting faucet is only supported for devnet/testnet");
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

  // send a transaction to the recipient address
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

  // sign a message
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

      const result: SignMessageResult = {
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

  // launch web3auth browser wallet
  const launchWalletServices = async () => {
    if (!web3auth) {
      setWeb3authConsole("Web3auth not initialized");
      return;
    }

    setWeb3authConsole("Launch Wallet Services");
    await web3auth.launchWalletServices(chainConfig);
  };

  // request a signature from the wallet services
  const requestSignature = async () => {
    if (!web3auth) {
      setWeb3authConsole("Web3auth not initialized");
      return;
    }
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const address = await getAddress();
    const params = ["Hello World", address];

    setWeb3authConsole("Request Signature");
    const res = await web3auth.request(chainConfig, "personal_sign", params);
    uiConsole(res);
  };

  // subscribe to transactions
  const queryAccountActivity = useCallback(async (isPolling: boolean = false) => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const rpc = suiRPC();
    const sentTransactions = await rpc?.queryTransactionBlocks({
      filter: {
        FromAddress: address,
      },
      limit: 10,
      options:{
        showEffects: true,
        showBalanceChanges: true,
        showInput: true,
        showEvents: true,
        showObjectChanges: true,
        showRawEffects: false,
        showRawInput:false,
      },
      order: "descending",
    });
    
    const receivedTransactions = await rpc?.queryTransactionBlocks({
      filter: {
        ToAddress: address,
      },
      limit: 10,
      options: {
        showEffects: true,
        showBalanceChanges: true,
        showInput: true,
        showEvents: true,
        showObjectChanges: true,
        showRawEffects: false,
        showRawInput: false,
      },
      order: "descending",
    });

    // Get staking events
    // const stakingEvents = await rpc?.queryTransactionBlocks({
    //   filter: {
    //     MoveEvent: {
    //         type: "0x3::validator::StakingRequestEvent",
    //         // targetAddress: address,
    //         // fields: ["request_id"],
    //       },
    //     },
    //     limit: 20,
    //     order: "descending",
    //   } 
    // );

    const activity = [
      ...((sentTransactions?.data || []).map((tx: SuiTransactionBlockResponse) => {
        const delta = sumSuiDeltaFor(tx.balanceChanges, address, "::sui::SUI"); // negative when you send
        const amountMistAbs = delta < 0n ? -delta : delta;
        const gasMist = gasFeeMist(tx);
        const recipientAddr = getRecipientAddress(tx, address, "::sui::SUI");

        return {
          id: tx.digest,
          type: 'sent',
          timestamp: tx.timestampMs ?? null,
          amount: Number(amountMistAbs.toString()) / Number(MIST_PER_SUI),
          recipient: recipientAddr,
          status: tx.effects?.status?.status ?? 'unknown',
          gasFee: Number(gasMist.toString()) / Number(MIST_PER_SUI),
          raw: tx,
        };
      })),

      ...((receivedTransactions?.data || []).map((tx: SuiTransactionBlockResponse) => {
        const delta = sumSuiDeltaFor(tx.balanceChanges, address, "::sui::SUI"); // positive when you receive
        const amountMist = delta > 0n ? delta : 0n;
        const gasMist = gasFeeMist(tx);
        // const senderAddr = (tx as any).transaction?.data?.sender || 'Unknown'; // requires showInput: true
        const senderAddr = tx.transaction?.data?.sender ? normalizeSuiAddress(tx.transaction.data.sender) : 'Unknown';
        return {
          id: tx.digest,
          type: 'received',
          timestamp: tx.timestampMs ?? null,
          amount: Number(amountMist.toString()) / Number(MIST_PER_SUI),
          sender: senderAddr,
          status: tx.effects?.status?.status ?? 'unknown',
          gasFee: Number(gasMist.toString()) / Number(MIST_PER_SUI),
          raw: tx,
        };
      })),
      // staking can be added here
    ].sort((a: any, b: any) => Number(b?.timestamp) - Number(a?.timestamp) || 0);

    setAccountActivity(activity);

    return activity;

  }, [provider, address, suiRPC, uiConsole, setAccountActivity,sumSuiDeltaFor,gasFeeMist,getRecipientAddress]);


  // balance polling
  useEffect(() => {
    const startBalanceMonitoring = () => {
      if (!loggedIn || !address) return;

      const interval = setInterval(async () => {
        try {
          await getBalance(true);
          await queryAccountActivity(true);
        } catch (error) {
          console.log("Error monitoring balance:", error);
        }
      }, 4000);

      return () => clearInterval(interval);
    };
    const stopPolling = startBalanceMonitoring();
    return stopPolling;
  }, [loggedIn, address, getBalance, queryAccountActivity]);

  useEffect(() => {
    if (!address && loggedIn) {
      getAddress();
    }
  }, [address, loggedIn, getAddress]);

  const value = {
    loggedIn,
    setLoggedIn,
    address,
    setAddress,
    provider,
    setProvider,
    web3authConsole,
    setWeb3authConsole,
    emailLogin,
    setEmailLogin,
    open,
    setOpen,
    getPrivateKey,
    getKeyPair,
    clearKeyPair,
    getAddress,
    suiRPC,
    login,
    logout,
    getChainId,
    balance,
    getBalance,
    requestFaucet,
    sendTransaction,
    signMessage,
    launchWalletServices,
    requestSignature,
    getUserInfo,
    uiConsole,
    mybalance,
    setMybalance,
    accountActivity,
    setAccountActivity,
  };

  return (
    <W3SuiAuthContext.Provider value={value}>
      {children}
    </W3SuiAuthContext.Provider>
  );
};

export const useW3SuiAuth = () => {
  const context = useContext(W3SuiAuthContext);
  if (!context) {
    throw new Error("useW3SuiAuth must be used within a W3SuiAuthProvider");
  }
  return context;
};
