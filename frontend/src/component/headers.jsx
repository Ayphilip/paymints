import React, { useEffect } from 'react'
import Logo from '../assets/logo.png'
import Stablecoin from '../assets/stablecoin.png'
import Coin from '../assets/coins.png'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { logouts } from '../Actions/userActions';
import { shortenAddress, useTokenBalance } from './utils';
import axios from 'axios';

function Headers({ props }) {
    const userSignin = useSelector(state => state.userSignin);
    const { userInfo } = userSignin;

    const { authenticated, user, logout } = usePrivy()
    const { wallets } = useSolanaWallets()
    console.log(wallets)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const logoutUser = async () => {
        logout()

        console.log(user)
        if (!user && !authenticated) {

            dispatch(logouts())
        }
    }

    const usdc_mint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    // const usdc_mint = 'So11111111111111111111111111111111111111112'
    const {
        balance,
        rawBalance,
        decimals,
        isLoading,
        error,
        refetch
    } = useTokenBalance(usdc_mint);
    console.log(balance)

    useEffect(() => {
        if (!userInfo) {
            navigate('/')
        }



        async function fetcher() {

            let body = userInfo && userInfo.token;

            axios.post("/api/authes", body, {
                headers: {
                    "Authorization": userInfo && userInfo.token,
                }
            }).then((res) => {
                if (res.data) {
                    return null;
                } else {
                    //alert('expired')
                    logoutUser();
                    // document.querySelector(".modal").classList.add("activest");
                }
            })

        }



        if (userInfo) { fetcher(); }


        return () => {

        }
    }, [userInfo])
    return (
        <div>
            <div class="nav-header">
                <a href="/" class="brand-logo">

                    <img src={Logo} class="logo-abbr" width="80" height="53" viewBox="0 0 53 53" />
                    <h1 className="brand-title" width="124px" height="33px"><strong>PAYMINT</strong></h1>
                </a>
                <div class="nav-control">
                    <div class="hamburger">
                        <span class="line"></span><span class="line"></span><span class="line"></span>
                    </div>
                </div>
            </div>

            <div className="header">
                <div className="header-content">
                    <nav className="navbar navbar-expand">
                        <div className="collapse navbar-collapse justify-content-between">
                            <div className="header-left">
                                <div className="dashboard_bar">
                                    {props}
                                </div>
                            </div>
                            <ul className="navbar-nav header-right">
                                <li className="nav-item">
                                    <a href="javascript:void(0);" className="btn btn-primary-outline btn-sm" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                                            <img src={Coin} width={'50px'} height={'50px'} />
                                            <span style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span>{balance !== null ? balance?.toFixed(4) : '0.0000'}SOL</span>
                                                <span>{userInfo?.address && shortenAddress(userInfo?.address)}</span>

                                            </span>

                                        </div>
                                    </a>
                                    <a href="javascript:void(0);" className="btn btn-primary-outline btn-sm" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                                            <img src={Stablecoin} width={'50px'} height={'50px'} />
                                            <span style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span>{balance !== null ? balance?.toFixed(4) : '0.0000'}USDC</span>
                                                <span>{userInfo?.address && shortenAddress(userInfo?.address)}</span>

                                            </span>

                                        </div>
                                        <h3 className="las la-wallet ms-3 scale5"></h3>
                                    </a>
                                </li>

                            </ul>
                        </div>
                    </nav>
                </div>
            </div>

            <div className="dlabnav">
                <div className="dlabnav-scroll">
                    <ul className="metismenu" id="menu">
                        <li className="dropdown header-profile">
                            <a className="nav-link" href="javascript:void(0);" role="button" data-bs-toggle="dropdown">
                                <img src="public/assets/images/profile/pic1.jpg" width="20" alt="" />
                                <div className="header-info ms-3">
                                    <span className="font-w600 ">Hi, <b>{userInfo?.username}</b></span>
                                    <small className="text-end font-w400"><i className="las la-wallet ms-3 scale5"></i> {userInfo?.address && shortenAddress(userInfo?.address)}</small>
                                </div>
                            </a>
                            <div className="dropdown-menu dropdown-menu-end">
                                <a href="/profile" className="dropdown-item ai-icon">
                                    <svg id="icon-user1" xmlns="http://www.w3.org/2000/svg" className="text-success" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    <span className="ms-2">Profile </span>
                                </a>
                                <a onClick={logoutUser} style={{ cursor: 'pointer' }} className="dropdown-item ai-icon">
                                    <svg id="icon-logout" xmlns="http://www.w3.org/2000/svg" className="text-danger" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                    <span className="ms-2">Logout </span>
                                </a>
                            </div>
                        </li>
                        <li>
                            <a className="has-arrow ai-icon" href="/dashboard" aria-expanded="false">
                                <i className="flaticon-025-dashboard"></i>
                                <span className="nav-text">Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a className="has-arrow ai-icon" href="/paymentorder" aria-expanded="false">
                                <i class="fa-solid fa-file-invoice-dollar fw-bold"></i>
                                <span className="nav-text">Payment Instruction</span>
                                {/* <span className="badge badge-xs badge-danger ms-3">New</span> */}
                            </a>
                        </li>
                        <li>
                            <a className="has-arrow ai-icon" href="javascript:void()" aria-expanded="false">
                                <i class="fa-solid fa-money-check-dollar fw-bold"></i>
                                <span className="nav-text">Transactions</span>
                                {/* <span className="badge badge-xs badge-danger ms-3">New</span> */}
                            </a>
                        </li>
                        <li>
                            <a className="has-arrow ai-icon" href="javascript:void()" aria-expanded="false">
                                <i class="fa-solid fa-bell fw-bold"></i>
                                <span className="nav-text">Notifications</span>
                            </a>
                        </li>
                        <li>
                            <a className="has-arrow ai-icon" href="javascript:void()" aria-expanded="false">
                                <i className="flaticon-022-copy"></i>
                                <span className="nav-text">Documentation</span>
                            </a>
                        </li>
                        <li>
                            <a className="has-arrow ai-icon" href="javascript:void()" aria-expanded="false">
                                <i className="fa-solid fa-gear fw-bold"></i>
                                <span className="nav-text">Settings</span>
                            </a>
                        </li>

                    </ul>
                    <div className="copyright">
                        <li className="nav-item dropdown notification_dropdown">
                            <a className="nav-link bell dz-theme-mode p-0" href="javascript:void(0);">
                                <i id="icon-light" className="fas fa-sun"></i>
                                <i id="icon-dark" className="fas fa-moon"></i>
                            </a>
                        </li>
                        <p><strong>Paymint</strong> © 2023 All Rights Reserved</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Headers