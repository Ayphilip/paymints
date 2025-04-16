import React from 'react'
import Headers from '../component/headers'
import Footer from '../component/Footer'
import SolanaTransactionFetcher from '../component/TransactionFetcher'

function TransactionView() {
    return (
        <div id='main-wrapper'>
            <Headers />

            <div class="content-body">
                <div class="container-fluid">
                    <SolanaTransactionFetcher />
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default TransactionView