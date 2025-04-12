import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
// import './index.css'
import App from './App.jsx'
import store from './store.js'
import { PrivyProvider } from '@privy-io/react-auth';
// import 'draft-js/dist/Draft.css';

import {toSolanaWalletConnectors} from '@privy-io/react-auth/solana';

const solanaConnectors = toSolanaWalletConnectors({
  // By default, shouldAutoConnect is enabled
  shouldAutoConnect: true
});


createRoot(document.getElementById('root')).render(

  <PrivyProvider
    appId="cm945wqj600zel40m0ffy4lhy"
    config={{
      "appearance": {
        "accentColor": "#f00000",
        "theme": "#FFFFFF",
        "showWalletLoginFirst": false,
        "logo": "https://github.com/Ayphilip/appPics/blob/main/Minimal_Padlock_Cyber_Security_Logo__1_-removebg-preview.png?raw=true",
        "walletChainType": "solana-only",
        "walletList": [
          "detected_solana_wallets",
          "solflare",
          "phantom",
          "backpack",
          "okx_wallet"
        ]
      },
      "loginMethods": [
        "wallet"
      ],
      "fundingMethodConfig": {
        "moonpay": {
          "useSandbox": true
        }
      },
      "embeddedWallets": {
        "requireUserPasswordOnCreate": false,
        "showWalletUIs": true,
        "ethereum": {
          "createOnLogin": "off"
        },
        "solana": {
          "createOnLogin": "users-without-wallets"
        }
      },
      "mfa": {
        "noPromptOnMfaRequired": false
      },
      "externalWallets": {
        "solana": {
          "connectors": solanaConnectors
        }
      }
    }}
  >
    <Provider store={store}>

      <App />
    </Provider>
  </PrivyProvider>

)




