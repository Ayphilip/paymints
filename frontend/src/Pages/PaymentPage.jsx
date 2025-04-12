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

function PaymentPage() {
    const orderDetails = useSelector(state => state.orderDetails);
    const { laoding: loadingOrderDetails, order, error: errorOrderDetails } = orderDetails;


    const [newError, setNewError] = useState('')
    const [loadingState, setLoadingState] = useState(false)


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

    const checkDiscount = (e) => {
        e.preventDefault()
        const discountItem = order?.discountCodes.find(dc => dc?.code === discoun)?.discountPercent;
        if (!discountItem) {
            setErrState(true)
            return
        }
        const discountPrice = ((discountItem / 100) * subtotal);
        setDiscountInput(discountPrice)
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
                subtotal = cart.reduce((acc, item) => {
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

        const discount = parseFloat(discountInput ? discountInput : 0) || 0;
        const tip = parseFloat(tipInput) || 0;

        let finalAmount = subtotal - discount + tip;
        if (finalAmount < 0) finalAmount = 0;

        setPaymentFormData(prev => ({
            ...prev,
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


        (loadingOrderDetails || loadingState) ?
            <Loading /> :
            errorOrderDetails ? <ErrorPage errorMessage={errorOrderDetails} />
                : order && !loadingOrderDetails && order._id !== id ? <ErrorPage errorMessage={'The page link is damaged.'} /> : order &&
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
                                                            {order.QRcodeEnabled && <QRCode value={`http://localhost:5173/orders/${order?._id || ''}/pay?orderNo=${order?.orderNo}`} size={128} />}
                                                        </div>
                                                    </div>


                                                    <div class="table-responsive">
                                                        <table class="table table-clear">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="left"><strong>Subtotal</strong></td>
                                                                    <td class="left">${order.totalAmount}</td>
                                                                </tr>
                                                                {discountInput && <tr>
                                                                    <td class="left"><strong>Discount (20%)</strong></td>
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
                                                            <input type="text" required onChange={(e) => setDiscoun(e.target.value)} class="form-control" placeholder="Discount code" />
                                                            <button type="submit" class="btn btn-primary input-group-text">Apply</button>
                                                        </div>
                                                    </form>
                                                    {errState && discoun !== '' && !discountInput && <span className='text-red text-center'>Discount code is invalid or expired</span>}

                                                    <button className='btn btn-primary mt-3 w-100'><i className='ti ti-lock'></i> Pay</button>
                                                </div>
                                                <div class="col-lg-8 order-lg-1">

                                                    <div class="mt-4">
                                                        <div className='card p-3'>
                                                            <div class="flex" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <strong>Invoice: #{order.orderNo}</strong>
                                                                <strong>Date: {order.createdAt}</strong>
                                                                <span class="float-end">
                                                                    <strong>Status:</strong> {order.orderStatus}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div class="">
                                                            <div className='card p-3'>
                                                                <div class="row mb-6 ">
                                                                    {/* <p>{invoiceType.filter((iv, index) => index === parseInt(order.invoiceType)).map((iv, index) => iv.name)}</p> */}
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

                        <div class="footer">

                            <div class="copyright">
                                <p>Copyright © Developed by <a href="https://ravensocial.app/" target="_blank">Paymint</a> 2025</p>
                            </div>

                        </div>
                    </div>

    )
}

export default PaymentPage