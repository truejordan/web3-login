import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

// Simple Web3Auth wrapper to test basic functionality
const SimpleAuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setError(null);
      console.log('Starting Web3Auth initialization...');
      
      // Test if we can import Web3Auth without errors
      const { default: Web3Auth } = await import('@web3auth/react-native-sdk');
      console.log('Web3Auth imported successfully');
      
      // Test if we can import other required modules
      const { LOGIN_PROVIDER, WEB3AUTH_NETWORK } = await import('@web3auth/react-native-sdk');
      console.log('Web3Auth modules imported successfully');
      
      // Test if we can import base modules
      const { CHAIN_NAMESPACES } = await import('@web3auth/base');
      console.log('Base modules imported successfully');
      
      setIsInitialized(true);
      console.log('Web3Auth initialization completed successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Web3Auth initialization failed:', errorMessage);
      setError(`Initialization failed: ${errorMessage}`);
    }
  };

  const testLogin = async () => {
    try {
      setError(null);
      console.log('Testing login functionality...');
      
      // Import modules dynamically to catch any import errors
      const { default: Web3Auth, LOGIN_PROVIDER, WEB3AUTH_NETWORK } = await import('@web3auth/react-native-sdk');
      const { CHAIN_NAMESPACES } = await import('@web3auth/base');
      const { CommonPrivateKeyProvider } = await import('@web3auth/base-provider');
      
      console.log('All modules imported successfully for login test');
      
      // Create a simple configuration
      const chainConfig = {
        chainNamespace: CHAIN_NAMESPACES.OTHER,
        chainId: "0x1", // Ethereum mainnet for testing
        rpcTarget: "https://rpc.ankr.com/eth",
        displayName: "Ethereum Mainnet",
        blockExplorerUrl: "https://etherscan.io",
        ticker: "ETH",
        tickerName: "Ethereum",
        logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      };

      const privateKeyProvider = new CommonPrivateKeyProvider({
        config: { chainConfig },
      });

      const web3auth = new Web3Auth(
        WebBrowser,
        SecureStore,
        {
          redirectUrl: "web3auth://auth",
          clientId: "test-client-id", // Using test ID for now
          network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
        }
      );

      console.log('Web3Auth instance created successfully');
      Alert.alert('Success', 'Web3Auth instance created successfully!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Login test failed:', errorMessage);
      setError(`Login test failed: ${errorMessage}`);
    }
  };

  const testSuiIntegration = async () => {
    try {
      setError(null);
      console.log('Testing Sui integration...');
      
      // Test Sui imports
      const { SuiClient, getFullnodeUrl } = await import('@mysten/sui/client');
      const { Ed25519Keypair } = await import('@mysten/sui/keypairs/ed25519');
      
      console.log('Sui modules imported successfully');
      
      // Test creating a Sui client
      const client = new SuiClient({
        url: getFullnodeUrl('devnet'),
      });
      
      console.log('Sui client created successfully');
      
      // Test creating a keypair
      const keypair = Ed25519Keypair.generate();
      const address = keypair.toSuiAddress();
      
      console.log('Sui keypair created successfully:', address);
      Alert.alert('Success', `Sui integration test passed! Address: ${address.slice(0, 10)}...`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Sui integration test failed:', errorMessage);
      setError(`Sui test failed: ${errorMessage}`);
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Initializing Web3Auth...</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title="Retry Initialization" onPress={initializeAuth} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Web3Auth Test Wrapper</Text>
      <Text style={styles.subtitle}>Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}</Text>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <View style={styles.buttonContainer}>
        <Button title="Test Login Setup" onPress={testLogin} />
        <Button title="Test Sui Integration" onPress={testSuiIntegration} />
        <Button 
          title={isLoggedIn ? 'Logout' : 'Login'} 
          onPress={() => setIsLoggedIn(!isLoggedIn)} 
        />
      </View>
      
      <View style={styles.childrenContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  error: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#ffe6e6',
    borderRadius: 5,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  childrenContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
});

export default SimpleAuthWrapper;
