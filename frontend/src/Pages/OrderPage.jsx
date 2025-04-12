import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Headers from '../component/headers';
import { defaultData, invoiceType, orderContext, payrollType } from '../component/utils';
import Logo from '../assets/logo.png'
import OrderSetupComponent from '../component/OrderSetupComponent';
import OrderView from '../component/orderView';
import { listOrders } from '../Actions/orderActions';

function OrderPage() {
    const userSignin = useSelector(state => state.userSignin);
    const { userInfo } = userSignin;

    const orderList = useSelector(state => state.orderList);
    const { loadingOrderList, orders, errorOrderList } = orderList;

    const [showForm, setShowForm] = useState(false)
    const [selectedContext, setSelectedContext] = useState('invoice')

    const [formData, setFormData] = useState(null);

    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        if (!userInfo) {
            navigate('/')
        }

        dispatch(listOrders())


        return () => {

        }
    }, [])
    return (
        <div id="main-wrapper">

            <Headers props={'Order'} />

            <div class="content-body">
                <div class="container-fluid">

                    {!showForm && <div class="row">

                        <div className="col-xl-6 col-xxl-6">
                            <div className="card">
                                <div className="card-header d-flex flex-wrap border-0 pb-6">
                                    <div className="me-auto mb-sm-0 mb-3">
                                        <h4 className="card-title mb-2">Invoice</h4>
                                        <span className="fs-12">Create a micro invoice for your payment processing</span>
                                    </div>
                                    <a
                                        onClick={() => { setSelectedContext('invoice') }}
                                        data-bs-toggle="modal" data-bs-target="#invoiceTemplateModal"
                                        className="btn btn-rounded btn-md btn-primary me-3 me-3"><i className="las la-plus scale5 me-3"></i>Create New</a>

                                </div>
                                
                            </div>
                        </div>
                        <div className="col-xl-6 col-xxl-6">
                            <div className="card">
                                <div className="card-header d-flex flex-wrap border-0 pb-6">
                                    <div className="me-auto mb-sm-0 mb-3">
                                        <h4 className="card-title mb-2">Instant Payroll</h4>
                                        <span className="fs-12">Integrate with instant payroll to credit all your recipient</span>
                                    </div>
                                    <a onClick={() => { setSelectedContext('payroll') }}
                                        data-bs-toggle="modal" data-bs-target="#invoiceTemplateModal"
                                        className="btn btn-rounded btn-md btn-primary me-3 me-3"><i className="las la-plus scale5 me-3"></i>Create New</a>
                                </div>
                                
                            </div>
                        </div>


                    </div>}

                    {!showForm && <div class="d-flex mb-3">
                        <div class="mb-3 align-items-center me-auto">
                            <h4 class="card-title">Payment History</h4>
                            <span class="fs-12">Lorem ipsum dolor sit amet, consectetur</span>
                        </div>
                        {/* <a onClick={() => setShowForm(true)} class="btn btn-outline-primary mb-3"><i class="fa fa-plus me-3 scale3"></i>New Payment Order</a> */}
                    </div>}
                    <div class="row">
                        <div class="col-xl-12">
                            {showForm ?
                                <OrderSetupComponent comps={selectedContext} formDatas={formData} />
                                :
                                <div class="table-responsive fs-14">
                                    <table class="table card-table display mb-4 dataTablesCard " id="example5">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" value="" id="checkAll" />
                                                        <label class="form-check-label" for="checkAll">
                                                        </label>
                                                    </div>
                                                </th>
                                                <th>ID Invoice</th>
                                                <th>Date</th>
                                                <th>Email</th>
                                                <th>Service Type</th>
                                                <th>Status</th>
                                                <th class="text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders?.map((order, index) => <tr key={index}>
                                                <td>
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault2" />
                                                        <label class="form-check-label" for="flexCheckDefault2">
                                                        </label>
                                                    </div>
                                                </td>
                                                <td><span class="text-black font-w500">#{order.orderNo}</span></td>
                                                <td><span class="text-black text-nowrap">{order.createdAt}</span></td>
                                                {/* <td>
                                                    <div class="d-flex align-items-center">
                                                        <img src="https://dompet.dexignlab.com/codeigniter/demo/public/assets/images/avatar/1.jpg" alt="" class="rounded me-3" width="50" />
                                                        <div>
                                                            <h6 class="fs-16 text-black font-w600 mb-0 text-nowrap">XYZ Store ID</h6>
                                                            <span class="fs-14">Online Shop</span>
                                                        </div>
                                                    </div>
                                                </td> */}
                                                <td><span class="text-black">xyzstore@mail.com</span></td>
                                                <td><span class="text-black">{order.orderTitle} </span></td>
                                                <td><a href="javascript:void(0)" class="btn  btn-sm btn-success light">{order.orderStatus}</a></td>
                                                <td class="text-end">
                                                    <div class="dropdown">
                                                        <a href="javascript:void(0);" class="btn-link" data-bs-toggle="dropdown" aria-expanded="false">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#575757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                                <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" stroke="#575757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                                <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" stroke="#575757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                            </svg>
                                                        </a>
                                                        <div class="dropdown-menu dropdown-menu-right">
                                                            <a class="dropdown-item" href="javascript:void(0);">Delete</a>
                                                            <a class="dropdown-item" href="javascript:void(0);">Edit</a>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>)}

                                            {loadingOrderList && <div className='text-center justify-content-center align-items-center d-flex'>
                                                <i className='spinner spinner-border text-red'></i>{' '} Loading, Please Wait...
                                            </div>}

                                            {errorOrderList && <div className='text-center justify-content-center align-items-center d-flex'>
                                                <i className='bi bi-x text-red'></i>{' '} Error fetching data...
                                            </div>}

                                            {orders && !orders.length && <div className='text-center justify-content-center align-items-center d-flex'>
                                                <i className='bi bi-exclamation-circle text-warning'></i>{' '} No Available Data...
                                            </div>}

                                        </tbody>
                                    </table>
                                </div>
                            }
                        </div>
                    </div>


                </div>

            </div >


            <div className="modal fade" id="invoiceTemplateModal" tabIndex="-1" aria-labelledby="invoiceTemplateModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <h5 className="modal-title" id="invoiceTemplateModalLabel">Create New {selectedContext} Template     |</h5>
                                <button onClick={() => { setShowForm(true), setFormData(defaultData) }} data-bs-dismiss="modal" className='btn btn-secondary btn-sm'><i className="bi bi-file-earmark-text-fill"></i> Empty template</button>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body d-flex">
                            <div className="nav flex-column nav-pills me-3" id="template-tabs" role="tablist" aria-orientation="vertical">
                                {selectedContext === 'invoice' &&
                                    invoiceType.map((item, index) => (
                                        <button
                                            key={index}
                                            className={`nav-link text-start ${index === 0 ? 'active' : ''}`}
                                            id={`tab-${index}`}
                                            data-bs-toggle="pill"
                                            data-bs-target={`#template-${index}`}
                                            type="button"
                                            role="tab"
                                            aria-controls={`template-${index}`}
                                            aria-selected={index === 0}
                                        >
                                            {index + 1}. {item.name} Template
                                        </button>
                                    ))}

                                {selectedContext === 'payroll' &&
                                    payrollType.map((item, index) => (
                                        <button
                                            key={index}
                                            className={`nav-link text-start ${index === 0 ? 'active' : ''}`}
                                            id={`tab-${index}`}
                                            data-bs-toggle="pill"
                                            data-bs-target={`#template-${index}`}
                                            type="button"
                                            role="tab"
                                            aria-controls={`template-${index}`}
                                            aria-selected={index === 0}
                                        >
                                            {index + 1}. {item.name} Template
                                        </button>
                                    ))}
                            </div>

                            <div className="tab-content border-start ps-4" id="template-tabContent" style={{ flex: 1 }}>
                                {(selectedContext === 'invoice' ? invoiceType : payrollType).map((item, index) => (
                                    <div
                                        key={index}
                                        className={`tab-pane fade ${index === 0 ? 'show active' : ''}`}
                                        id={`template-${index}`}
                                        role="tabpanel"
                                        aria-labelledby={`tab-${index}`}
                                    >
                                        <div className="d-flex align-items-start mb-3">
                                            <i className="bi bi-file-earmark-text-fill text-danger fs-3 me-2"></i>
                                            <h5 className="mb-0">{item.name} Template</h5>
                                        </div>
                                        <p className="fw-semibold">
                                            {item.intro}
                                        </p>
                                        <div
                                            className="text-end text-danger fw-bold"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => { setShowForm(true), setFormData(item.formDatas) }}
                                            data-bs-dismiss="modal"
                                        >
                                            =&gt; Proceed
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>




        </div >
    )
}

export default OrderPage