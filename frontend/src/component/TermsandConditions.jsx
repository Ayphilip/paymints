import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';

const TermsAndConditions = ({ onProceed, onCheckboxChange }) => {
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setIsChecked(checked);
        onCheckboxChange(checked); // Notify the parent of the checkbox state
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isChecked) {
            onProceed(); // Call the parent function to proceed (e.g., close modal, navigate, etc.)
        } else {
            alert('Please acknowledge the Terms and Conditions to proceed.');
        }
    };

    return (
        <div className="terms-container">
            <h4>Terms and Conditions</h4>
            <div
                style={{
                    maxHeight: '300px',
                    overflowY: 'auto',

                }}
            >
                {/* You can either embed the full Terms here or link to them */}
                <p>
                    <strong>Last Updated: April 10, 2025</strong>
                </p>
                <p>
                    Welcome to Paymint. By accessing or using our application, you agree to be bound by these Terms and Conditions. Please read them carefully.
                </p>
                <p>
                    <strong>1. Acceptance of Terms</strong><br />
                    By creating an account, you agree to these Terms and our Privacy Policy...
                </p>
                {/* Add the rest of the Terms here, or provide a link */}
                <p>
                    For the full Terms and Conditions, please visit{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                        this link
                    </a>.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div controlId="termsCheckbox" className="mb-3">
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                    />
                    <span>
                        I have read and agree to the{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer">
                            Terms and Conditions
                        </a>.
                    </span>
                </div>

                {/* <button variant="primary" type="submit" disabled={!isChecked}>
                    Proceed
                </button> */}
            </form>
        </div>
    );
};

export default TermsAndConditions;