import React from 'react';

interface PaystackProviderProps {
  children: React.ReactNode;
}

const PaystackProvider: React.FC<PaystackProviderProps> = ({ children }) => {
  // Simplified version for now - load Paystack script dynamically when needed
  React.useEffect(() => {
    // Load Paystack script if not already loaded
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return <>{children}</>;
};

export default PaystackProvider;
