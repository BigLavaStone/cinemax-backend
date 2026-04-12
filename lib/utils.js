import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

// function to generate a token for a user
export const generateToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET);
    return token;
}

export const generateResetPwdToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET2, { expiresIn: '10m' });
    return token;
}

export const sendEmail = async (email, resetUrl) => {  
  const data = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    template_params: {
      'email': email,
      'link': resetUrl
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      console.log('Password reset email sent successfully!');
      return { success: true, msg: "Password reset email sent successfully!" };
    } else {
      const error = await response.text();
      console.error('Failed to send email:', error);
      return { success: false, msg: error };
    }
  } catch (err) {
    console.error('Error calling EmailJS:', err);
    return { success: false, msg: err.message };
  }
}