import React from 'react'
import Headers from '../component/headers'
import Logo from '../assets/logo.png'

function OrderView({ data }) {
    return (

        <div class="row">
            <div class="col-xl-12">
                <div class="">
                    <div class="">
                        <div class="row">
                            <div class="col-lg-4 order-lg-2">

                                <div class="row align-items-center mb-4">
                                    <div class="col-sm-9">
                                        <a href="/" class="brand-logo mb-3">
                                            <img src={data.orderImage ? data.orderImage : Logo} class="logo-abbr" width="80" height="80" viewBox="0 0 53 53" />
                                            <h1 className="brand-title" width="124px" height="33px"><strong>PAYMINT</strong></h1>
                                        </a>
                                    </div>
                                    {data.QRcodeEnabled && <div class="col-sm-3 mt-3"> <img src="https://dompet.dexignlab.com/codeigniter/demo/public/assets/images/qr.png" alt="" class="img-fluid width110" /> </div>}
                                </div>


                                <div class="table-responsive">
                                    <table class="table table-clear">
                                        <tbody>
                                            <tr>
                                                <td class="left"><strong>Subtotal</strong></td>
                                                <td class="left">${data.totalAmount}</td>
                                            </tr>
                                           
                                            <tr>
                                                <td class="left"><strong>Total</strong></td>
                                                <td class="right"><strong>$7.477,36</strong><br />
                                                    <strong>0.15050000 BTC</strong></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {data.tipOptionEnabled && <div class="input-group mb-3">
                                    <input type="number" class="form-control" placeholder="Tip" />
                                </div>}
                                <ul class="list-group mb-3">

                                    <li class="list-group-item d-flex justify-content-between">
                                        <span>Total (USD)</span>
                                        <strong>${data.totalAmount}</strong>
                                    </li>
                                </ul>



                                <form>
                                    <div class="input-group">
                                        <input type="text" class="form-control" placeholder="Discount code" />
                                        <button type="submit" class="btn btn-primary input-group-text">Apply</button>
                                    </div>
                                </form>

                                {/* <button className='btn btn-primary mt-3 w-100'><i className='ti ti-lock'></i> Pay</button> */}
                            </div>
                            <div class="col-lg-8 order-lg-1">

                                <div class="mt-4">
                                    <div className='card p-3'>
                                        <div class="flex" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Invoice: #{data.orderNo}</strong>
                                            <strong>Date: {data.createdAt}</strong>
                                            <span class="float-end">
                                                <strong>Status:</strong> {data.orderStatus}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="">
                                        <div className='card p-3'>
                                            <div class="row mb-6 ">
                                                <div class="mt-4 col-xl-4 col-lg-3 col-lg-8 col-sm-12">
                                                    <h6>From:</h6>
                                                    <div> <strong>Webz Poland</strong> </div>
                                                    <div>Madalinskiego 8</div>
                                                    <div>71-101 Szczecin, Poland</div>
                                                    <div>Email: info@webz.com.pl</div>
                                                </div>
                                                {data.isClientInformation && <div class="mt-4 col-xl-4 col-lg-3 col-lg-8 col-sm-12">
                                                    <h6>To:</h6>
                                                    <div> <strong>{data.clientName}</strong> </div>
                                                    <div>{data.clientAddress}</div>
                                                    <div>Email: {data.clientEmail}</div>
                                                </div>}

                                            </div>
                                        </div>

                                        <h4 class="card d-flex p-4 mb-3">
                                            <span class="cpa text-black">{data.orderTitle}</span>

                                        </h4>


                                        <div className='card mt-3 mt-4 p-3'>
                                            <h4 className='cpa'>Description</h4>
                                            <p>{data.orderDescription}</p>
                                        </div>
                                        {data.orderType === 'invoice' && <div className='card mt-3 mt-4 p-3'>
                                            <h4 className='cpa'>Services</h4>
                                            <ul class="list-group mb-3 mt-4">
                                                {data.items && data.items.map((item, index) =>
                                                    <li key={index} class="list-group-item d-flex justify-content-between lh-condensed">
                                                        <div>
                                                            <h6 class="my-0">{item.title}</h6>
                                                            <small class="text-muted">{item.description}</small>
                                                        </div>
                                                        <span class="text-muted">${item.unitPrice}</span>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default OrderView