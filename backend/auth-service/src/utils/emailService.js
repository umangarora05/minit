const sendEmail = async (options) => {
    try {
        const data = {
            from_email: process.env.SMTP_FROM || 'otp@umangarora.in',
            from_name: 'Minit OTP',
            to_email: options.email,
            subject: options.subject,
            // FIX: Changed 'body' to 'plain_body'
            plain_body: options.message 
        };

        const response = await fetch('https://api.smtpmaster.com/api/send-email', {
            method: 'POST',
            headers: {
                'X-API-Key': process.env.otp_api,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        console.log('Message sent via API:', responseData);
        return responseData; // Added return statement
    } catch (error) {
        console.error('Error sending email via API:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;