import { useConnectWallet, usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png'
import { signin } from '../Actions/userActions';

function Signin() {
    const userSignin = useSelector((state) => state.userSignin);
    const { loading, userInfo, error } = userSignin;

    // Privy authentication hooks
    const { ready, authenticated, user, login, logout, connectOrCreateWallet } = usePrivy();

    // Wallet connection
    const { connectWallet } = useConnectWallet({
        onSuccess: ({ wallet }) => {
            console.log('Wallet connected successfully:', wallet);
        },
        onError: (error) => {
            console.error('Wallet connection failed:', error);
        },
    });

    const { wallets } = useSolanaWallets();

    // Navigation and dispatch
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redirect if user is already authenticated
    useEffect(() => {
        if (userInfo) {
            navigate('/dashboard', { replace: true });
        }
    }, [userInfo, navigate]);

    // Handle wallet and authentication logic
    useEffect(() => {
        if (!ready) return; // Wait until Privy is ready

        const handleWalletLogin = async () => {
            try {
                if (wallets?.length > 0) {
                    await wallets[0].loginOrLink();
                }
            } catch (err) {
                console.error('Error during wallet login:', err);
            }
        };

        const handleUserSignin = () => {
            if (authenticated && user) {
                const userData = {
                    name: user.name || '', // Fallback to empty string if undefined
                    username: user.username || '',
                    email: user.email?.address || '', // Safely access email
                    image: user.image || '',
                    address: user.wallet?.address, // Safely access wallet address
                    status: '0',
                    isAdmin: false,
                    twitterId: user.twitter?.id || '', // Safely access Twitter ID
                    website: user.website || '',
                };

                console.log('User data prepared for sign-in:', userData);
                dispatch(signin(userData));
            }
        };

        handleWalletLogin();
        handleUserSignin();

        // Cleanup function (optional, add logic if needed)
        return () => {
            // Cleanup code here if necessary
        };
    }, [ready, authenticated, user, wallets, dispatch]);

    return (
        <div className="vh-100">
            <div className="authincation h-100">
                <div className="container-fluid h-100">
                    <div className="row h-100">
                        <div className="col-lg-6 col-md-12 col-sm-12 mx-auto align-self-center">
                            <div className="login-form">
                                <div className="text-center">
                                    <h3 className="title">Get Started</h3>
                                    <p>Sign in to your account to start using Paymint</p>
                                </div>
                                {error && <p>{error.message}</p>}
                                <div>
                                    <div className="text-center mb-4">
                                        <button type="button" disabled={!ready && true}
                                            onClick={connectWallet}
                                            className="btn btn-primary btn-block">
                                            {!ready && <div className="spinner-border spinner-border-sm"></div>}
                                            {ready ? 'Connect Wallet' : ' Please Wait...'}</button>
                                    </div>

                                    <h6 className="login-title"><span>Powered using Privy</span></h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                            <div className="pages-left h-100">
                                <div className="login-content">
                                    {/* <a href="/"><img src={Logo} className="mb-3" alt="" /></a> */}
                                </div>
                                <div className="login-media text-center">
                                    <img src="public/assets/images/login.png" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signin