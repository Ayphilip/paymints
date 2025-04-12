import React from 'react'
import Headers from '../component/headers'
import Logo from '../assets/logo.png'

function Preview() {
    return (
        <div id='main-wrapper'>
            <Headers props={'Preview'} />

            <div class="content-body">
                <div class="container-fluid">


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
                                                <div class="col-sm-3 mt-3"> <img src="https://dompet.dexignlab.com/codeigniter/demo/public/assets/images/qr.png" alt="" class="img-fluid width110" /> </div>
                                            </div>


                                            <div class="table-responsive">
                                                <table class="table table-clear">
                                                    <tbody>
                                                        <tr>
                                                            <td class="left"><strong>Subtotal</strong></td>
                                                            <td class="left">$8.497,00</td>
                                                        </tr>
                                                        <tr>
                                                            <td class="left"><strong>Discount (20%)</strong></td>
                                                            <td class="right">$1,699,40</td>
                                                        </tr>
                                                        <tr>
                                                            <td class="left"><strong>VAT (10%)</strong></td>
                                                            <td class="right">$679,76</td>
                                                        </tr>
                                                        <tr>
                                                            <td class="left"><strong>Total</strong></td>
                                                            <td class="right"><strong>$7.477,36</strong><br />
                                                                <strong>0.15050000 BTC</strong></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <ul class="list-group mb-3">

                                                <li class="list-group-item d-flex justify-content-between">
                                                    <span>Total (USD)</span>
                                                    <strong>$20</strong>
                                                </li>
                                            </ul>



                                            <form>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" placeholder="Discount code" />
                                                    <button type="submit" class="btn btn-primary input-group-text">Apply</button>
                                                </div>
                                            </form>

                                            <button className='btn btn-primary mt-3 w-100'><i className='ti ti-lock'></i> Pay</button>
                                        </div>
                                        <div class="col-lg-8 order-lg-1">

                                            <div class="mt-4">
                                                <div className='card p-3'>
                                                    <div class="flex" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <strong>Invoice: #1234567</strong>
                                                        <strong>Date: 01/01/2023</strong>
                                                        <span class="float-end">
                                                            <strong>Status:</strong> Pending
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
                                                                <div>Phone: +48 444 666 3333</div>
                                                            </div>
                                                            <div class="mt-4 col-xl-4 col-lg-3 col-lg-8 col-sm-12">
                                                                <h6>To:</h6>
                                                                <div> <strong>Bob Mart</strong> </div>
                                                                <div>Attn: Daniel Marek</div>
                                                                <div>43-190 Mikolow, Poland</div>
                                                                <div>Email: marek@daniel.com</div>
                                                                <div>Phone: +48 123 456 789</div>
                                                            </div>

                                                        </div>
                                                    </div>

                                                    <h4 class="card d-flex p-4 mb-3">
                                                        <span class="cpa text-black">Invoice Name/Payroll Name</span>
                                                        
                                                    </h4>


                                                    <div className='card mt-3 mt-4 p-3'>
                                                        <h4 className='cpa'>Description</h4>
                                                        <p>The Retroactive payroll template is used when compensating individuals for work done in the past, often without a prior agreement. It’s widely used in decentralized environments where contributors step up without formal contracts. This format allows managers to reward them fairly with crypto, including backdated periods, bonuses, and memo fields for transparency. Ideal for DAOs and communities practicing retroactive public goods funding.</p>
                                                    </div>
                                                    <div className='card mt-3 mt-4 p-3'>
                                                        <h4 className='cpa'>Services</h4>
                                                        <ul class="list-group mb-3 mt-4">
                                                            <li class="list-group-item d-flex justify-content-between lh-condensed">
                                                                <div>
                                                                    <h6 class="my-0">Product name</h6>
                                                                    <small class="text-muted">Brief description</small>
                                                                </div>
                                                                <span class="text-muted">$12</span>
                                                            </li>
                                                            <li class="list-group-item d-flex justify-content-between lh-condensed">
                                                                <div>
                                                                    <h6 class="my-0">Second product</h6>
                                                                    <small class="text-muted">Brief description</small>
                                                                </div>
                                                                <span class="text-muted">$8</span>
                                                            </li>
                                                            <li class="list-group-item d-flex justify-content-between lh-condensed">
                                                                <div>
                                                                    <h6 class="my-0">Third item</h6>
                                                                    <small class="text-muted">Brief description</small>
                                                                </div>
                                                                <span class="text-muted">$5</span>
                                                            </li>

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
            </div>

        </div>
    )
}

export default Preview