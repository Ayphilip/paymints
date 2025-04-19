import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, getMint, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
// import { getAccount } from '@solana/spl-token';
const SOLANA_RPC = "https://mainnet.helius-rpc.com/?api-key=3ab17e93-2cda-4743-88e9-2b9beae7c07e";
const SOLANA_CONFIG = {
  rpcEndpoint: process.env.REACT_APP_SOLANA_RPC || SOLANA_RPC,
  commitment: 'confirmed',
  pollingInterval: 30000, // 30 seconds
};

export const shortenAddress = (addr) => {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
};

export const networkType = [
  'mainet',
  'testnet'
]

export const networkConfig = [
  {
    chainId: 1, // Ethereum Mainnet
    name: "Ethereum Mainnet",
    type: "0",
    icon: "ethereumIcon", // Placeholder for icon
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      icon: "ethereumIcon",
      contractAddress: null, // Native currency, no contract address
    },
    majorTokens: [
      {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        icon: "ethereumIcon",
        contractAddress: null, // Native currency
      },
      {
        name: "Tether",
        symbol: "USDT",
        decimals: 6,
        contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        icon: "tetherIcon",
      },
      {
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        icon: "usdcIcon",
      },
    ],
  },
  {
    chainId: 3, // Ethereum Mainnet
    name: "BASE Mainnet",
    type: "0",
    icon: "ethereumIcon", // Placeholder for icon
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "BASE",
      decimals: 18,
      icon: "ethereumIcon",
      contractAddress: null, // Native currency, no contract address
    },
    majorTokens: [
      {
        name: "Ether",
        symbol: "BASE",
        decimals: 18,
        icon: "ethereumIcon",
        contractAddress: null, // Native currency
      },
      {
        name: "Tether",
        symbol: "USDT",
        decimals: 6,
        contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        icon: "tetherIcon",
      },
      {
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        icon: "usdcIcon",
      },
    ],
  },
  {
    chainId: 11155111, // Ethereum Sepolia Testnet
    name: "Sepolia Testnet",
    type: "1",
    icon: "ethereumIcon",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "SEP",
      decimals: 18,
      icon: "ethereumIcon",
      contractAddress: null, // Native currency, no contract address
    },
    majorTokens: [
      {
        name: "Sepolia Ether",
        symbol: "SEP",
        decimals: 18,
        icon: "ethereumIcon",
        contractAddress: null, // Native currency
      },
      // Testnet tokens like USDT or USDC don’t have fixed addresses; they’re typically deployed ad-hoc
      // Example placeholder for a test token (if deployed):
      /*
      {
        name: "Test Tether",
        symbol: "tUSDT",
        decimals: 6,
        contractAddress: "0x...deployed_address...", // Must be deployed manually on Sepolia
        icon: "tetherIcon",
      },
      */
    ],
  },
  {
    chainId: null, // Solana Mainnet (not EVM-compatible, no chainId)
    name: "Solana Mainnet",
    type: "0",
    icon: "solanaIcon",
    rpcUrl: "https://api.mainnet-beta.solana.com",
    blockExplorer: "https://solscan.io",
    nativeCurrency: {
      name: "Solana",
      symbol: "SOL",
      decimals: 9,
      icon: "solanaIcon",
      contractAddress: null, // Native currency, no contract address
    },
    majorTokens: [
      {
        name: "Solana",
        symbol: "SOL",
        decimals: 9,
        icon: "solanaIcon",
        contractAddress: null, // Native currency
      },
      {
        name: "Tether",
        symbol: "USDT",
        decimals: 6,
        contractAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // Solana SPL token address
        icon: "tetherIcon",
      },
      {
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        contractAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Solana SPL token address
        icon: "usdcIcon",
      },
    ],
  },
  {
    chainId: null, // Solana Devnet (testnet equivalent)
    name: "Solana Devnet",
    type: "1",
    icon: "solanaIcon",
    rpcUrl: "https://api.devnet.solana.com",
    blockExplorer: "https://solscan.io?cluster=devnet",
    nativeCurrency: {
      name: "Devnet Solana",
      symbol: "dSOL",
      decimals: 9,
      icon: "solanaIcon",
      contractAddress: null, // Native currency, no contract address
    },
    majorTokens: [
      {
        name: "Devnet Solana",
        symbol: "dSOL",
        decimals: 9,
        icon: "solanaIcon",
        contractAddress: null, // Native currency
      },
      // Devnet tokens like USDT or USDC don’t have fixed addresses; they’re typically minted for testing
      // Example placeholder for a test token (if minted):
      /*
      {
        name: "Test USDT",
        symbol: "tUSDT",
        decimals: 6,
        contractAddress: "MintedAddressOnDevnet", // Must be minted manually on Devnet
        icon: "tetherIcon",
      },
      */
    ],
  },
];


export const useTokenBalance = (tokenMint) => {
  const { wallets } = useSolanaWallets();
  const { user } = usePrivy()
  const [state, setState] = useState({
    balance: null,          // Human-readable balance
    rawBalance: null,       // Raw lamport balance
    decimals: null,         // Token decimals
    isLoading: false,
    error: null,
    isWalletVerified: false // Track wallet verification status
  });

  // Memoized connection instance
  const getConnection = useCallback(() => {
    return new Connection(SOLANA_CONFIG.rpcEndpoint, SOLANA_CONFIG.commitment);
  }, []);

  // Fetch token balance
  const fetchBalance = useCallback(async () => {
    const wall = user?.wallet?.address; 

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {

      const connection = getConnection();
      console.log(wall)
      const walletPubKey = new PublicKey(wall);
      const mintPubKey = new PublicKey(tokenMint);


      const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        walletPubKey, // payer
        mintPubKey,
        walletPubKey, // recipient wallet
        true // allowOwnerOffCurve
      );
      const mintInfo = await getMint(connection, mintPubKey);
      const decimals = mintInfo.decimals;
      const rawBalance = ata.amount; // Already a BigInt from getAccount
      const balance = Number(rawBalance) / Math.pow(10, decimals);

      console.log('Raw balance:', rawBalance.toString());
      console.log('Decimals:', decimals);
      console.log('Calculated balance:', balance);

      setState(prev => ({
        ...prev,
        balance,
        rawBalance,
        decimals,
        isLoading: false,
        error: null
      }));
    } catch (err) {
      console.error('Error fetching token balance:', err);
      setState(prev => ({
        ...prev,
        balance: 0,
        rawBalance: BigInt(0),
        decimals: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }));
    }
  }, [wallets, tokenMint, getConnection]);

  // Effect for initial fetch and polling
  useEffect(() => {
    let mounted = true;
    let intervalId;

    const startPolling = async () => {
      if (mounted) {
        await fetchBalance();
        intervalId = setInterval(fetchBalance, SOLANA_CONFIG.pollingInterval);
      }
    };

    startPolling();

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchBalance]);

  // Debounced refresh function
  const refreshBalance = useCallback(() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fetchBalance, 500);
    };
  }, [fetchBalance]);

  return {
    ...state,
    refetch: refreshBalance()
  };
};




export const orderContext = [
  "Service Information",
  "Service Setup",
  "Other Information",
  "Finalizing"
]

export const invoiceType = [
  {
    name: "Donation",
    intro: "The Donation invoice template is crafted for nonprofits, charities, or personal causes looking to raise funds in a respectful and professional manner. It allows supporters to contribute voluntarily without expecting goods or services in return. The invoice format supports public sharing, QR codes for easier crypto payments, and even tip functionality for donors who want to give extra. Donation invoices often carry a message of appreciation and can include recurring cycles for regular contributions. This setup simplifies fundraising while offering transparency and an effortless giving experience.",
    formDatas: {
      // General Meta
      orderNo: "",
      orderType: "invoice", // or "payroll"
      orderTitle: "",
      orderImage: "",
      orderDescription: "",
      createdAt: new Date().toISOString(),
      orderStatus: "0",

      // Invoice Specific
      invoiceType: 0,
      clientName: "",
      clientWallet: "",
      clientEmail: "",
      isClientInformation: false,
      clientAddress: "",
      isExpirable: false,
      dueDate: "",
      discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
      tipOptionEnabled: true,
      invoiceVisibility: "private", // or "public"
      autoEmailReceipt: true,
      QRcodeEnabled: true,

      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Payroll Specific
      isPayroll: false,
      payrollType: 0,
      paymentType: 0,
      payrollPeriod: "",
      payCycleStart: "",
      payCycleEnd: "",
      recipients: [],

      // Blockchain Info
      stablecoinSymbol: "",
      chain: "SOL",
      tokenAddress: "",
      decimals: 6,
      network: "0",
      transactionHash: "",
      gasEstimateUSD: 0,

      // UI & Templates
      previewTemplate: "modern",
      notes: "",
      termsAndConditions: "",

      // Automation
      autoReduceStockOnPay: true,
      recurringCycle: "",
    }
  },
  {
    name: "Freelance",
    intro: "The Freelance invoice template is ideal for individual contractors or gig workers billing clients for one-off or ongoing services. It includes a clear breakdown of tasks, hourly or flat rates, and supports tips and discounts. This template enhances transparency between freelancers and clients, giving a professional feel with custom branding, crypto wallet support, and optional auto-generated receipts. Whether it's design work, writing, or development, this format simplifies the payment process while tracking deliverables.",
    formDatas: {
      // General Meta
      orderNo: "",
      orderType: "invoice", // or "payroll"
      orderTitle: "",
      orderImage: "",
      orderDescription: "",
      createdAt: new Date().toISOString(),
      orderStatus: "0",

      // Invoice Specific
      invoiceType: 1,
      clientName: "",
      clientWallet: "",
      clientEmail: "",
      isClientInformation: false,
      clientAddress: "",
      isExpirable: false,
      dueDate: "",
      discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
      tipOptionEnabled: true,
      invoiceVisibility: "private", // or "public"
      autoEmailReceipt: true,
      QRcodeEnabled: true,

      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Payroll Specific
      isPayroll: false,
      payrollType: 0,
      paymentType: 0,
      payrollPeriod: "",
      payCycleStart: "",
      payCycleEnd: "",
      recipients: [],

      // Blockchain Info
      stablecoinSymbol: "",
      chain: "SOL",
      tokenAddress: "",
      decimals: 6,
      network: "0",
      transactionHash: "",
      gasEstimateUSD: 0,

      // UI & Templates
      previewTemplate: "modern",
      notes: "",
      termsAndConditions: "",

      // Automation
      autoReduceStockOnPay: true,
      recurringCycle: "",
    }
  },
  {
    name: "Merchant Sale",
    intro: "The Merchant Sale invoice template is designed for online or retail merchants selling physical or digital goods. It supports stock tracking, SKU codes, product images, and automated total calculations based on quantity and unit price. The invoice can include tax configurations and public sharing for broader visibility. With QR code integration and auto stock reduction enabled, this setup is perfect for businesses accepting payments in stablecoins or other tokens.",
    formDatas: {
      // General Meta
      orderNo: "",
      orderType: "invoice", // or "payroll"
      orderTitle: "",
      orderImage: "",
      orderDescription: "",
      createdAt: new Date().toISOString(),
      orderStatus: "0",

      // Invoice Specific
      invoiceType: 2,
      clientName: "",
      clientWallet: "",
      clientEmail: "",
      isClientInformation: false,
      clientAddress: "",
      isExpirable: false,
      dueDate: "",
      discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
      tipOptionEnabled: true,
      invoiceVisibility: "private", // or "public"
      autoEmailReceipt: true,
      QRcodeEnabled: true,

      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Payroll Specific
      isPayroll: false,
      payrollType: 0,
      paymentType: 0,
      payrollPeriod: "",
      payCycleStart: "",
      payCycleEnd: "",
      recipients: [],

      // Blockchain Info
      stablecoinSymbol: "",
      chain: "SOL",
      tokenAddress: "",
      decimals: 6,
      network: "0",
      transactionHash: "",
      gasEstimateUSD: 0,

      // UI & Templates
      previewTemplate: "modern",
      notes: "",
      termsAndConditions: "",

      // Automation
      autoReduceStockOnPay: true,
      recurringCycle: "",
    }
  },
  {
    name: "Multi Service",
    intro: "The Multi Service invoice template is built for service providers offering bundled services under a single invoice. Whether you're a marketing agency or a full-stack developer offering design, dev, and deployment, this format supports multiple line items, detailed descriptions, and itemized billing. It gives your clients a clear view of each service and its cost while supporting crypto transactions, optional tipping, and automated receipt delivery.",
    formDatas: {
      // General Meta
      orderNo: "",
      orderType: "invoice", // or "payroll"
      orderTitle: "",
      orderImage: "",
      orderDescription: "",
      createdAt: new Date().toISOString(),
      orderStatus: "0",

      // Invoice Specific
      invoiceType: 3,
      clientName: "",
      clientWallet: "",
      clientEmail: "",
      isClientInformation: false,
      clientAddress: "",
      isExpirable: false,
      dueDate: "",
      discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
      tipOptionEnabled: true,
      invoiceVisibility: "private", // or "public"
      autoEmailReceipt: true,
      QRcodeEnabled: true,

      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Payroll Specific
      isPayroll: false,
      payrollType: 0,
      paymentType: 0,
      payrollPeriod: "",
      payCycleStart: "",
      payCycleEnd: "",
      recipients: [],

      // Blockchain Info
      stablecoinSymbol: "",
      chain: "SOL",
      tokenAddress: "",
      decimals: 6,
      network: "0",
      transactionHash: "",
      gasEstimateUSD: 0,

      // UI & Templates
      previewTemplate: "modern",
      notes: "",
      termsAndConditions: "",

      // Automation
      autoReduceStockOnPay: true,
      recurringCycle: "",
    }
  },
  {
    name: "Presale",
    intro: "The Presale invoice template is tailored for projects offering early access or prelaunch deals for products or services. This template is useful for startups, NFT collections, or limited edition product launches. It typically includes special discount codes, expiry dates, and QR code options for fast checkout. Designed to build early traction, it allows users to securely reserve a product or service before official launch.",
    formDatas: {
      // General Meta
      orderNo: "",
      orderType: "invoice", // or "payroll"
      orderTitle: "",
      orderImage: "",
      orderDescription: "",
      createdAt: new Date().toISOString(),
      orderStatus: "0",

      // Invoice Specific
      invoiceType: 4,
      clientName: "",
      clientWallet: "",
      clientEmail: "",
      isClientInformation: false,
      clientAddress: "",
      isExpirable: false,
      dueDate: "",
      discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
      tipOptionEnabled: true,
      invoiceVisibility: "private", // or "public"
      autoEmailReceipt: true,
      QRcodeEnabled: true,

      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Payroll Specific
      isPayroll: false,
      payrollType: 0,
      paymentType: 0,
      payrollPeriod: "",
      payCycleStart: "",
      payCycleEnd: "",
      recipients: [],

      // Blockchain Info
      stablecoinSymbol: "",
      chain: "SOL",
      tokenAddress: "",
      decimals: 6,
      network: "0",
      transactionHash: "",
      gasEstimateUSD: 0,

      // UI & Templates
      previewTemplate: "modern",
      notes: "",
      termsAndConditions: "",

      // Automation
      autoReduceStockOnPay: true,
      recurringCycle: "",
    }
  },
  {
    name: "Subscription",
    intro: "The Subscription invoice template enables creators, SaaS products, or membership communities to charge users on a recurring basis. It supports customizable billing cycles, QR code payments, and options for private or public invoice visibility. This setup works well for recurring donations, premium access, content subscriptions, or retainers. With automation-friendly settings, it simplifies monthly revenue tracking while providing consistency for subscribers.",
    formDatas: {
      // General Meta
      orderNo: "",
      orderType: "invoice", // or "payroll"
      orderTitle: "",
      orderImage: "",
      orderDescription: "",
      createdAt: new Date().toISOString(),
      orderStatus: "0",

      // Invoice Specific
      invoiceType: 5,
      clientName: "",
      clientWallet: "",
      clientEmail: "",
      isClientInformation: false,
      clientAddress: "",
      isExpirable: false,
      dueDate: "",
      discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
      tipOptionEnabled: true,
      invoiceVisibility: "private", // or "public"
      autoEmailReceipt: true,
      QRcodeEnabled: true,

      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Payroll Specific
      isPayroll: false,
      payrollType: 0,
      paymentType: 0,
      payrollPeriod: "",
      payCycleStart: "",
      payCycleEnd: "",
      recipients: [],

      // Blockchain Info
      stablecoinSymbol: "",
      chain: "SOL",
      tokenAddress: "",
      decimals: 6,
      network: "0",
      transactionHash: "",
      gasEstimateUSD: 0,

      // UI & Templates
      previewTemplate: "modern",
      notes: "",
      termsAndConditions: "",

      // Automation
      autoReduceStockOnPay: true,
      recurringCycle: "",
    }
  },
  {
    name: "Standard",
    intro: "The Standard invoice template is a universal format for general-purpose billing. Whether it's a one-time product sale, a simple service engagement, or internal transactions, this clean and customizable template provides all essential fields like items, tax, discount, and total. It supports crypto wallet details, public or private access, and optional receipt automation—making it a great starting point for any type of billing.",
    formDatas: {
      // General Meta
      orderNo: "",
      orderType: "invoice", // or "payroll"
      orderTitle: "",
      orderImage: "",
      orderDescription: "",
      createdAt: new Date().toISOString(),
      orderStatus: "0",

      // Invoice Specific
      invoiceType: 6,
      clientName: "",
      clientWallet: "",
      clientEmail: "",
      isClientInformation: false,
      clientAddress: "",
      isExpirable: false,
      dueDate: "",
      discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
      tipOptionEnabled: true,
      invoiceVisibility: "private", // or "public"
      autoEmailReceipt: true,
      QRcodeEnabled: true,

      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Payroll Specific
      isPayroll: false,
      payrollType: 0,
      paymentType: 0,
      payrollPeriod: "",
      payCycleStart: "",
      payCycleEnd: "",
      recipients: [],

      // Blockchain Info
      stablecoinSymbol: "",
      chain: "SOL",
      tokenAddress: "",
      decimals: 6,
      network: "0",
      transactionHash: "",
      gasEstimateUSD: 0,

      // UI & Templates
      previewTemplate: "modern",
      notes: "",
      termsAndConditions: "",

      // Automation
      autoReduceStockOnPay: true,
      recurringCycle: "",
    }
  }
];

export const payrollType = [
  {
    name: "Fixed Salary",
    intro: "The Fixed Salary payroll template is designed for companies and DAOs that pay workers a set amount on a recurring schedule. It’s perfect for full-time staff whose compensation doesn’t change frequently. This template supports tax and bonus handling, and auto-tracks net pay and disbursement status. Integrated with crypto wallets and blockchains, it also enables smooth on-chain payroll distribution with full traceability and automation potential.",
    formDatas: {
      // General Meta
      orderNo: "",
      orderType: "invoice", // or "payroll"
      orderTitle: "",
      orderImage: "",
      orderDescription: "",
      createdAt: new Date().toISOString(),
      orderStatus: "0",

      // Invoice Specific
      invoiceType: 0,
      clientName: "",
      clientWallet: "",
      clientEmail: "",
      isClientInformation: false,
      clientAddress: "",
      isExpirable: false,
      dueDate: "",
      discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
      tipOptionEnabled: true,
      invoiceVisibility: "private", // or "public"
      autoEmailReceipt: true,
      QRcodeEnabled: true,

      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Payroll Specific
      isPayroll: false,
      payrollType: 0,
      paymentType: 0,
      payrollPeriod: "",
      payCycleStart: "",
      payCycleEnd: "",
      recipients: [],

      // Blockchain Info
      stablecoinSymbol: "",
      chain: "SOL",
      tokenAddress: "",
      decimals: 6,
      network: "0",
      transactionHash: "",
      gasEstimateUSD: 0,

      // UI & Templates
      previewTemplate: "modern",
      notes: "",
      termsAndConditions: "",

      // Automation
      autoReduceStockOnPay: true,
      recurringCycle: "",
    }
  },
  {
    name: "Hourly",
    intro: "The Hourly payroll template allows accurate tracking and payment for contractors or employees based on hours worked. It supports entering hourly rates, total hours, deductions, and net pay calculation. Great for freelancers, part-time workers, or project-based tasks, this template simplifies crypto-based hourly compensation and enables automated monthly/weekly scheduling.",
    formDatas: {
      // General Meta
      orderNo: "",
      orderType: "invoice", // or "payroll"
      orderTitle: "",
      orderImage: "",
      orderDescription: "",
      createdAt: new Date().toISOString(),
      orderStatus: "0",

      // Invoice Specific
      invoiceType: 0,
      clientName: "",
      clientWallet: "",
      clientEmail: "",
      isClientInformation: false,
      clientAddress: "",
      isExpirable: false,
      dueDate: "",
      discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
      tipOptionEnabled: true,
      invoiceVisibility: "private", // or "public"
      autoEmailReceipt: true,
      QRcodeEnabled: true,

      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Payroll Specific
      isPayroll: false,
      payrollType: 1,
      paymentType: 0,
      payrollPeriod: "",
      payCycleStart: "",
      payCycleEnd: "",
      recipients: [],

      // Blockchain Info
      stablecoinSymbol: "",
      chain: "SOL",
      tokenAddress: "",
      decimals: 6,
      network: "0",
      transactionHash: "",
      gasEstimateUSD: 0,

      // UI & Templates
      previewTemplate: "modern",
      notes: "",
      termsAndConditions: "",

      // Automation
      autoReduceStockOnPay: true,
      recurringCycle: "",
    }
  },
  {
    name: "Bonus Only",
    intro: "The Bonus Only payroll template helps organizations distribute bonuses separate from standard salaries. It's ideal for rewarding exceptional work, one-time incentives, or seasonal bonuses. Each recipient's wallet, bonus value, and optional notes are included, with blockchain support for crypto-based transfers. It’s especially useful for DAOs or Web3 startups that reward contributors after project milestones or community events.",
    formDatas: {
      // General Meta
      orderNo: "",
      orderType: "invoice", // or "payroll"
      orderTitle: "",
      orderImage: "",
      orderDescription: "",
      createdAt: new Date().toISOString(),
      orderStatus: "0",

      // Invoice Specific
      invoiceType: 1,
      clientName: "",
      clientWallet: "",
      clientEmail: "",
      isClientInformation: false,
      clientAddress: "",
      isExpirable: false,
      dueDate: "",
      discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
      tipOptionEnabled: true,
      invoiceVisibility: "private", // or "public"
      autoEmailReceipt: true,
      QRcodeEnabled: true,

      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Payroll Specific
      isPayroll: false,
      payrollType: 2,
      paymentType: 0,
      payrollPeriod: "",
      payCycleStart: "",
      payCycleEnd: "",
      recipients: [],

      // Blockchain Info
      stablecoinSymbol: "",
      chain: "SOL",
      tokenAddress: "",
      decimals: 6,
      network: "0",
      transactionHash: "",
      gasEstimateUSD: 0,

      // UI & Templates
      previewTemplate: "modern",
      notes: "",
      termsAndConditions: "",

      // Automation
      autoReduceStockOnPay: true,
      recurringCycle: "",
    }
  },
  {
    name: "Bounty",
    intro: "The Bounty payroll template is suited for reward-based work, where contributors are compensated for completing specific tasks or challenges. Used commonly in hackathons, open-source, or bug bounty programs, this format tracks contributor details, wallet addresses, bounty descriptions, and payment status. It offers transparency and fairness while helping DAOs manage one-time contributors efficiently.",
    formDatas: {
      // General Meta
      orderNo: "",
      orderType: "invoice", // or "payroll"
      orderTitle: "",
      orderImage: "",
      orderDescription: "",
      createdAt: new Date().toISOString(),
      orderStatus: "0",

      // Invoice Specific
      invoiceType: 0,
      clientName: "",
      clientWallet: "",
      clientEmail: "",
      isClientInformation: false,
      clientAddress: "",
      isExpirable: false,
      dueDate: "",
      discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
      tipOptionEnabled: true,
      invoiceVisibility: "private", // or "public"
      autoEmailReceipt: true,
      QRcodeEnabled: true,

      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Payroll Specific
      isPayroll: false,
      payrollType: 3,
      paymentType: 0,
      payrollPeriod: "",
      payCycleStart: "",
      payCycleEnd: "",
      recipients: [],

      // Blockchain Info
      stablecoinSymbol: "",
      chain: "SOL",
      tokenAddress: "",
      decimals: 6,
      network: "0",
      transactionHash: "",
      gasEstimateUSD: 0,

      // UI & Templates
      previewTemplate: "modern",
      notes: "",
      termsAndConditions: "",

      // Automation
      autoReduceStockOnPay: true,
      recurringCycle: "",
    }
  },
  {
    name: "Retroactive",
    intro: "The Retroactive payroll template is used when compensating individuals for work done in the past, often without a prior agreement. It’s widely used in decentralized environments where contributors step up without formal contracts. This format allows managers to reward them fairly with crypto, including backdated periods, bonuses, and memo fields for transparency. Ideal for DAOs and communities practicing retroactive public goods funding.",
    formDatas: {
      // General Meta
      orderNo: "",
      orderType: "invoice", // or "payroll"
      orderTitle: "",
      orderImage: "",
      orderDescription: "",
      createdAt: new Date().toISOString(),
      orderStatus: "0",

      // Invoice Specific
      invoiceType: 0,
      clientName: "",
      clientWallet: "",
      clientEmail: "",
      isClientInformation: false,
      clientAddress: "",
      isExpirable: false,
      dueDate: "",
      discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
      tipOptionEnabled: true,
      invoiceVisibility: "private", // or "public"
      autoEmailReceipt: true,
      QRcodeEnabled: true,

      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Payroll Specific
      isPayroll: false,
      payrollType: 4,
      paymentType: 0,
      payrollPeriod: "",
      payCycleStart: "",
      payCycleEnd: "",
      recipients: [],

      // Blockchain Info
      stablecoinSymbol: "",
      chain: "SOL",
      tokenAddress: "",
      decimals: 6,
      network: "0",
      transactionHash: "",
      gasEstimateUSD: 0,

      // UI & Templates
      previewTemplate: "modern",
      notes: "",
      termsAndConditions: "",

      // Automation
      autoReduceStockOnPay: true,
      recurringCycle: "",
    }
  }
];

export const defaultData = {
  // General Meta
  orderNo: "",
  orderType: "invoice", // or "payroll"
  orderTitle: "",
  orderImage: "",
  orderDescription: "",
  createdAt: new Date().toISOString(),
  orderStatus: "0",

  // Invoice Specific
  invoiceType: 0,
  clientName: "",
  clientWallet: "",
  clientEmail: "",
  isClientInformation: false,
  clientAddress: "",
  isExpirable: false,
  dueDate: "",
  discountCodes: [], // [{ code: "HACK25", discountPercent: 25 }]
  tipOptionEnabled: true,
  invoiceVisibility: "private", // or "public"
  autoEmailReceipt: true,
  QRcodeEnabled: true,

  items: [
  ],
  subtotal: 0,
  discount: 0,
  taxRate: 0,
  taxAmount: 0,
  totalAmount: 0,

  // Payroll Specific
  isPayroll: false,
  payrollType: 0,
  paymentType: 0,
  payrollPeriod: "",
  payCycleStart: "",
  payCycleEnd: "",
  recipients: [
  ],

  // Blockchain Info
  stablecoinSymbol: "",
  chain: "SOL",
  tokenAddress: "",
  decimals: 6,
  network: "0",
  transactionHash: "",
  gasEstimateUSD: 0,

  // UI & Templates
  previewTemplate: "modern",
  notes: "",
  termsAndConditions: "",

  // Automation
  autoReduceStockOnPay: true,
  recurringCycle: "",
}

export const payrollInterval = [
  "One-Time Payment",
  "Recurring Payment"
]

export function generate7DigitId() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}