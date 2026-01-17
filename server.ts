import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import React from 'react';
import fs from 'fs';
import path from 'path';
import ResetPasswordEmail from './src/emails/ResetPasswordEmail';
import WelcomeEmail from './src/emails/WelcomeEmail';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' or configure host/port for others
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

// Persistence Setup
const DATA_FILE = path.join(process.cwd(), 'users.json');

// Load users from file
let users: any[] = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    users = JSON.parse(data);
    console.log(`Loaded ${users.length} users from storage.`);
  } else {
    console.log('No users file found, starting with empty database.');
  }
} catch (error) {
  console.error('Failed to load users:', error);
}

// Helper to save users
const saveUsers = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
    console.log('Users saved to file.');
  } catch (error) {
    console.error('Failed to save users:', error);
  }
};

const resetTokens: Record<string, string> = {}; // token -> email

app.post('/api/register', async (req, res) => {
  console.log('Assuming register request:', req.body);
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (users.find(u => u.email === email)) {
    console.log('User already exists:', email);
    return res.status(400).json({ error: 'User already exists' });
  }

  users.push({ name, email, password });
  saveUsers(); // Persist changes
  console.log('User registered:', email);

  // Send Welcome Email
  try {
    const emailHtml = await render(
      React.createElement(WelcomeEmail, {
        userFirstname: name,
      })
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Coffee Bliss!',
      html: emailHtml,
    });
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't fail the registration if email fails, but log it
  }

  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ message: 'Login successful', user: { name: user.name, email: user.email } });
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Check if user exists (optional, but good practice for real app simulation)
  const user = users.find(u => u.email === email);
  if (!user) {
    // For security, usually don't reveal if email exists, but for this dev task:
    return res.status(404).json({ error: 'User not found' });
  }

  const token = Math.random().toString(36).substring(2, 15);
  resetTokens[token] = email;

  try {
    const emailHtml = await render(
      React.createElement(ResetPasswordEmail, {
        userFirstname: user.name,
        // Update URL to point to localhost:5173/coffee-landing/reset-password
        // Note: The frontend is served at /coffee-landing
        resetPasswordLink: `http://localhost:5173/coffee-landing/reset-password?token=${token}&email=${encodeURIComponent(email)}`,
      })
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password - Coffee Bliss',
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
});

app.post('/api/reset-password', (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (resetTokens[token] !== email) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update password
  users[userIndex].password = newPassword;
  saveUsers(); // Persist changes

  // Invalidate token
  delete resetTokens[token];

  console.log('Password reset for user:', email);
  res.json({ message: 'Password updated successfully' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
