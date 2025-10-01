This project is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.

# Web3Auth + Sui Blockchain Integration Tutorial

Hey there! 👋 Welcome to your journey into building Web3 mobile applications! This project is your friendly guide to creating amazing React Native apps with Web3Auth authentication and Sui blockchain integration. Whether you're new to Web3 or looking to add mobile support to your dApp, we've got you covered with this real-world examples.

## 🎯 What You'll Learn

This tutorial covers the complete integration of:
- **Web3Auth** for social login authentication (Google, Twitter, Apple, Email)
- **Mysten Sui SDK** for blockchain interactions
- **React Native + Expo** for cross-platform mobile development
- **HeroUI Native + NativeWind** for modern UI components

## 🚀 Quick Start

```bash
# Clone this repo and install
cd web3-login
npm install

# Set up environment variables (see setup section below)
cp .env.demo .env

# To run this project you will need to create a development build

# prebuild with npx to generate ios and android build folders
npx expo prebuild

# IOS
# Create ios dev build
npx expo run:ios  
# use the device flag to build on a real iphone
npx expo run:ios --device 
# Clean rebuild (recommended after native package installs)
npx expo prebuild --clean && npx expo run:ios

# Android
# Create android dev build
npx expo run:android  
# use the device flag to build on a real iphone
npx expo run:android --device 
# Clean rebuild (recommended after native package installs)
npx expo prebuild --clean && npx expo run:android

# Start development
npx expo start
```

## 📋 Prerequisites

- Node.js 18+
- Expo CLI
- Web3Auth account (free)
- Basic React Native knowledge

## ⚙️ Environment Setup

### 1. Essential Polyfills & Configuration

**Critical**: Web3Auth and crypto libraries require specific polyfills to work in React Native. Our project includes essential setup files:

#### `globals.ts` - Crypto & Node.js Polyfills
```typescript
import { Buffer } from "buffer";
import process from "process";
import crypto from 'react-native-quick-crypto';

// Essential for Web3Auth and Sui SDK
global.Buffer = Buffer;
global.process = process;
global.crypto = crypto;

// Browser-like environment setup
process.browser = true;
global.location = { protocol: "file:" };
```

**Why this matters:**
- **Buffer**: Required for binary data handling in crypto operations
- **Process**: Node.js process object needed by Web3Auth
- **Crypto**: Native crypto implementation for React Native
- **Location**: Browser-like environment for Web3Auth compatibility

#### `metro.config.js` - Metro Bundler Configuration
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Essential polyfills for Web3Auth
config.resolver.extraNodeModules = {
  crypto: require.resolve("react-native-quick-crypto"),
  stream: require.resolve("readable-stream"),
  buffer: require.resolve('buffer'),
  // ... other polyfills
};

module.exports = withNativeWind(config, { input: "./app/global.css" });
```

#### `babel.config.js` - Babel Configuration
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

**Required Dependencies:**
```bash
npm install buffer process react-native-quick-crypto readable-stream
npm install react-native-get-random-values react-native-url-polyfill
```

#### App Initialization (`app/_layout.tsx`)
```typescript
// Critical imports - must be at the top
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import "react-native-reanimated";
import QuickCrypto, { install as installQuickCrypto } from "react-native-quick-crypto";
import "../globals"; // Our polyfill setup
import { Buffer } from "buffer";

// Install crypto polyfill
installQuickCrypto();
if (!(global as any).QuickCrypto) (global as any).QuickCrypto = QuickCrypto;
if (typeof global !== "undefined" && (global as any).Buffer === undefined) {
  (global as any).Buffer = Buffer;
}
```

**Import Order Matters:**
1. **Polyfills first**: `react-native-get-random-values`, `react-native-url-polyfill`
2. **Crypto setup**: `react-native-quick-crypto` installation
3. **Global setup**: Import `globals.ts` for Node.js compatibility
4. **App components**: Rest of your app imports

### 2. Web3Auth Dashboard Configuration

1. **Create Account**: Sign up at [dashboard.web3auth.io](https://dashboard.web3auth.io)
2. **Create Project**: 
   - Project Type: `Web3Auth for Apps`
   - Platform: `React Native`
   - Network: `Sapphire Devnet`
3. **Configure Login Methods**:
   - ✅ Google OAuth
   - ✅ Twitter/X OAuth  
   - ✅ Apple Sign-In
   - ✅ Email Passwordless
4. **Get Credentials**: Copy your Client ID and Client Secret

### 2. Environment Variables

Create a `.env` file in your project root:

```env
# Web3Auth Configuration
EXPO_PUBLIC_CLIENT_ID=your_web3auth_client_id_here
EXPO_PUBLIC_CLIENT_SECRET=your_web3auth_client_secret_here
```

**Important**: Never commit your `.env` file to version control.

## 🏗️ Project Architecture

### Core Components

```
src/
├── contexts/w3SuiAuth.tsx     # Main authentication & blockchain context
├── components/auth/           # Authentication UI components
│   ├── AuthWrapper.tsx       # Login/logout wrapper
│   └── AuthConsole.tsx       # Debug console
├── app/(tabs)/               # Main app screens
│   ├── index.tsx            # Home screen (balance, transactions)
│   └── explore.tsx          # Explore screen (test mysten onchain functions)
```

### Key Integration Points

1. **`w3SuiAuth.tsx`**: Central context managing:
   - Web3Auth login/logout flow
   - Sui blockchain interactions
   - JWT token management
   - Real-time balance polling

2. **`AuthWrapper.tsx`**: Authentication UI with:
   - Social login buttons
   - Email passwordless login
   - Error handling

## 🔐 Authentication Flow

### Login Process
```typescript
// 1. User selects login method
login(LOGIN_PROVIDER.GOOGLE)

// 2. Web3Auth handles OAuth flow
await web3auth.login({ loginProvider, redirectUrl })

// 3. Get JWT token and store securely
const userInfo = await web3auth.userInfo()
await SecureStore.setItemAsync("web3auth_token", userInfo.idToken)

// 4. Initialize Sui keypair from private key
const privateKey = await provider.request({ method: "private_key" })
const keyPair = Ed25519Keypair.fromSecretKey(privateKeyUint8Array)
```

### Security Features
- JWT tokens stored in Expo SecureStore
- Private keys cleared from memory after use
- Automatic token validation on app restart

## ⛓️ Sui Blockchain Integration

### Key Functions

```typescript
// Get user's Sui address
const address = keyPair.toSuiAddress()

// Fetch balance
const balance = await rpc.getBalance({ owner: address })

// Send transaction
const tx = new Transaction()
tx.transferObjects([coin], tx.pure.address(recipient))
await rpc.signAndExecuteTransaction({ signer: keyPair, transaction: tx })

// Request faucet (devnet only)
await requestSuiFromFaucetV2({ host: getFaucetHost("devnet"), recipient: address })
```

### Real-time Features
- Balance polling every 4 seconds
- Automatic address generation on login
- Transaction status monitoring

## 🎨 UI Component Library

### HeroUI Native + NativeWind Setup

```bash
# Install HeroUI Native first
npm install heroui-native

# Then install NativeWind v4 (compatible version)
npm install nativewind@^4.2.1 tailwindcss@^3.4.17
```

### Custom Components

```typescript
// Themed text component
<HuiText className="text-4xl text-cyan-300">
  {balance} SUI
</HuiText>

// Themed image component  
<HuiImage 
  className="w-24 h-24"
  source="https://example.com/logo.svg"
  resizeMode="contain"
/>
```

## 🔧 Development Workflow

### Running the App
```bash
# Development server
npx expo start

# Platform-specific builds
npx expo run:ios
npx expo run:android
npx expo start --web
```

### Testing Blockchain Features
1. **Login**: Use any supported method
2. **Get Address**: Automatically generated on login
3. **Request Faucet**: Get test SUI tokens (devnet only)
4. **Send Transaction**: Transfer SUI to another address
5. **View Balance**: Real-time updates every 4 seconds

## 📚 Learning Resources

### Official Documentation
- [Web3Auth React Native SDK](https://web3auth.io/docs/sdk/mobile/pnp/react-native)
- [Mysten Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [HeroUI Native Components](https://github.com/heroui-inc/heroui-native)
- [NativeWind Documentation](https://www.nativewind.dev/)

### Key Concepts to Understand

1. **Account Abstraction**: Web3Auth provides embedded wallets
2. **JWT Authentication**: Stateless authentication with tokens
3. **Sui Move**: Sui's programming language for smart contracts
4. **Gasless Transactions**: Sui's unique transaction model
5. **Object-Centric Model**: Sui's approach to blockchain state

## 🐛 Common Issues & Solutions

### Authentication Issues
- **"Missing Client ID"**: Check `.env` file and restart server
- **Login not working**: Verify Web3Auth project configuration
- **Redirect errors**: Ensure redirect URLs match your setup

### Blockchain Issues  
- **Balance not updating**: Check network connection and devnet status
- **Transaction failures**: Verify recipient address and sufficient balance
- **Faucet errors**: Ensure you're on devnet/testnet

### Build Issues
- **Metro bundler errors**: Clear cache with `npx expo start --clear`
- **Dependency conflicts**: Delete `node_modules` and reinstall

### Polyfill & Crypto Issues
- **"Buffer is not defined"**: Ensure `globals.ts` is imported in `_layout.tsx`
- **"crypto.subtle is not available"**: Check `react-native-quick-crypto` installation
- **"process is not defined"**: Verify process polyfill in `globals.ts`
- **Web3Auth initialization fails**: Check import order in `_layout.tsx`
- **Metro bundler can't resolve modules**: Verify `metro.config.js` extraNodeModules

## 🚀 Next Steps

After mastering this integration, consider:

1. **Smart Contract Integration**: Deploy and interact with Move contracts
2. **NFT Support**: Mint and manage Sui NFTs
3. **Multi-chain Support**: Add other blockchain networks
4. **Advanced UI**: Custom animations and gestures
5. **Production Deployment**: App store submission process

## 💡 Pro Tips

- Use TypeScript for better type safety
- Implement proper error boundaries
- Add loading states for better UX
- Test on both iOS and Android
- Monitor gas fees and network status
- Keep private keys secure at all times

---

**Ready to build the future of Web3 mobile apps? Start with this foundation and expand from here! 🚀**
