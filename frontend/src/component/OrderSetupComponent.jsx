import React, { useEffect, useRef, useState } from 'react'
import { generate7DigitId, invoiceType, networkConfig, networkType, orderContext, payrollInterval, payrollType } from './utils';
import TermsAndConditions from './TermsandConditions';
import OrderView from './orderView';
import { useDispatch, useSelector } from 'react-redux';
import { saveOrder } from '../Actions/orderActions';
import QRCode from 'react-qr-code';



function OrderSetupComponent({ comps, formDatas }) {
    const [activeTab, setActiveTab] = useState(comps);

    const orderSave = useSelector(state => state.orderSave);
    const { loading: loadingOrderSave, success: successOrderSave, order: orderSuccessResponse, error: errorOrderSave } = orderSave;

    const [showForm, setShowForm] = useState(false)
    const [selectedContext, setSelectedContext] = useState(0)

    const [isTermsChecked, setIsTermsChecked] = useState(false);

    const [errPg1, setErrPg1] = useState(false)
    const [errPg2, setErrPg2] = useState(false)
    const [errPg3, setErrPg3] = useState(false)
    const [errPg4, setErrPg4] = useState(false)

    const [formData, setFormData] = useState(formDatas);
    const invoice = generate7DigitId()

    const dispatch = useDispatch()

    const saveFormData = () => {

        dispatch(saveOrder(formData))
    }

    const handleProceedFromTerms = () => {
        if (isTermsChecked) {
            alert('Template selected and terms accepted! Proceeding...');
            // handleClose();
        } else {
            alert('Please acknowledge the Terms and Conditions to proceed.');
        }
    };

    const handleCheckboxChange = (checked) => {
        setIsTermsChecked(checked); // Update the parent's state when checkbox changes
    };

    // === Handlers ===
    const handleInputChange = (e, index, field, arrayType) => {
        const value = e.target.value;
        const newArray = [...formData[arrayType]];
        newArray[index][field] = value;
        if (arrayType === "items") {
            newArray[index].total = newArray[index].quantity * newArray[index].unitPrice;
        }
        setFormData({ ...formData, [arrayType]: newArray });
        calculateTotals();
    };

    const handleDiscountCodeChange = (e, index, field) => {
        const value = e.target.value;
        const newDiscountCodes = [...formData.discountCodes];
        newDiscountCodes[index][field] = value;
        setFormData({ ...formData, discountCodes: newDiscountCodes });
        calculateTotals();
    };

    const addField = (arrayType, newItem) => {
        setFormData({ ...formData, [arrayType]: [...formData[arrayType], newItem] });
    };

    const removeField = (arrayType, index) => {
        const newArray = [...formData[arrayType]];
        newArray.splice(index, 1);
        setFormData({ ...formData, [arrayType]: newArray });
        calculateTotals();
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + Number(item.total), 0);
        const discount = formData.discountCodes.reduce(
            (sum, dc) => sum + (subtotal * Number(dc.discountPercent || 0)) / 100,
            0
        ) + Number(formData.discount);
        const taxAmount = (subtotal * Number(formData.taxRate)) / 100;
        const totalAmount = subtotal + taxAmount - discount;
        // setFormData((prev) => ({ ...prev, subtotal, discount, taxAmount, totalAmount }));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setFormData({ ...formData, orderType: tab, isPayroll: tab === "payroll" });
    };

    const copyToClipboard = (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(orderLink).then(() => {
            alert('Link copied to clipboard!');
        });
    };

    const modalRef = useRef(null);

    const orderLink = `http://localhost:5173/orders/${order?._id || ''}/pay?orderNo=${order.orderNo}`;

    // Set up modal event listener for close
    useEffect(() => {
        const modalEl = modalRef.current;

        const handleModalClose = () => {
            if (successOrderSave) {
                window.location.reload();
            }
        };

        modalEl?.addEventListener('hidden.bs.modal', handleModalClose);

        return () => {
            modalEl?.removeEventListener('hidden.bs.modal', handleModalClose);
        };
    }, [successOrderSave]);
    return (
        <div class="row">
            <div class="col-xl-4">
                <div class="filter cm-content-box box-primary">
                    <div class="content-title">
                        <div class="cpa">
                            Context
                        </div>
                    </div>
                    <div class="cm-content-body form excerpt">
                        <div class="card-body">
                            {orderContext.map((item, index) =>
                                <div style={{ cursor: 'pointer' }}
                                    // onClick={() => setSelectedContext(index)} 
                                    key={index} class={selectedContext === index ? "filter cm-content-box box-primary border" : "filter cm-content-box box-primary border"}>
                                    <div class="content-title border-0">
                                        <div class={selectedContext === index && "cpa"}>
                                            <strong>{index + 1}</strong>
                                        </div>
                                        <div class={selectedContext === index && "cpa"}>{item}</div>
                                    </div>
                                </div>)}
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-8">
                <div class="filter cm-content-box rounded-0 box-primary">



                    <div class="col-lg-12 p-4 order-lg-1">
                        <h4 class="mb-3">{orderContext[selectedContext]}</h4>


                        <div className="container p-4">

                            <div className="">

                                {selectedContext === 0 && <>
                                    {errPg1 && <span className='mb-3 text-red'>Fill up required columns.</span>}
                                    <div className="mb-3">
                                        <div className="col mb-3">
                                            <label>Order Title <i className='cpa text-red'>*</i></label>
                                            <input
                                                className="form-control"
                                                style={{ borderColor: errPg1 && !formData.orderTitle && '#ff0000' }}
                                                value={formData.orderTitle}
                                                onChange={(e) => setFormData({ ...formData, orderTitle: e.target.value })}
                                            />
                                        </div>
                                        <div className="col mb-3">
                                            <label>Order Description <i className='cpa text-red'>*</i></label>
                                            <textarea
                                                className="form-control"
                                                style={{ borderColor: errPg1 && !formData.orderDescription && '#ff0000' }}
                                                value={formData.orderDescription}
                                                onChange={(e) => setFormData({ ...formData, orderDescription: e.target.value })}
                                            ></textarea>
                                        </div>

                                        <div className="col mb-3">
                                            <label>Order Status <i className='cpa text-red'>*</i></label>
                                            <select
                                                className="form-control"
                                                value={formData.orderStatus}
                                                style={{ borderColor: errPg1 && !formData.orderStatus && '#ff0000' }}
                                                onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col">
                                            <label>Service Type ({comps}) <i className='cpa text-red'>*</i></label>
                                            {comps === 'invoice' ? <select
                                                className="form-control"
                                                value={formData.invoiceType}
                                                style={{ borderColor: errPg1 && !formData.invoiceType && '#ff0000' }}
                                                onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
                                            >
                                                {invoiceType.map((item, index) =>
                                                    <option key={index} value={index}>{item.name}</option>
                                                )}
                                            </select> : comps === 'payroll' ? <select
                                                className="form-control"
                                                value={formData.payrollType}
                                                style={{ borderColor: errPg1 && !formData.payrollType && '#ff0000' }}
                                                onChange={(e) => setFormData({ ...formData, payrollType: e.target.value })}
                                            >
                                                {payrollType.map((item, index) =>
                                                    <option key={index} value={index}>{item.name}</option>
                                                )}
                                            </select> : null}
                                        </div>
                                    </div>
                                </>}

                                {selectedContext === 1 && <>

                                    {errPg2 && <span className='mb-3 text-red'>Fill up required columns.</span>}

                                    {activeTab === "invoice" && (
                                        <>

                                            {/* Items */}
                                            <>
                                                <h5>Items</h5>
                                                {errPg2 && formData.orderType === 'invoice' && formData.orderType === (2 || 3 || 5) && !formData.items.length && <span>No items added yet</span>}


                                                {formData.items.map((item, index) => (
                                                    <div key={index} className="card border mb-3">
                                                        <div className="card-header d-flex justify-content-between align-items-center">
                                                            <span>Item {index + 1}</span>
                                                            <div className="d-flex align-items-center gap-3">

                                                                <button
                                                                    className="btn btn-sm btn-light"
                                                                    data-bs-toggle="collapse"
                                                                    data-bs-target={`#collapse${index}`}
                                                                    aria-expanded="false"
                                                                    aria-controls={`collapse${index}`}
                                                                >
                                                                    <i className="fas fa-angle-down"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="collapse" id={`collapse${index}`}>
                                                            <div className="card-body">
                                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                                    <div></div>
                                                                    <button className="btn btn-danger" onClick={() => removeField("items", index)}>
                                                                        <i className='ti ti-trash'></i> Delete
                                                                    </button>
                                                                </div>

                                                                <div className="card-body">

                                                                    <div className="col mb-2">
                                                                        <label>Item Name <i className='cpa text-red'>*</i></label>
                                                                        <input
                                                                            placeholder="Item Title"
                                                                            className="form-control"
                                                                            value={item.title}
                                                                            onChange={(e) => handleInputChange(e, index, "title", "items")}
                                                                        />
                                                                    </div>
                                                                    <div className="col mb-2">
                                                                        <label>Qty <i className='cpa text-red'>*</i></label>
                                                                        <input
                                                                            type="number"
                                                                            placeholder="Qty"
                                                                            className="form-control"
                                                                            value={item.quantity}
                                                                            onChange={(e) => handleInputChange(e, index, "quantity", "items")}
                                                                        />
                                                                    </div>
                                                                    <div className="col mb-2">
                                                                        <label>Unit Price <i className='cpa text-red'>*</i></label>
                                                                        <input
                                                                            type="number"
                                                                            placeholder="Unit Price"
                                                                            className="form-control"
                                                                            value={item.unitPrice}
                                                                            onChange={(e) => handleInputChange(e, index, "unitPrice", "items")}
                                                                        />
                                                                    </div>
                                                                    {/* <div className="col mb-2">
                                                                        <input className="form-control" disabled value={item.total} />
                                                                    </div> */}

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    className="btn btn-primary mb-3"
                                                    onClick={() =>
                                                        addField("items", {
                                                            title: "New Item",
                                                            description: "",
                                                            quantity: 1,
                                                            unitPrice: 1,
                                                            skuCode: "",
                                                            stockAvailable: 10,
                                                            total: 0,
                                                            image: "",
                                                        })
                                                    }
                                                >
                                                    + Add Item
                                                </button>
                                            </>

                                            {/* Discount Codes */}
                                            <h5>Discount Codes</h5>
                                            {formData.discountCodes.map((dc, index) => (
                                                <div key={index} className="row mb-2">
                                                    <div className="col">
                                                        <label>Discount Code <i className='cpa text-red'>*</i></label>
                                                        <input
                                                            placeholder="Code"
                                                            className="form-control"
                                                            style={{ borderColor: errPg2 && !dc.code && '#ff0000' }}
                                                            value={dc.code}
                                                            onChange={(e) => handleDiscountCodeChange(e, index, "code")}
                                                        />
                                                    </div>
                                                    <div className="col">
                                                        <label>Discount Percent (%) <i className='cpa text-red'>*</i></label>
                                                        <input
                                                            type="number"
                                                            placeholder="Discount %"
                                                            className="form-control"
                                                            style={{ borderColor: errPg2 && !dc.discountPercent && '#ff0000' }}
                                                            value={dc.discountPercent}
                                                            onChange={(e) => handleDiscountCodeChange(e, index, "discountPercent")}
                                                        />
                                                    </div>
                                                    <div className="col-auto">
                                                        <button className="btn btn-danger" onClick={() => removeField("discountCodes", index)}>
                                                            X
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                className="btn btn-primary mb-3"
                                                onClick={() => addField("discountCodes", { code: "", discountPercent: 1 })}
                                            >
                                                + Add Discount Code
                                            </button>


                                        </>
                                    )}

                                    {activeTab === "payroll" && (
                                        <>
                                            <div class="mb-3">
                                                NB: Payment Type are only applicable to Reccurable payments (Hourly and Fixed), others are automatically one-Time Payments
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col">
                                                    <label>Payment Type</label>
                                                    <select
                                                        className="form-control"
                                                        disabled={formData.payrollType > 1 ? true : false}
                                                        value={formData.paymentType}
                                                        onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                                                    >
                                                        {payrollInterval.map((item, index) => <option value={index}>{item}</option>)}

                                                    </select>

                                                </div>
                                                <div className="col">
                                                    <label>Pay Cycle Start</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        style={{ borderColor: errPg2 && !formData.payCycleStart && '#ff0000' }}
                                                        value={formData.payCycleStart}
                                                        onChange={(e) => setFormData({ ...formData, payCycleStart: e.target.value })}
                                                    />
                                                </div>
                                                {formData.paymentType == 1 && <div className="col">
                                                    <label>Pay Cycle End</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        style={{ borderColor: errPg2 && formData.paymentType === 1 && !formData.payCycleEnd && '#ff0000' }}
                                                        value={formData.payCycleEnd}
                                                        onChange={(e) => setFormData({ ...formData, payCycleEnd: e.target.value })}
                                                    />
                                                </div>}
                                            </div>

                                            {/* Recipients */}
                                            <h5>Recipients</h5>

                                            {formData.recipients.map((recipient, index) => (
                                                <div key={index} className="card border mb-3">
                                                    <div className="card-header d-flex justify-content-between align-items-center">
                                                        <span>Recipient {index + 1}</span>
                                                        <div className="d-flex align-items-center gap-3">

                                                            <button
                                                                className="btn btn-sm btn-light"
                                                                data-bs-toggle="collapse"
                                                                data-bs-target={`#collapse${index}`}
                                                                aria-expanded="false"
                                                                aria-controls={`collapse${index}`}
                                                            >
                                                                <i className="fas fa-angle-down"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="collapse" id={`collapse${index}`}>
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                <div></div>
                                                                <button className="btn btn-danger"
                                                                    onClick={() => removeField("recipients", index)}>
                                                                    <i className='ti ti-trash'></i> Delete
                                                                </button>
                                                            </div>

                                                            <div className="card-body">

                                                                <div className="col mb-2">
                                                                    <input
                                                                        placeholder="Name"
                                                                        className="form-control"
                                                                        value={recipient.name}
                                                                        onChange={(e) => handleInputChange(e, index, "name", "recipients")}
                                                                    />
                                                                </div>
                                                                <div className="col mb-2">
                                                                    <input
                                                                        placeholder="Email"
                                                                        className="form-control"
                                                                        value={recipient.email}
                                                                        onChange={(e) => handleInputChange(e, index, "email", "recipients")}
                                                                    />
                                                                </div>
                                                                <div className="col mb-2">
                                                                    <input
                                                                        placeholder="Wallet Address"
                                                                        className="form-control"
                                                                        value={recipient.walletAddress}
                                                                        onChange={(e) => handleInputChange(e, index, "walletAddress", "recipients")}
                                                                    />
                                                                </div>
                                                                <div className="col mb-2">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Net Pay"
                                                                        className="form-control"
                                                                        value={recipient.netPay}
                                                                        onChange={(e) => handleInputChange(e, index, "netPay", "recipients")}
                                                                    />
                                                                </div>


                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}


                                            <button
                                                className="btn btn-primary mb-3"
                                                onClick={() =>
                                                    addField("recipients", {
                                                        name: "",
                                                        email: "",
                                                        walletAddress: "",
                                                        payType: "crypto",
                                                        grossPay: 0,
                                                        netPay: 0,
                                                        bonuses: [],
                                                        deductions: [],
                                                        paid: false,
                                                        txHash: "",
                                                    })
                                                }
                                            >
                                                + Add Recipient
                                            </button>
                                        </>
                                    )}

                                    {<div className="row mb-3">

                                        <div className="col">
                                            <label>Total Amount</label>
                                            <input className="form-control" type='number' value={formData.totalAmount}
                                                style={{ borderColor: errPg2 && !formData.totalAmount && '#ff0000' }}
                                                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })} />
                                        </div>
                                    </div>}
                                </>}


                                {selectedContext === 2 && <>

                                    <div className="row mb-3">
                                        <h4 className='cpa mb-3'>Blockchain Settings</h4>

                                        <div className="col">
                                            <label>Chain</label>
                                            <select
                                                className="form-control"
                                                value={formData.chain}
                                                onChange={(e) => setFormData({ ...formData, chain: e.target.value })}
                                            >
                                                {networkConfig.map((item, index) =>
                                                    <option value={item.nativeCurrency.symbol}>{item.name} ({item.nativeCurrency.symbol})</option>
                                                )}
                                            </select>
                                        </div>
                                        <div className="col">
                                            <label>Network</label>
                                            <select
                                                className="form-control"
                                                value={formData.network}
                                                onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                                            >
                                                {networkType.map((item, index) =>
                                                    <option value={index.toString()}>{item}</option>
                                                )}
                                            </select>
                                        </div>
                                        <div className="col">
                                            <label>Stablecoin Symbol</label>
                                            <select
                                                className="form-control"
                                                value={formData.stablecoinSymbol}
                                                onChange={(e) => setFormData({ ...formData, stablecoinSymbol: e.target.value })}
                                            >
                                                {networkConfig.find((item) => formData.chain === item.nativeCurrency.symbol && formData.network === item.type)?.majorTokens.map(item =>
                                                    <option value={item.symbol}>{item.name} ({item.symbol})</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    {comps === 'invoice' &&
                                        <>
                                            <div className="mb-3">
                                                <label>Notes</label>
                                                <textarea
                                                    className="form-control"
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label>Terms and Conditions</label>
                                                <textarea
                                                    className="form-control"
                                                    value={formData.termsAndConditions}
                                                    onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                                                />
                                            </div>
                                        </>}
                                </>}


                                {selectedContext === 3 && <>

                                    <div className="card border mb-3">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <span>Invoice Expirable</span>
                                            <div className="d-flex align-items-center gap-3">

                                                <button
                                                    className="btn btn-sm btn-light"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target="#collapseExpirable"
                                                    aria-expanded="false"
                                                    aria-controls="collapseExpirable"
                                                >
                                                    <i className="fas fa-angle-down"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="collapse" id="collapseExpirable">

                                            <div className="card-body">
                                                <p className="mb-3">When enabled, the invoice will become inactive after set due date.</p>
                                                <div className="form-check mb-3 toggle-switch d-flex justify-content-between align-items-center form-switch">
                                                    <input className="form-check-input"
                                                        type="checkbox"
                                                        id="flexSwitchCheck"
                                                        checked={formData.isExpirable}
                                                        onChange={(e) => setFormData({ ...formData, isExpirable: e.target.checked })} />
                                                </div>
                                                <label className="form-label">Due Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    disabled={formData.isExpirable ? false : true}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, dueDate: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>


                                    <div className="card border mb-3">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <span>Client information</span>
                                            <div className="d-flex align-items-center gap-3">

                                                <button
                                                    className="btn btn-sm btn-light"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target="#collapseClient"
                                                    aria-expanded="false"
                                                    aria-controls="collapseClient"
                                                >
                                                    <i className="fas fa-angle-down"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="collapse" id="collapseClient">
                                            <div className="card-body">
                                                <div className="form-check toggle-switch d-flex justify-content-between align-items-center form-switch">
                                                    <input className="form-check-input"
                                                        type="checkbox"
                                                        id="tipOptionEnabled"
                                                        checked={formData.isClientInformation}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, isClientInformation: e.target.checked })
                                                        } />
                                                </div>

                                                <div className="card-body">
                                                    <p className="mb-2">Address the invoice order to a particular entity or organisation.</p>

                                                    <div className="col mb-3">
                                                        <label>Client Name</label>
                                                        <input
                                                            className="form-control"
                                                            disabled={formData.isClientInformation ? false : true}
                                                            value={formData.clientName}
                                                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col mb-3">
                                                        <label>Client Email</label>
                                                        <input
                                                            className="form-control"
                                                            disabled={formData.isClientInformation ? false : true}
                                                            value={formData.clientEmail}
                                                            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col mb-3">
                                                        <label>Client Address</label>
                                                        <input
                                                            className="form-control"
                                                            disabled={formData.isClientInformation ? false : true}
                                                            value={formData.clientAddress}
                                                            onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                                                        />
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- TIP OPTION ENABLED --- */}
                                    <div className="card border mb-3">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <span>Tip Option Enabled</span>
                                            <div className="d-flex align-items-center gap-3">

                                                <button
                                                    className="btn btn-sm btn-light"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target="#collapseTip"
                                                    aria-expanded="false"
                                                    aria-controls="collapseTip"
                                                >
                                                    <i className="fas fa-angle-down"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="collapse" id="collapseTip">
                                            <div className="card-body">
                                                <p className="mb-3">When enabled, the client will receive an option to tip or not to tip.</p>
                                                <div className="form-check toggle-switch d-flex justify-content-between align-items-center form-switch">
                                                    <input className="form-check-input"
                                                        type="checkbox"
                                                        id="tipOptionEnabled"
                                                        checked={formData.tipOptionEnabled}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, tipOptionEnabled: e.target.checked })
                                                        } />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- QR CODE ENABLED --- */}
                                    <div className="card border mb-3">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <span>QR Code Enabled</span>
                                            <div className="d-flex align-items-center gap-3">

                                                <button
                                                    className="btn btn-sm btn-light"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target="#collapseQR"
                                                    aria-expanded="false"
                                                    aria-controls="collapseQR"
                                                >
                                                    <i className="fas fa-angle-down"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="collapse" id="collapseQR">

                                            <div className="card-body">
                                                <p className="mb-3">A QR code will be generated for the invoice when this option is enabled.</p>

                                                <div className="form-check toggle-switch d-flex justify-content-between align-items-center form-switch">
                                                    <input className="form-check-input"
                                                        type="checkbox"
                                                        id="QRcodeEnabled"
                                                        checked={formData.QRcodeEnabled}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, QRcodeEnabled: e.target.checked })
                                                        } />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- AUTO EMAIL RECEIPT --- */}
                                    <div className="card border mb-3">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <span>Auto Email Receipt</span>
                                            <div className="d-flex align-items-center gap-3">

                                                <button
                                                    className="btn btn-sm btn-light"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target="#collapseEmail"
                                                    aria-expanded="false"
                                                    aria-controls="collapseEmail"
                                                >
                                                    <i className="fas fa-angle-down"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="collapse" id="collapseEmail">

                                            <div className="card-body">
                                                <p className="mb-3">When enabled, the client will automatically receive a receipt via email after payment.</p>
                                                <div className="form-check toggle-switch d-flex justify-content-between align-items-center form-switch">
                                                    <input className="form-check-input"
                                                        type="checkbox"
                                                        id="autoEmailReceipt"
                                                        checked={formData.autoEmailReceipt}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, autoEmailReceipt: e.target.checked })
                                                        } />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <TermsAndConditions onProceed={handleProceedFromTerms}
                                        onCheckboxChange={handleCheckboxChange} />
                                </>}
                            </div>
                        </div>

                    </div>
                    <div class="filter cm-content-box box-primary style-1 mb-0 border-0">
                        <div class="content-title">

                            {selectedContext >= 1 ? <div style={{ cursor: 'pointer' }} onClick={() => setSelectedContext(selectedContext - 1)} class="cpa">
                                Previous
                            </div> : <div></div>}
                            <button type="button"
                                onClick={() => {
                                    if (selectedContext === (orderContext.length - 1)) {
                                        // handleProceedFromTerms()
                                        if (selectedContext === (orderContext.length - 1) && !isTermsChecked) {
                                            alert('Accept Terms Bitch')
                                        }
                                    } else {
                                        if (selectedContext === 0) {
                                            if (!formData.orderTitle || !formData.orderDescription || !formData.orderStatus || (formData.orderType === 'invoice' && !formData.invoiceType) || (formData.orderType === 'payroll' && !formData.payrollType)) {
                                                setErrPg1(true)
                                                return
                                            }
                                            setErrPg1(false)
                                            setSelectedContext(selectedContext + 1)
                                        }
                                        if (selectedContext === 1) {
                                            const isInvoice = formData.orderType === 'invoice';
                                            const isPayroll = formData.orderType === 'payroll';

                                            // Invoice-specific checks
                                            const isInvalidInvoiceType = [2, 3, 5].includes(formData.invoiceType);
                                            const isInvoiceItemsEmpty = isInvoice && formData.items.length === 0;

                                            const hasInvalidDiscountCodes =
                                                formData.discountCodes &&
                                                formData.discountCodes.some(dc => !dc.code || !dc.discountPercent);

                                            // Payroll-specific checks
                                            const isPayrollNoRecipients = isPayroll && formData.recipients.length === 0;

                                            const hasInvalidRecipients =
                                                isPayroll &&
                                                formData.recipients.length > 0 &&
                                                formData.recipients.some(rc => !rc.name || !rc.walletAddress);

                                            const isMissingPayCycle =
                                                isPayroll && (
                                                    (formData.paymentType === 1 && !formData.payCycleEnd) ||
                                                    !formData.payCycleStart
                                                );

                                            const isTotalAmountMissing = (isPayroll && !formData.totalAmount) || isInvoice && [1, 3, 4, 6].includes(formData.invoiceType) && !formData.totalAmount

                                            const hasErrors = (
                                                isInvoiceItemsEmpty ||
                                                hasInvalidDiscountCodes ||
                                                isPayrollNoRecipients ||
                                                hasInvalidRecipients ||
                                                isMissingPayCycle || isTotalAmountMissing
                                            );

                                            if (hasErrors) {
                                                setErrPg2(true);
                                                return;
                                            }

                                            setErrPg2(false);
                                            setSelectedContext(selectedContext + 1);
                                        }

                                        setSelectedContext(selectedContext + 1)
                                    }
                                }}
                                data-bs-toggle={selectedContext === (orderContext.length - 1) && isTermsChecked && "modal"}
                                data-bs-target={selectedContext === (orderContext.length - 1) && isTermsChecked && "#orderModalView"}
                                class="btn btn-secondary my-2">{selectedContext === (orderContext.length - 1) ? 'Preview' : 'Next'}</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="orderModalView" tabIndex="-1" aria-labelledby="orderModalView" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content p-3">
                        <OrderView data={formData} />

                        <div><button onClick={saveFormData}
                            data-bs-toggle={"modal"}
                            data-bs-target={"#exampleModalCenter"}
                            className='btn btn-danger'>Confirm, Submit Information</button></div>
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
                            {loadingOrderSave && <>
                                <i className='spinner spinner-border text-red'></i>
                                <div>Loading Order Save...</div>
                            </>}

                            {errorOrderSave && <>
                                <i className="bi bi-x text-danger" style={{ fontSize: '80px' }}></i>
                                <div className="text-danger">{errorOrderSave}</div>
                            </>}

                            {successOrderSave && (
                                <>
                                    <i className="bi bi-check2-circle text-success" style={{ fontSize: '80px' }}></i>
                                    <h3 className="mt-3">Success Saving Order</h3>
                                    <div className="d-flex justify-content-center mt-4">
                                        {orderSuccessResponse.QRcodeEnabled && <QRCode value={orderLink} size={128} />}
                                    </div>
                                </>
                            )}

                            {orderSuccessResponse && (
                                <form className="mt-4" onSubmit={copyToClipboard}>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            readOnly
                                            value={orderLink}
                                            className="form-control"
                                        />
                                        <button type="submit" className="btn btn-primary input-group-text">
                                            <i className="bi bi-clipboard"></i> Copy
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderSetupComponent