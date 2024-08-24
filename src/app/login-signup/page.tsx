import React from 'react';
import LoginSignup from '@/components/LoginSignup';
import RootLayout from '../layout';

const LoginSignupPage: React.FC = () => {
    return (
        <RootLayout>
            <LoginSignup />
        </RootLayout>
    );
};

export default LoginSignupPage;