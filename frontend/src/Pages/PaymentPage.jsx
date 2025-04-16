import React, { useEffect, useState } from 'react'
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
import { useConnectWallet, usePrivy, useSolanaWallets } from '@privy-io/react-auth';
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

    const { wallets } = useSolanaWallets();
    const { connectWallet } = useConnectWallet({
        onSuccess: async ({ wallet }) => {
            try {
                if (wallets?.length > 0) {
                    await wallets[0].loginOrLink();
                }
            } catch (err) {
                console.error('Error during wallet login:', err);
            }
            console.log('Wallet connected successfully:', wallet);
        },
        onError: (error) => {
            console.error('Wallet connection failed:', error);
        },
    });
    const { ready, authenticated, user } = usePrivy();


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


    const triggerPayment = async () => {
        setLoadingPayment(true)
        try {
            const connection = new Connection(
                'https://mainnet.helius-rpc.com/?api-key=3ab17e93-2cda-4743-88e9-2b9beae7c07e',
                'confirmed'
            );

            // Connect Phantom if not connected

            const userAddress = user?.wallet?.address;
            console.log("🔑 User Wallet Address:", userAddress);

            const fromPubkey = new PublicKey(userAddress);
            const recipient = new PublicKey(order?.createdBy?.address);
            const mint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC
            const amountToPush = parseFloat(paymentFormData?.paymentAmount || '0') * 1_000_000;
            const amountInBaseUnits = Math.floor(amountToPush);

            if (amountInBaseUnits <= 0) {
                console.error("❌ Invalid payment amount.");
                alert("Invalid payment amount.");
                return;
            }

            // Get sender token account (ATA)
            const senderATA = await getOrCreateAssociatedTokenAccount(
                connection,
                fromPubkey,
                mint,
                fromPubkey
            );

            let recipientATA;
            try {
                recipientATA = await getOrCreateAssociatedTokenAccount(
                    connection,
                    fromPubkey, // payer
                    mint,
                    recipient, // recipient wallet
                    true // allowOwnerOffCurve
                );
            } catch (err) {
                console.error("❌ Could not create/find recipient ATA", err);
                alert("Could not complete payment. The recipient might not support this token.");
                return;
            }

            // Build transfer instruction
            console.log(senderATA.address)
            console.log(recipientATA.address)
            const transferIx = createTransferInstruction(
                senderATA.address,
                recipientATA.address,
                fromPubkey,
                amountInBaseUnits
            );

            const latestBlockhash = await connection.getLatestBlockhash();

            const transaction = new Transaction().add(transferIx);
            transaction.feePayer = fromPubkey;
            transaction.recentBlockhash = latestBlockhash.blockhash;

            // Sign with Phantom
            const signedTx = await provider.signTransaction(transaction);
            const txid = await connection.sendRawTransaction(signedTx.serialize());

            // Confirm transaction
            await connection.confirmTransaction(
                {
                    signature: txid,
                    blockhash: latestBlockhash.blockhash,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                },
                'confirmed'
            );

            console.log("✅ Payment successful! Transaction ID:", txid);
            setLoadingPayment(false)
            alert(`Payment successful!\nTx ID: ${txid}`);
        } catch (err) {
            console.error("❌ Payment failed:", err);
            setLoadingPayment(false)
            alert("Payment failed. Please try again or check console for details.");
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
                                                            : <button className='btn btn-primary mt-3 w-100' onClick={triggerPayment}><i className='ti ti-lock'></i> Pay</button>
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
                    
                        <Footer />
                    </div>

    )
}

export default PaymentPage