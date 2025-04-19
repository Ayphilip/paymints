// components/SolanaTransactionFetcher.jsx
import React, { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { usePrivy } from '@privy-io/react-auth';
import { shortenAddress } from './utils';

const SolanaTransactionFetcher = () => {
    const { user, ready } = usePrivy();
    const [address, setAddress] = useState(ready && (user?.wallet?.address || ''));
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getTransactions = async () => {
        setLoading(true);
        setError(null);
        setTransactions([]);

        try {
            const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=3ab17e93-2cda-4743-88e9-2b9beae7c07e');
            const publicKey = new PublicKey(address);

            // Get recent signatures
            const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 });

            const fetchedTxns = await Promise.all(
                signatures.map(async (sig) => {
                    try {
                        const tx = await connection.getParsedTransaction(sig.signature, {
                            maxSupportedTransactionVersion: 0,
                        });

                        const instruction = tx?.transaction?.message?.instructions?.find(
                            (ix) =>
                                ix.program === 'system' &&
                                ix.parsed?.type === 'transfer'
                        );

                        const sender = tx?.transaction?.message?.accountKeys?.[0]?.pubkey?.toBase58();
                        const recipient = instruction?.parsed?.info?.destination;
                        const amount = instruction?.parsed?.info?.lamports
                            ? instruction.parsed.info.lamports / 1e9
                            : null;

                        return {
                            signature: sig.signature,
                            slot: sig.slot,
                            err: sig.err,
                            blockTime: sig.blockTime,
                            sender,
                            recipient,
                            amount,
                        };
                    } catch (err) {
                        console.warn(`Error parsing tx ${sig.signature}:`, err);
                        return null;
                    }
                })
            );

            const filteredTxns = fetchedTxns.filter((tx) => tx !== null);
            setTransactions(filteredTxns);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch transactions. Please check the address.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Solana Transactions by Address</h2>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Solana Wallet Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>

            <button
                onClick={getTransactions}
                disabled={!address || loading}
                className="btn btn-primary mb-4"
            >
                {loading ? 'Fetching...' : 'Fetch Transactions'}
            </button>

            {error && <div className="alert alert-danger">{error}</div>}

            {transactions.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead className="table">
                            <tr>
                                <th>#</th>
                                {/* <th>Signature</th> */}
                                <th>Sender</th>
                                <th>Recipient</th>
                                <th>Amount (SOL)</th>
                                <th>Slot</th>
                                <th>Block Time</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, index) => (
                                <tr key={tx.signature}>
                                    <td>{index + 1}</td>
                                    {/* <td className="text-break">{tx.signature}</td> */}
                                    <td>{shortenAddress(tx.sender || 'N/A')}</td>
                                    <td>{shortenAddress(tx.recipient || 'N/A')}</td>
                                    <td>{tx.amount !== null ? tx.amount.toFixed(6) : 'N/A'}</td>
                                    <td>{tx.slot}</td>
                                    <td>{tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'N/A'}</td>
                                    <td>{tx.err ? 'Failed' : 'Success'}</td>
                                    <td><a  href={`https://explorer.solana.com/tx/${tx.signature}`} className='text-success'><i className='bi bi-arrow-up-right'></i> View on Solscan </a></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SolanaTransactionFetcher;
