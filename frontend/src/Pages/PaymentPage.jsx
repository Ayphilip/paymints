import React, { useEffect, useRef, useState } from 'react'
import Headers from '../component/headers'
import Logo from '../assets/logo.png'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { detailsOrder } from '../Actions/orderActions';
import Loading from '../component/loading';
import ErrorPage from '../component/ErrorPage';
import QRCode from 'react-qr-code';
import { invoiceType } from '../component/utils';
import Footer from '../component/Footer';
import {
    PublicKey,
    Transaction,
    SystemProgram,
    Connection,
    clusterApiUrl,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { useConnectWallet, usePrivy, useSignTransaction, useSolanaWallets, useWallets } from '@privy-io/react-auth';
import {
    getAssociatedTokenAddress,
    createTransferInstruction,
    getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';


function PaymentPage() {
    const orderDetails = useSelector(state => state.orderDetails);
    const { laoding: loadingOrderDetails, order, error: errorOrderDetails } = orderDetails;


    const [newError, setNewError] = useState('')
    const [loadingState, setLoadingState] = useState(false)
    const { ready, authenticated, user, login, logout, connectWallet } = usePrivy();
    const { wallets } = useSolanaWallets();
    // const { connectWallet } = useConnectWallet({
    //     onSuccess: async ({ wallet }) => {
    //         try {
    //             if (wallets?.length > 0) {
    //                 await wallets[0].loginOrLink();
    //             }
    //         } catch (err) {
    //             console.error('Error during wallet login:', err);
    //         }
    //         console.log('Wallet connected successfully:', wallet);
    //     },
    //     onError: (error) => {
    //         console.error('Wallet connection failed:', error);
    //     },
    // });
    // const { ready, authenticated, user, linkWallet } = usePrivy();



    const { id } = useParams();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const orderNo = searchParams.get('orderNo');


    const dispatch = useDispatch();
    const navigate = useNavigate()

    const [paymentFormData, setPaymentFormData] = useState({})
    const [tipInput, setTipInput] = useState(0)
    const [discoun, setDiscoun] = useState('')
    const [discountInput, setDiscountInput] = useState('')
    const [cart, setCart] = useState([])
    const [errState, setErrState] = useState(false)
    const [loadingPayment, setLoadingPayment] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState(0)
    const [paymentMessage, setPaymentMessage] = useState('')
    const [isReconnecting, setIsReconnecting] = useState(false);


    // const triggerPayment = async () => {
    //     setLoadingPayment(true)
    //     const provider = window?.solana;
    //     try {
    //         const connection = new Connection(
    //             'https://mainnet.helius-rpc.com/?api-key=3ab17e93-2cda-4743-88e9-2b9beae7c07e',
    //             'confirmed'
    //         );

    //         await provider.connect()
    //         // Connect Phantom if not connected

    //         const userAddress = user?.wallet?.address;
    //         console.log("🔑 User Wallet Address:", userAddress);

    //         const fromPubkey = new PublicKey(userAddress);
    //         const recipient = new PublicKey(order?.createdBy?.address);
    //         const mint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC
    //         const amountToPush = parseFloat(paymentFormData?.paymentAmount || '0') * 1_000_000;
    //         const amountInBaseUnits = Math.floor(amountToPush);

    //         if (amountInBaseUnits <= 0) {
    //             setPaymentStatus(1)
    //             setpaymentMessage("❌ Invalid payment amount.");
    //             setLoadingPayment(false)
    //             alert("Invalid payment amount.");
    //             return;
    //         }

    //         // Get sender token account (ATA)
    //         // const senderATA = await getOrCreateAssociatedTokenAccount(
    //         //     connection,
    //         //     fromPubkey,
    //         //     mint,
    //         //     fromPubkey
    //         // );

    //         const senderATA = await getAssociatedTokenAddress(mint, fromPubkey, true)

    //         let recipientATA;
    //         try {
    //             // recipientATA = await getOrCreateAssociatedTokenAccount(
    //             //     connection,
    //             //     fromPubkey, // payer
    //             //     mint,
    //             //     recipient, // recipient wallet
    //             //     true // allowOwnerOffCurve
    //             // );

    //             recipientATA = await getAssociatedTokenAddress(mint, recipient, true)


    //         } catch (err) {
    //             setPaymentStatus(1)
    //             setpaymentMessage("❌ Could not create/find recipient ATA", err);
    //             setLoadingPayment(false)
    //             alert("Could not complete payment. The recipient might not support this token.");
    //             return;
    //         }

    //         // Build transfer instruction
    //         console.log(senderATA)
    //         console.log(recipientATA)
    //         const transferIx = createTransferInstruction(
    //             senderATA,
    //             recipientATA,
    //             fromPubkey,
    //             amountInBaseUnits
    //         );

    //         const latestBlockhash = await connection.getLatestBlockhash();

    //         const transaction = new Transaction().add(transferIx);
    //         transaction.feePayer = fromPubkey;
    //         transaction.recentBlockhash = latestBlockhash.blockhash;

    //         console.log(transaction)

    //         // Sign with Phantom

    //         console.log("Transaction:", {
    //             feePayer: transaction.feePayer.toBase58(),
    //             recentBlockhash: transaction.recentBlockhash,
    //             instructions: transaction.instructions.map(ix => ({
    //               programId: ix.programId.toBase58(),
    //               keys: ix.keys.map(k => k.pubkey.toBase58()),
    //               data: ix.data.toString('hex')
    //             }))
    //           });

    //         const signedTx = await provider.signTransaction(transaction)
    //         const txid = await connection.sendRawTransaction(signedTx.serialize());

    //         // Confirm transaction
    //         await connection.confirmTransaction(
    //             {
    //                 signature: txid,
    //                 blockhash: latestBlockhash.blockhash,
    //                 lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    //             },
    //             'confirmed'
    //         );
    //         setPaymentStatus(2)
    //         setpaymentMessage("✅ Payment successful! Transaction ID:", txid);
    //         setLoadingPayment(false)
    //         // alert(`Payment successful!\nTx ID: ${txid}`);
    //     } catch (err) {
    //         setPaymentStatus(1)
    //         setpaymentMessage("❌ Payment failed:", err);
    //         console.log("❌ Payment failed:", err);
    //         setLoadingPayment(false)
    //         alert("Payment failed. Please try again or check console for details.");
    //     }
    // };


    const solanaWallet = wallets.find((wallet) => wallet.type === 'solana');

    useEffect(() => {
    
        if (!ready || !authenticated || solanaWallet || isReconnecting) return;

        const reconnectWallet = async () => {
            setIsReconnecting(true);
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
                setIsReconnecting(false);
            }
        };

        if(!solanaWallet){reconnectWallet();}
    }, [ready, authenticated, user, solanaWallet, isReconnecting]);

    const triggerPayment = async () => {
        console.log(wallets)
        setLoadingPayment(true);
        try {
            // Validate Privy and wallet state
            if (!ready || !authenticated) {
                throw new Error('Please log in to proceed.');
            }
            if (!solanaWallet) {
                throw new Error('No Solana wallet connected. Please connect a wallet.');
            }

            // Get wallet details
            const walletAddress = solanaWallet.address;
            const walletClient = solanaWallet.walletClient; // Privy's wallet client for signing

            // Validate inputs
            if (!walletAddress || !order?.createdBy?.address) {
                throw new Error('Missing wallet or recipient address');
            }
            const amount = parseFloat(paymentFormData?.paymentAmount || '0');
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Invalid payment amount');
            }

            // Initialize Solana connection
            const connection = new Connection(
                `https://mainnet.helius-rpc.com/?api-key=3ab17e93-2cda-4743-88e9-2b9beae7c07e`,
                'confirmed'
            );

            const fromPubkey = new PublicKey(walletAddress);
            const recipient = new PublicKey(order.createdBy.address);
            const mint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC
            const amountInBaseUnits = Math.floor(amount * 1_000_000);

            // Check SOL balance
            const solBalance = await connection.getBalance(fromPubkey);
            if (solBalance < 0.005 * 1_000_000_000) {
                throw new Error('Insufficient SOL for transaction fees');
            }

            // Get or create ATAs
            const senderATA = await getOrCreateAssociatedTokenAccount(
                connection,
                fromPubkey, // payer
                mint,
                fromPubkey
            );
            const recipientATA = await getOrCreateAssociatedTokenAccount(
                connection,
                fromPubkey, // payer
                mint,
                recipient,
                true // allowOwnerOffCurve
            );

            // Check USDC balance
            const senderAccount = await getAccount(connection, senderATA.address);
            console.log(senderATA.address)
            if (senderAccount.amount < amountInBaseUnits) {
                throw new Error('Insufficient USDC balance');
            }

            // Build transfer instruction
            const transferIx = createTransferInstruction(
                senderATA.address,
                recipientATA.address,
                fromPubkey,
                amountInBaseUnits
            );

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            const transaction = new Transaction().add(transferIx);
            transaction.feePayer = fromPubkey;
            transaction.recentBlockhash = blockhash;

            // Sign transaction using Privy
            const serializedTx = transaction
                .serialize({ requireAllSignatures: false, verifySignatures: false })
                .toString('base64');
            const signedTx = await walletClient.signTransaction(serializedTx);

            // Send transaction
            const txid = await connection.sendRawTransaction(Buffer.from(signedTx, 'base64'));

            // Confirm transaction
            await connection.confirmTransaction(
                { signature: txid, blockhash, lastValidBlockHeight },
                'confirmed'
            );

            setPaymentStatus(2);
            setPaymentMessage(`✅ Payment successful! Transaction ID: ${txid}`);
        } catch (err) {
            console.error('Detailed error:', err);
            let errorMessage = err.message || 'Unknown error';
            if (errorMessage.includes('User rejected') || errorMessage.includes('declined')) {
                errorMessage = 'Payment cancelled by user';
            }
            setPaymentStatus(1);
            setPaymentMessage(`❌ Payment failed: ${errorMessage}`);
            alert(`Payment failed: ${errorMessage}`);
        } finally {
            setLoadingPayment(false);
        }
    };


    const checkDiscount = (e) => {
        e.preventDefault()
        const discountItem = order?.discountCodes.find(dc => dc?.code === discoun)?.discountPercent;
        if (!discountItem) {

            setErrState(true)
            return
        }
        console.log(discountItem)
        // const discountPrice = ((discountItem / 100) * subtotal );
        setDiscountInput(discountItem)
    }

    const computeInvoiceAmount = (invoiceType) => {
        let subtotal = 0;

        switch (invoiceType) {
            case '0':
                // console.log(order?.totalAmount)
                subtotal = order?.totalAmount || 0;
                break;

            case '1':
                // console.log(order?.totalAmount)
                subtotal = order?.totalAmount || 0;
                break;

            case '2':
                subtotal = cart.reduce((acc, item) => {
                    const itemTotal = (item.unitPrice || 0) * (item.quantity || 1);
                    return acc + itemTotal;
                }, 0);
                break;

            case '3':
                // console.log(order?.totalAmount)
                subtotal = order?.totalAmount || 0;
                break;

            case '4':
                subtotal = order.items.reduce((acc, item) => {
                    const itemTotal = (item.unitPrice || 0) * (item.quantity || 1);
                    return acc + itemTotal;
                }, 0);
                break;

            case '5':
                subtotal = order?.subscriptionPlan?.price || 0;
                break;

            case '6':
                // console.log(order?.totalAmount)
                subtotal = order?.totalAmount || 0;
                break;

            default:
                subtotal = 0;
        }

        const discountPrice = ((discountInput / 100) * subtotal);
        const discount = parseFloat(discountPrice ? discountPrice : 0) || 0;
        const tip = parseFloat(tipInput) || 0;

        let finalAmount = subtotal - discount + tip;
        if (finalAmount < 0) finalAmount = 0;

        setPaymentFormData(prev => ({
            ...prev,
            paymentSubtotal: subtotal,
            paymentAmount: finalAmount,
            paymentTip: tip,
            paymentDiscount: discount,
        }));
        setLoadingState(false)
    };





    useEffect(() => {
        // console.log(orderNo)
        setLoadingState(true)

        dispatch(detailsOrder(orderNo))
        if (order) {
            setPaymentFormData({
                paymentInvoiceId: order.orderNo,
                paymentType: order.paymentType,
                paymentSender: '',
                paymentRecipient: '',
                paymentStatus: '',
                paymentComment: '',
                paymentTip: 0,
                paymentSubtotal: 0,
                paymentDiscount: '',
                paymentAmount: order.totalAmount,
                paymentMintAddress: '',
                paymentChain: '',
            })

        }


        return () => {

        }
    }, [dispatch, orderNo])

    useEffect(() => {

        if (order?.invoiceType) {
            computeInvoiceAmount(order.invoiceType);
        }
    }, [cart, discountInput, tipInput, order, loadingState]);

    const modalRef = useRef(null);



    // Set up modal event listener for close
    useEffect(() => {
        const modalEl = modalRef.current;

        const handleModalClose = () => {
            if (paymentStatus == 2) {
                window.location.reload();
            }
        };

        modalEl?.addEventListener('hidden.bs.modal', handleModalClose);

        return () => {
            modalEl?.removeEventListener('hidden.bs.modal', handleModalClose);
        };
    }, [paymentStatus]);


    return (


        (loadingOrderDetails || loadingState && !errorOrderDetails) ?
            <Loading /> :
            errorOrderDetails ? <ErrorPage errorMessage={errorOrderDetails} />
                : order && !loadingOrderDetails && (order._id !== id || parseInt(order.orderStatus) > 0) ? <ErrorPage errorMessage={order._id !== id ? 'The page link is damaged.' : parseInt(order.orderStatus) > 0 ? 'This current document is closed' : 'An Unknown error occurred.'} /> : order &&
                    <div id='main-wrapper'>
                        <div className='container mt-3'>
                            <div class="row">
                                <div class="col-xl-12">
                                    <div class="">
                                        <div class="">
                                            <div class="row">
                                                <div class="col-lg-4 order-lg-2">

                                                    <div class="row align-items-center mb-4">
                                                        <div class="col-sm-9">
                                                            <a href="/" class="brand-logo mb-3">
                                                                <img src={Logo} class="logo-abbr" width="80" height="80" viewBox="0 0 53 53" />
                                                                <h1 className="brand-title" width="124px" height="33px"><strong>PAYMINT</strong></h1>
                                                            </a>
                                                        </div>
                                                        <div class="col-sm-3 mt-3">
                                                            {order.QRcodeEnabled && <QRCode value={`http://localhost:5173/order/${order?._id || ''}/pay?orderNo=${order?.orderNo}`} size={128} />}
                                                        </div>
                                                    </div>


                                                    <div class="table-responsive">
                                                        <table class="table table-clear">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="left"><strong>Subtotal</strong></td>
                                                                    <td class="left">${paymentFormData.paymentSubtotal}</td>
                                                                </tr>
                                                                {discountInput && <tr>
                                                                    <td class="left"><strong>Discount ({discountInput}%)</strong></td>
                                                                    <td class="right">${paymentFormData.paymentDiscount}</td>
                                                                </tr>}
                                                                {tipInput !== 0 && <tr>
                                                                    <td class="left"><strong>Tip</strong></td>
                                                                    <td class="right">${paymentFormData.paymentTip}</td>
                                                                </tr>}
                                                                <tr>
                                                                    <td class="left"><strong>Total</strong></td>
                                                                    <td class="right"><strong>${paymentFormData.paymentAmount}</strong></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    {order.tipOptionEnabled && <div class="input-group mb-3">
                                                        <input type="number" onChange={(e) => setTipInput(e.target.value)} class="form-control" placeholder="Tip" />
                                                    </div>}
                                                    <ul class="list-group mb-3">

                                                        <li class="list-group-item d-flex justify-content-between">
                                                            <span>Total (USD)</span>
                                                            <strong>${paymentFormData.paymentAmount}</strong>
                                                        </li>
                                                    </ul>



                                                    <form onSubmit={checkDiscount}>
                                                        <div class="input-group">
                                                            <input type="text" disabled={paymentFormData.paymentDiscount ? true : false} required onChange={(e) => setDiscoun(e.target.value)} class="form-control" placeholder="Discount code" />
                                                            <button type="submit" class="btn btn-primary input-group-text">Apply</button>
                                                        </div>
                                                    </form>
                                                    {errState && discoun !== '' && !discountInput && <span className='text-red text-center'>Discount code is invalid or expired</span>}

                                                    {ready && (authenticated && user ?
                                                        (
                                                            user?.wallet?.address === order?.createdBy?.address ? null : loadingPayment ?
                                                                <button className='btn btn-primary mt-3 w-100'><i className='spinner spinner-border-sm spinner-border'></i></button>
                                                                : <button className='btn btn-primary mt-3 w-100'
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#exampleModalCenter"
                                                                    onClick={triggerPayment}><i className='ti ti-lock'></i> Pay</button>
                                                        ) :
                                                        <button className='btn btn-primary mt-3 w-100' disabled={!ready && true}
                                                            onClick={connectWallet}><i className='ti ti-lock'></i> Connect Wallet</button>)
                                                    }
                                                </div>
                                                <div class="col-lg-8 order-lg-1">

                                                    <div class="mt-4">
                                                        <div className='card p-3'>
                                                            <div class="flex" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <strong>Invoice: #{order.orderNo}</strong>
                                                                <strong>Date: {order.createdAt}</strong>
                                                                <span class="float-end">
                                                                    <strong>Status:</strong> {['Active', 'Pending', 'Closed'][order.orderStatus]}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div class="">
                                                            <div className='card p-3'>
                                                                <div class="row mb-6 ">
                                                                    <p>{invoiceType.filter((iv, index) => index === parseInt(order.invoiceType)).map((iv, index) => iv.name)}</p>
                                                                    <div class="mt-4 col-xl-4 col-lg-3 col-lg-8 col-sm-12">
                                                                        <h6>From:</h6>
                                                                        <div> <strong>Webz Poland</strong> </div>
                                                                        <div>Madalinskiego 8</div>
                                                                        <div>71-101 Szczecin, Poland</div>
                                                                        <div>Email: info@webz.com.pl</div>
                                                                        <div>Phone: +48 444 666 3333</div>
                                                                    </div>
                                                                    {order.isClientInformation && <div class="mt-4 col-xl-4 col-lg-3 col-lg-8 col-sm-12">
                                                                        <h6>To:</h6>
                                                                        <div> <strong>{order.clientName}</strong> </div>
                                                                        <div>{order.clientAddress}</div>
                                                                        <div>Email: {order.clientEmail}</div>
                                                                    </div>}

                                                                </div>
                                                            </div>

                                                            <h4 class="card d-flex p-4 mb-3">
                                                                <span class="cpa text-black">{order.orderTitle}</span>

                                                            </h4>


                                                            <div className='card mt-3 mt-4 p-3'>
                                                                <h4 className='cpa'>Description</h4>
                                                                <p>{order.orderDescription}</p>
                                                            </div>
                                                            <div className='card mt-3 mt-4 p-3'>
                                                                <h4 className='cpa'>Services</h4>
                                                                <ul class="list-group mb-3 mt-4">
                                                                    {order.items && order.items.map((item, index) =>
                                                                        <li key={index} class="list-group-item d-flex justify-content-between lh-condensed">
                                                                            <div>
                                                                                <h6 class="my-0">{item.title}</h6>
                                                                                <small class="text-muted">{item.description}</small>
                                                                                {parseInt(order.invoiceType) === 2 && (cart.some(itm => itm.name === item.title) ? (
                                                                                    <span
                                                                                        onClick={() =>
                                                                                            setCart(cart.filter(itm => itm.name !== item.title))
                                                                                        }
                                                                                        className='btn btn-sm btn-danger light'
                                                                                    >
                                                                                        <i className='bi bi-file-minus'></i> Remove
                                                                                    </span>
                                                                                ) : (
                                                                                    <span
                                                                                        onClick={() =>
                                                                                            setCart([
                                                                                                ...cart,
                                                                                                { name: item.title, unitPrice: item.unitPrice, quantity: 1 },
                                                                                            ])
                                                                                        }
                                                                                        className='btn btn-sm btn-success light'
                                                                                    >
                                                                                        <i className='bi bi-file-plus'></i> Add to cart
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                            <span class="text-muted">${item.unitPrice}</span>
                                                                        </li>
                                                                    )}

                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="modal fade" id="exampleModalCenter" ref={modalRef}>
                            <div class="modal-dialog modal-dialog-centered" role="document">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title"></h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal">
                                        </button>
                                    </div>
                                    <div className="modal-body text-center">
                                        {loadingPayment && <>
                                            <i className='spinner spinner-border text-red'></i>
                                            <div>Please wait...</div>
                                        </>}

                                        {!loadingPayment && (
                                            <>
                                                {paymentStatus == 1 && <i className="bi bi-x text-danger" style={{ fontSize: '80px' }}></i>}
                                                {paymentStatus == 2 && <i className="bi bi-check2-circle text-success" style={{ fontSize: '80px' }}></i>}
                                                <h3 className="mt-3">{paymentMessage}</h3>
                                            </>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>


                        {user?.wallet?.address && <div className='d-flex align-items-center justify-content-center'>
                            <a href='/alltransaction' className='btn btn-primary m-3'>View Payments History</a>
                        </div>}

                        <Footer />
                    </div>

    )
}

export default PaymentPage