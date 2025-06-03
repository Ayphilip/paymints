import React, { useEffect, useMemo, useState } from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useConnectWallet } from "@privy-io/react-auth";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { Transaction, PublicKey, Connection } from "@solana/web3.js";
import axios from "axios";

export default function Homes() {
  const { user, authenticated } = usePrivy();
  const { connectWallet } = useConnectWallet();
  const { wallets, signTransaction } = useSolanaWallets();

  // Memoized Solana Devnet connection
  const connection = useMemo(() => {
    return new Connection("https://api.devnet.solana.com", "confirmed");
  }, []);

  const solanaWallet = wallets.find((wallet) => wallet.type === 'solana');

  useEffect(() => {
      
          if ( solanaWallet) return;
  
          const reconnectWallet = async () => {
              
              try {
                  // Check linked accounts for a Solana wallet
                  const walletAccount = user?.linkedAccounts.find(
                      (account) => account.type === 'wallet' && account.chainType === 'solana'
                  );
  
                  if (walletAccount) {
                      // Attempt to reconnect the wallet
                      await connectWallet({
                          chain: 'solana',
                          address: walletAccount.address,
                          connectorType: walletAccount.connectorType, // e.g., 'injected' for Phantom/Solflare
                      });
                      
                      console.log('Wallet reconnected:', walletAccount.address);
                  }
              } catch (err) {
                  console.error('Failed to reconnect wallet:', err);
                  // Fallback to prompting user to reconnect
              } finally {
                  
              }
          };
  
          if(!solanaWallet){reconnectWallet();}
      }, [ solanaWallet]);

  // State for form inputs
  const [employee, setEmployee] = useState("");
  const [mint, setMint] = useState("Bbqg1M4YVVfbhEzwA9SpC9FhsaG83YMTYoR4a8oTDLX");
  const [amount, setAmount] = useState("");
  const [isVesting, setIsVesting] = useState(true);
  const [vestUntil, setVestUntil] = useState("");
  const [recipient, setRecipient] = useState("");
  const [vestingAccount, setVestingAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5123";
  const publicKey = user?.wallet?.address ? new PublicKey(user.wallet.address) : null;

  // Utility to validate Solana public keys
  const isValidPublicKey = (address) => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  // Ensure Associated Token Account (ATA) exists
  const ensureATA = async (mint, owner) => {
    try {
      const mintPubkey = new PublicKey(mint);
      const ata = await getAssociatedTokenAddress(mintPubkey, owner, true);
      const accountInfo = await connection.getAccountInfo(ata);

      if (!accountInfo) {
        const tx = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            owner, // payer
            ata, // ATA address
            owner, // owner
            mintPubkey // mint
          )
        );
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = owner;
        const signedTx = await solanaWallet.signTransaction(tx);
        const txId = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(txId);
      }
      return ata;
    } catch (err) {
      throw new Error(`Failed to ensure ATA: ${err.message}`);
    }
  };

  // Create vesting account
  const createVesting = async () => {
    if (!authenticated || !publicKey || !signTransaction) {
      alert("Please connect your wallet");
      return;
    }
    if (!isValidPublicKey(employee)) {
      alert("Invalid employee address");
      return;
    }
    if (!isValidPublicKey(mint)) {
      alert("Invalid mint address");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Invalid amount");
      return;
    }
    if (isVesting && !vestUntil) {
      alert("Please specify a vesting end date");
      return;
    }

    setIsLoading(true);
    try {
      const mintPubkey = new PublicKey(mint);
      await ensureATA(mintPubkey, publicKey);
      await ensureATA(mintPubkey, new PublicKey(employee));

      const response = await axios.post(`${backendUrl}/create-vesting`, {
        employer: publicKey.toBase58(),
        employee,
        mint,
        amount: parsedAmount,
        isVesting,
        vestUntil: isVesting
          ? Math.floor(new Date(vestUntil).getTime() / 1000).toString()
          : null,
      });

      const tx = Transaction.from(Buffer.from(response.data.transaction, "base64"));
      const signedTx = await signTransaction(tx);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);

      alert(`Vesting created: ${txId}`);
    } catch (err) {
      console.error(err);
      alert(`Error creating vesting: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Claim vested tokens
  const claimVested = async () => {
    if (!authenticated || !publicKey || !signTransaction) {
      alert("Please connect your wallet");
      return;
    }
    if (!isValidPublicKey(mint)) {
      alert("Invalid mint address");
      return;
    }
    if (!isValidPublicKey(vestingAccount)) {
      alert("Invalid vesting account address");
      return;
    }

    setIsLoading(true);
    try {
      const mintPubkey = new PublicKey(mint);
      await ensureATA(mintPubkey, publicKey);

      const response = await axios.post(`${backendUrl}/claim-vested`, {
        employee: publicKey.toBase58(),
        mint,
        vestingAccount,
      });

      const tx = Transaction.from(Buffer.from(response.data.transaction, "base64"));
      const signedTx = await signTransaction(tx);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);

      alert(`Tokens claimed: ${txId}`);
    } catch (err) {
      console.error(err);
      alert(`Error claiming tokens: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Send tokens
  const sendTokens = async () => {
    if (!publicKey) {
      alert("Please connect your wallet");
      return;
    }
    if (!isValidPublicKey(recipient)) {
      alert("Invalid recipient address");
      return;
    }
    if (!isValidPublicKey(mint)) {
      alert("Invalid mint address");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Invalid amount");
      return;
    }

    setIsLoading(true);
    try {
      const mintPubkey = new PublicKey(mint);
      await ensureATA(mint, publicKey);
      await ensureATA(mint, new PublicKey(recipient));

      const response = await axios.post(`${backendUrl}/api/payments/new`, {
        paymentDescription: "Test",
        receiver: recipient,
        sender: publicKey.toBase58(),
        totalAmount: parsedAmount,
        serviceType: "standard",
        paymentDate: new Date().toISOString(),
        paymentStatus: "pending",
        mintAddress: mint,
      });

      console.log('------------------------------------')

      const tx = Transaction.from(Buffer.from(response.data.transaction, "base64"));
      const signedTx = await signTransaction(tx);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);

      alert(`Tokens sent: ${txId}`);
    } catch (err) {
      console.error(err);
      alert(`Error sending tokens: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Deposit to pool
  const depositToPool = async () => {
    if (!authenticated || !publicKey || !signTransaction) {
      alert("Please connect your wallet");
      return;
    }
    if (!isValidPublicKey(mint)) {
      alert("Invalid mint address");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Invalid amount");
      return;
    }

    setIsLoading(true);
    try {
      const mintPubkey = new PublicKey(mint);
      await ensureATA(mintPubkey, publicKey);

      const response = await axios.post(`${backendUrl}/deposit-to-pool`, {
        user: publicKey.toBase58(),
        mint,
        amount: parsedAmount,
      });

      const tx = Transaction.from(Buffer.from(response.data.transaction, "base64"));
      const signedTx = await signTransaction(tx);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);

      alert(`Deposited to pool: ${txId}`);
    } catch (err) {
      console.error(err);
      alert(`Error depositing to pool: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw from pool
  const withdrawFromPool = async () => {
    if (!authenticated || !publicKey || !signTransaction) {
      alert("Please connect your wallet");
      return;
    }
    if (!isValidPublicKey(mint)) {
      alert("Invalid mint address");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Invalid amount");
      return;
    }

    setIsLoading(true);
    try {
      const mintPubkey = new PublicKey(mint);
      await ensureATA(mintPubkey, publicKey);

      const response = await axios.post(`${backendUrl}/withdraw-from-pool`, {
        user: publicKey.toBase58(),
        mint,
        amount: parsedAmount,
      });

      const tx = Transaction.from(Buffer.from(response.data.transaction, "base64"));
      const signedTx = await signTransaction(tx);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);

      alert(`Withdrew from pool: ${txId}`);
    } catch (err) {
      console.error(err);
      alert(`Error withdrawing from pool: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Paymint App</h1>
      <button onClick={connectWallet} disabled={isLoading}>
        Connect Wallet
      </button>
      {authenticated && publicKey ? (
        <div>
          <h2>Create Vesting Account</h2>
          <input
            type="text"
            placeholder="Employee Address"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="text"
            placeholder="Mint Address"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="number"
            placeholder="Amount (lamports)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
          />
          <label>
            <input
              type="checkbox"
              checked={isVesting}
              onChange={(e) => setIsVesting(e.target.checked)}
              disabled={isLoading}
            />
            Vesting
          </label>
          <input
            type="datetime-local"
            value={vestUntil}
            onChange={(e) => setVestUntil(e.target.value)}
            disabled={isLoading || !isVesting}
          />
          <button onClick={createVesting} disabled={isLoading}>
            {isLoading ? "Processing..." : "Create Vesting"}
          </button>

          <h2>Claim Vested Tokens</h2>
          <input
            type="text"
            placeholder="Vesting Account Address"
            value={vestingAccount}
            onChange={(e) => setVestingAccount(e.target.value)}
            disabled={isLoading}
          />
          <button onClick={claimVested} disabled={isLoading}>
            {isLoading ? "Processing..." : "Claim Tokens"}
          </button>

          <h2>Send Tokens</h2>
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="number"
            placeholder="Amount (lamports)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
          />
          <button onClick={sendTokens} disabled={isLoading}>
            {isLoading ? "Processing..." : "Send Tokens"}
          </button>

          <h2>Deposit to Pool</h2>
          <input
            type="number"
            placeholder="Amount (lamports)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
          />
          <button onClick={depositToPool} disabled={isLoading}>
            {isLoading ? "Processing..." : "Deposit"}
          </button>

          <h2>Withdraw from Pool</h2>
          <input
            type="number"
            placeholder="Amount (lamports)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
          />
          <button onClick={withdrawFromPool} disabled={isLoading}>
            {isLoading ? "Processing..." : "Withdraw"}
          </button>
        </div>
      ) : (
        <p>Please connect your wallet</p>
      )}
    </div>
  );
}