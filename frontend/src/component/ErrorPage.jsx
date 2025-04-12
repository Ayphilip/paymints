import React from 'react'

function ErrorPage({ errorMessage }) {
    return (
        <div className='d-flex align-items-center justify-content-center vh-100'>
            <div class="waviy">
                <div className='card-body'>
                    <i className='bi bi-x text-red'> Error</i>
                    <p className='error-text'>{errorMessage}</p>
                </div>
            </div>
        </div>
    )
}

export default ErrorPage