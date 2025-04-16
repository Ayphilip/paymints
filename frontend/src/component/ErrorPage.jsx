import React from 'react'

function ErrorPage({ errorMessage }) {
    return (
        <div className='d-flex align-items-center justify-content-center vh-100'>
            <div class="waviy">
                <div className='card-body'>
                    <h4><i className='bi bi-x text-red'> Error</i></h4>
                    <h2 className='error-text'>{errorMessage}</h2>
                </div>
            </div>
        </div>
    )
}

export default ErrorPage