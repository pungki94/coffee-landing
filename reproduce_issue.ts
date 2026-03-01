import { render } from '@react-email/render';
import React from 'react';
import ResetPasswordEmail from './src/emails/ResetPasswordEmail';

async function testRender() {
    try {
        console.log('Attempting to render email...');
        const emailHtml = await render(
            React.createElement(ResetPasswordEmail, {
                userFirstname: "Test User",
                resetPasswordLink: "http://example.com"
            })
        );
        console.log('Render successful!');
        // console.log(emailHtml);
    } catch (error) {
        console.error('Render failed:', error);
    }
}

testRender();
