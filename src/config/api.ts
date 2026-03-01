// @ts-nocheck
// This file contains both Google Apps Script backend code and TypeScript frontend code
// TypeScript checking is disabled for Google Apps Script compatibility

function testAuth() {
    // Run this function ONLY ONCE in the editor to authorize all scopes.
    DriveApp.getRootFolder();
    SpreadsheetApp.getActiveSpreadsheet();
    MailApp.getRemainingDailyQuota();
    console.log("Authorization Successful");
}


function doGet(e: any) {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    // Safety check for running in editor
    if (!e || !e.parameter) {
        return output.setContent(JSON.stringify({
            error: "This script must be deployed as a Web App. Do not run directly in editor."
        }));
    }

    const sheetName = e.parameter.sheet || 'products';

    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = ss.getSheetByName(sheetName);

        // Fallback: Case-insensitive search
        if (!sheet) {
            const sheets = ss.getSheets();
            for (let i = 0; i < sheets.length; i++) {
                if (sheets[i].getName().toLowerCase() === sheetName.toLowerCase()) {
                    sheet = sheets[i];
                    break;
                }
            }
        }

        if (!sheet) {
            return output.setContent(JSON.stringify({ error: "Sheet not found: " + sheetName }));
        }

        const data = sheet.getDataRange().getValues();
        if (data.length === 0) {
            return output.setContent(JSON.stringify({ products: [], menu: [] }));
        }

        const headers = data[0];
        const rows = data.slice(1);

        const result = rows.map(row => {
            const obj: { [key: string]: any } = {};
            headers.forEach((header, index) => {
                obj[header] = row[index];
            });
            return obj;
        });

        const responseObj: { [key: string]: any } = {};
        responseObj[sheetName === 'products' ? 'products' : 'menu'] = result;
        responseObj.timestamp = new Date().toISOString();

        return output.setContent(JSON.stringify(responseObj));

    } catch (error) {
        return output.setContent(JSON.stringify({ error: error.toString() }));
    }
}

function doPost(e: any) {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    // Safety check
    if (!e) {
        return output.setContent(JSON.stringify({ status: 'error', error: "Do not run directly." }));
    }

    try {
        let data = {};
        let action = '';

        // 1. ROBUST PARSING (Text/Plain JSON vs FormData)
        if (e.postData && e.postData.contents) {
            try {
                data = JSON.parse(e.postData.contents);
                action = data.action;
            } catch (jsonErr) {
                data = e.parameter;
            }
        } else {
            data = e.parameter;
        }

        // fallback action
        if (!action && data && data.action) {
            action = data.action;
        }
        if (!action && e.parameter && e.parameter.action) {
            action = e.parameter.action;
        }

        if (!action) {
            if (data && (data.Name || data.email || data.Message)) {
                action = 'contact';
            } else {
                return output.setContent(JSON.stringify({ status: 'error', error: "No 'action' specified" }));
            }
        }

        // 2. Route Action
        if (action === 'register') {
            return handleRegister(data, output);
        } else if (action === 'login') {
            return handleLogin(data, output);
        } else if (action === 'verify_email') {
            return handleVerifyEmail(data, output);
        } else if (action === 'forgot_password') {
            return handleForgotPassword(data, output);
        } else if (action === 'reset_password') {
            return handleResetPassword(data, output);
        } else if (action === 'contact') {
            return handleContact(data, output);
        } else if (action === 'order') {
            return handleOrder(data, output);
        } else if (action === 'addProduct') {
            return handleAddProduct(data, output);
        } else if (action === 'editProduct') {
            return handleEditProduct(data, output);
        } else if (action === 'deleteProduct') {
            return handleDeleteProduct(data, output);
        } else if (action === 'getAllSheetsData') {
            return handleGetAllSheetsData(output);
        } else {
            return output.setContent(JSON.stringify({ status: 'error', error: 'Invalid action: ' + action }));
        }

    } catch (error) {
        return output.setContent(JSON.stringify({ status: 'error', error: error.toString() }));
    }
}

// --- Handlers ---

function handleRegister(data, output) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Users");
    if (!sheet) {
        sheet = ss.insertSheet("Users");
        // Updated Headers with Verification Columns
        sheet.appendRow(["Timestamp", "Name", "Email", "Password", "VerificationToken", "IsVerified"]);
    }

    const values = sheet.getDataRange().getValues();
    // Check Duplicate (Column C = Index 2)
    for (let i = 1; i < values.length; i++) {
        if (values[i][2] && values[i][2].toString().toLowerCase() === data.email.toLowerCase()) {
            return output.setContent(JSON.stringify({ status: 'error', error: 'Email already exists' }));
        }
    }

    // Verification Token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    // Default IsVerified to FALSE (or "FALSE" string to be safe in sheet)
    const isVerified = "FALSE";

    // Append new user
    sheet.appendRow([new Date(), data.name, data.email, data.password, token, isVerified]);

    // Send Verification Email
    // Frontend must pass 'verifyLinkBase' e.g., "https://domain.com/verify-email"
    const verifyBase = data.verifyLinkBase;

    if (verifyBase) {
        const fullLink = verifyBase + "?email=" + encodeURIComponent(data.email) + "&token=" + token;
        try {
            MailApp.sendEmail({
                to: data.email,
                subject: "Cafe Beans - Verify Your Account",
                htmlBody: `
                <h2>Welcome to Cafe Beans!</h2>
                <p>Please verify your email address to activate your account.</p>
                <p><a href="${fullLink}" style="background-color: #6F4E37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
                <p>Or click this link: ${fullLink}</p>
            `
            });
        } catch (e) {
            // If email fails, we still registered them, but they might need to resend (not implemented)
            // For now, just log or ignore.
        }
    }

    return output.setContent(JSON.stringify({ status: 'success', message: 'Registration successful. Please check your email to verify.' }));
}

function handleLogin(data, output) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Users");
    if (!sheet) return output.setContent(JSON.stringify({ status: 'error', error: 'User database empty' }));

    const values = sheet.getDataRange().getValues();
    // Login Check (Col C=Email, Col D=Password)
    for (let i = 1; i < values.length; i++) {
        if (values[i][2] && values[i][2].toString().toLowerCase() === data.email.toLowerCase() &&
            values[i][3] && values[i][3].toString() === data.password) {

            // Check Verification (Column F = Index 5)
            // Improved Logic:
            // 1. If explicitly "FALSE", deny.
            // 2. If empty but Token (Col E) exists, it means it's a new unverified user (maybe column F failed to write), so deny.
            // 3. Only if empty AND Token is empty (legacy), or explicitly "TRUE", allow.

            const tokenVal = values[i][4];
            const isVerifiedVal = values[i][5];

            const isVerifiedStr = isVerifiedVal ? isVerifiedVal.toString().toUpperCase() : "";

            if (isVerifiedStr === "FALSE") {
                return output.setContent(JSON.stringify({ status: 'error', error: 'Account not verified. Please check your email.' }));
            }

            // Fallback: If IsVerified is empty but Token exists, it's an unverified account
            if (!isVerifiedStr && tokenVal && tokenVal.toString().trim() !== "") {
                return output.setContent(JSON.stringify({ status: 'error', error: 'Account not verified. Please check your email.' }));
            }

            return output.setContent(JSON.stringify({
                status: 'success',
                user: { name: values[i][1], email: values[i][2] }
            }));
        }
    }

    return output.setContent(JSON.stringify({ status: 'error', error: 'Invalid email or password' }));
}

function handleVerifyEmail(data, output) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Users");
    if (!sheet) return output.setContent(JSON.stringify({ status: 'error', error: 'User database not found' }));

    const values = sheet.getDataRange().getValues();
    let userFound = false;

    // Iterate to find user by email (Index 2) and check Token (Index 4)
    for (let i = 1; i < values.length; i++) {
        const rowEmail = values[i][2] ? values[i][2].toString().toLowerCase() : "";
        const rowToken = values[i][4] ? values[i][4].toString().trim() : "";
        const isVerifiedVal = values[i][5] ? values[i][5].toString().toUpperCase() : "FALSE";

        if (rowEmail === data.email.toLowerCase()) {
            // Check if already verified
            if (isVerifiedVal === "TRUE") {
                return output.setContent(JSON.stringify({ status: 'success', message: 'Email already verified' }));
            }

            // Check token
            if (rowToken === data.token.trim()) {
                // Update IsVerified (Column F = Index 6 in 1-based getRange) to "TRUE"
                // IMPROVEMENT: Do NOT clear the token. This allows the link to be clicked multiple times (idempotent).
                // This fixes issues where email scanners click the link first.
                sheet.getRange(i + 1, 6).setValue("TRUE");
                // sheet.getRange(i + 1, 5).setValue(""); // Removed: Keep token for debugging/idempotency
                userFound = true;
            } else {
                return output.setContent(JSON.stringify({ status: 'error', error: 'Invalid verification token' }));
            }
            break;
        }
    }

    if (userFound) {
        return output.setContent(JSON.stringify({ status: 'success', message: 'Email verified successfully' }));
    } else {
        return output.setContent(JSON.stringify({ status: 'error', error: 'User not found' }));
    }
}


function handleForgotPassword(data, output) {
    const email = data.email;
    const resetBase = data.resetLinkBase; // Frontend sends this

    if (!email || !resetBase) {
        return output.setContent(JSON.stringify({ status: 'error', error: 'Missing email or link base' }));
    }

    // Check if email exists in Users sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Users");
    if (!sheet) {
        return output.setContent(JSON.stringify({ status: 'error', error: 'Email is not registered' }));
    }

    const values = sheet.getDataRange().getValues();
    let emailFound = false;
    for (let i = 1; i < values.length; i++) {
        if (values[i][2] && values[i][2].toString().toLowerCase() === email.toLowerCase()) {
            emailFound = true;
            break;
        }
    }

    if (!emailFound) {
        return output.setContent(JSON.stringify({ status: 'error', error: 'Email is not registered' }));
    }

    // Generate a simple token (In production, store this in DB with expiry)
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Construct full link
    // e.g. https://domain.com/reset-password?email=foo@bar.com&token=xyz
    const fullLink = resetBase + "?email=" + encodeURIComponent(email) + "&token=" + token;

    try {
        MailApp.sendEmail({
            to: email,
            subject: "Cafe Beans - Password Reset Request",
            htmlBody: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password for Cafe Beans.</p>
        <p>Click the link below to reset it:</p>
        <p><a href="${fullLink}" style="background-color: #6F4E37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>Or copy this link: ${fullLink}</p>
        <p>If you did not request this, please ignore this email.</p>
      `
        });
        return output.setContent(JSON.stringify({ status: 'success', message: 'Reset link sent to ' + email }));
    } catch (e) {
        return output.setContent(JSON.stringify({ status: 'error', error: 'Failed to send email: ' + e.toString() }));
    }
}

function handleResetPassword(data, output) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Users");
    if (!sheet) return output.setContent(JSON.stringify({ status: 'error', error: 'User database not found' }));

    const values = sheet.getDataRange().getValues();
    let userFound = false;

    // Iterate to find user by email (Index 2)
    for (let i = 1; i < values.length; i++) {
        if (values[i][2] && values[i][2].toString().toLowerCase() === data.email.toLowerCase()) {
            // Update Password (Column D = Index 4 in 1-based notation)
            sheet.getRange(i + 1, 4).setValue(data.newPassword);
            userFound = true;
            break;
        }
    }

    if (userFound) {
        return output.setContent(JSON.stringify({ status: 'success', message: 'Password updated successfully' }));
    } else {
        return output.setContent(JSON.stringify({ status: 'error', error: 'User not found' }));
    }
}

function handleContact(data, output) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Messages");
    if (!sheet) {
        sheet = ss.insertSheet("Messages");
        sheet.appendRow(["Timestamp", "Name", "Email", "Message"]);
    }

    sheet.appendRow([new Date(), data.Name, data.Email, data.Message]);
    return output.setContent(JSON.stringify({ status: 'success', message: 'Message sent successfully' }));
}

function handleOrder(data, output) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Orders");
    if (!sheet) {
        sheet = ss.insertSheet("Orders");
        sheet.appendRow(["Timestamp", "Order Details", "Total Payment"]);
    }

    const itemsStr = data.items.map(i => `${i.name} x${i.qty} ($${i.total})`).join(", ");
    sheet.appendRow([new Date(), itemsStr, data.totalPayment]);
    return output.setContent(JSON.stringify({ status: 'success', message: 'Order created' }));
}

function handleAddProduct(data, output) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("products");

    // Define default headers if sheet is new
    const standardHeaders = ["id", "name", "description", "price", "image", "category"];

    if (!sheet) {
        sheet = ss.insertSheet("products");
        sheet.appendRow(standardHeaders);
    }

    // Get current headers to ensure mapping is correct
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headerMap = {};
    headers.forEach((header, index) => {
        headerMap[header.toString().toLowerCase()] = index;
    });

    // Helper to get index safely
    const getColIndex = (name) => headerMap[name.toLowerCase()];

    // Generate new ID
    const lastRow = sheet.getLastRow();
    // If only header exists (lastRow=1), start at 1. Otherwise get max ID.
    // We can't rely on column 1 being ID anymore. Find ID column.
    const idColIdx = getColIndex("id");

    let newId = 1;
    if (lastRow > 1 && idColIdx !== undefined) {
        // Get all IDs to find max (safer than just checking last row if unsorted)
        const ids = sheet.getRange(2, idColIdx + 1, lastRow - 1, 1).getValues().flat();
        const maxId = Math.max(...ids.filter(id => !isNaN(id) && id !== ""));
        newId = (maxId === -Infinity ? 0 : maxId) + 1;
    }

    // Process Image Upload
    try {
        if (data.image) {
            data.image = processImageUpload(data.image, data.name);
        }
    } catch (e) {
        return output.setContent(JSON.stringify({ status: 'error', error: "Image upload failed: " + e.toString() }));
    }

    // Construct the row array based on headers
    const newRow = new Array(headers.length).fill(""); // Initialize with empty strings

    // Map data to columns
    if (idColIdx !== undefined) newRow[idColIdx] = newId;
    if (getColIndex("name") !== undefined) newRow[getColIndex("name")] = data.name;
    if (getColIndex("description") !== undefined) newRow[getColIndex("description")] = data.description;
    if (getColIndex("price") !== undefined) newRow[getColIndex("price")] = data.price;
    if (getColIndex("image") !== undefined) newRow[getColIndex("image")] = data.image;
    if (getColIndex("category") !== undefined) newRow[getColIndex("category")] = data.category;

    sheet.appendRow(newRow);
    return output.setContent(JSON.stringify({ status: 'success', message: 'Product added successfully' }));
}

function handleEditProduct(data, output) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("products");
    if (!sheet) return output.setContent(JSON.stringify({ status: 'error', error: 'Products sheet not found' }));

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headerMap = {};
    headers.forEach((header, index) => {
        headerMap[header.toString().toLowerCase()] = index;
    });

    const getColIndex = (name) => headerMap[name.toLowerCase()];
    const idColIdx = getColIndex("id");

    if (idColIdx === undefined) return output.setContent(JSON.stringify({ status: 'error', error: 'ID column not found' }));

    const values = sheet.getDataRange().getValues();
    let productFound = false;

    // Convert incoming ID to number for comparison (same fix as delete)
    const targetId = Number(data.id);

    // Iterate to find product by ID
    // values[i][idColIdx] gives the ID
    for (let i = 1; i < values.length; i++) {
        const rowId = Number(values[i][idColIdx]);

        if (rowId === targetId) {

            // Update columns safely
            if (getColIndex("name") !== undefined) sheet.getRange(i + 1, getColIndex("name") + 1).setValue(data.name);
            if (getColIndex("description") !== undefined) sheet.getRange(i + 1, getColIndex("description") + 1).setValue(data.description);
            if (getColIndex("price") !== undefined) sheet.getRange(i + 1, getColIndex("price") + 1).setValue(data.price);

            // Process Image Upload (if changed)
            if (data.image) {
                try {
                    data.image = processImageUpload(data.image, data.name);
                } catch (e) {
                    return output.setContent(JSON.stringify({ status: 'error', error: "Image upload failed: " + e.toString() }));
                }
            }

            if (getColIndex("image") !== undefined) sheet.getRange(i + 1, getColIndex("image") + 1).setValue(data.image);
            if (getColIndex("category") !== undefined) sheet.getRange(i + 1, getColIndex("category") + 1).setValue(data.category);

            productFound = true;
            break;
        }
    }

    if (productFound) {
        return output.setContent(JSON.stringify({ status: 'success', message: 'Product updated successfully' }));
    } else {
        return output.setContent(JSON.stringify({ status: 'error', error: 'Product not found' }));
    }
}

function handleDeleteProduct(data, output) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("products");
    if (!sheet) return output.setContent(JSON.stringify({ status: 'error', error: 'Products sheet not found' }));

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headerMap = {};
    headers.forEach((header, index) => {
        headerMap[header.toString().toLowerCase()] = index;
    });

    const idColIdx = headerMap["id"];

    if (idColIdx === undefined) return output.setContent(JSON.stringify({ status: 'error', error: 'ID column not found' }));

    const values = sheet.getDataRange().getValues();
    let productFound = false;

    // Convert incoming ID to number for comparison
    const targetId = Number(data.id);

    // Debug logging
    console.log('Delete request for ID:', data.id, 'Type:', typeof data.id, 'Converted:', targetId);

    // Iterate to find product by ID
    for (let i = 1; i < values.length; i++) {
        const rowId = Number(values[i][idColIdx]);
        console.log('Comparing row', i, 'ID:', values[i][idColIdx], 'Type:', typeof values[i][idColIdx], 'Converted:', rowId);

        if (rowId === targetId) {
            console.log('Match found! Deleting row', i + 1);
            sheet.deleteRow(i + 1);
            productFound = true;
            break;
        }
    }

    if (productFound) {
        return output.setContent(JSON.stringify({ status: 'success', message: 'Product deleted successfully' }));
    } else {
        console.log('Product not found. Target ID:', targetId, 'Available IDs:', values.slice(1).map(row => Number(row[idColIdx])));
        return output.setContent(JSON.stringify({ status: 'error', error: 'Product not found' }));
    }
}

function handleGetAllSheetsData(output) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    const allData = {};

    // Iterate through all sheets
    for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        const sheetName = sheet.getName();

        // Skip the Users sheet for security
        if (sheetName.toLowerCase() === 'users') {
            continue;
        }

        try {
            const data = sheet.getDataRange().getValues();
            if (data.length === 0) {
                allData[sheetName] = [];
                continue;
            }

            const headers = data[0];
            const rows = data.slice(1);

            const result = rows.map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index];
                });
                return obj;
            });

            allData[sheetName] = result;
        } catch (error) {
            // If there's an error reading a specific sheet, skip it
            allData[sheetName] = { error: error.toString() };
        }
    }

    return output.setContent(JSON.stringify({ status: 'success', data: allData }));
}

// --- Image Upload Helpers ---

function getOrCreateFolder(folderName) {
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
        return folders.next();
    } else {
        return DriveApp.createFolder(folderName);
    }
}

function processImageUpload(imageString, name) {
    // If it's not a base64 string, assume it's already a URL or empty, and return as is.
    if (!imageString || typeof imageString !== 'string' || !imageString.startsWith('data:image')) {
        return imageString;
    }

    try {
        // Extract base64 data
        // Format: "data:image/jpeg;base64,....."
        const parts = imageString.split(',');
        // defensive check
        if (parts.length < 2) return imageString;

        const mimeMatch = parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        const base64Data = parts[1];

        const decodedData = Utilities.base64Decode(base64Data);
        // Create a unique filename
        const fileName = (name || 'product') + '_' + new Date().getTime() + '.' + mimeType.split('/')[1];

        const blob = Utilities.newBlob(decodedData, mimeType, fileName);

        // Get or create "CafeBeans_ProductImages" folder
        const folder = getOrCreateFolder("CafeBeans_ProductImages");
        const file = folder.createFile(blob);

        // Set permissions so it's viewable by the public
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        // Return the direct link that works in <img> tags
        // Using the 'export=view' format is generally more reliable for hotlinking
        return "https://drive.google.com/uc?export=view&id=" + file.getId();

    } catch (e) {
        // Log error somewhere if needed, or rethrow
        throw new Error("Drive upload failed: " + e.toString());
    }
}

// ==========================================
// FRONTEND API SERVICE (TypeScript)
// ==========================================

// API URL - Update this with your deployed Google Apps Script Web App URL
const API_URL = import.meta.env.VITE_API_URL || 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

// Get base URL for verification links
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const origin = window.location.origin.replace(/\/$/, '');
        const base = import.meta.env.BASE_URL.replace(/^\/|\/$/g, '');
        return base ? `${origin}/${base}` : origin;
    }
    return 'http://localhost:5173';
};

// Types
export interface MenuItem {
    name: string;
    path: string;
    order: number;
    price?: number;
    image?: string;
}

// Ensure Product is exported in types/product.ts, but if needed here to keep old code working:
// export interface Product { ... }
// Since we strictly use types/product.ts now, we omit it here to avoid conflicts.

// API Service
export const api = {
    // Authentication methods
    auth: {
        async login(email: string, password: string) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action: 'login', email, password }),
                });
                return await response.json();
            } catch (error) {
                console.error('Login API error:', error);
                return { status: 'error', error: 'Network error occurred' };
            }
        },

        async register(name: string, email: string, password: string) {
            try {
                const verifyLinkBase = getBaseUrl() + '/verify-email';
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action: 'register', name, email, password, verifyLinkBase }),
                });
                return await response.json();
            } catch (error) {
                console.error('Register API error:', error);
                return { status: 'error', error: 'Network error occurred' };
            }
        },

        async verifyEmail(email: string, token: string) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action: 'verify_email', email, token }),
                });
                return await response.json();
            } catch (error) {
                console.error('Verify email API error:', error);
                return { status: 'error', error: 'Network error occurred' };
            }
        },

        async forgotPassword(email: string) {
            try {
                const resetLinkBase = getBaseUrl() + '/reset-password';
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action: 'forgot_password', email, resetLinkBase }),
                });
                return await response.json();
            } catch (error) {
                console.error('Forgot password API error:', error);
                return { status: 'error', error: 'Network error occurred' };
            }
        },

        async resetPassword(email: string, newPassword: string, token: string) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action: 'reset_password', email, newPassword, token }),
                });
                return await response.json();
            } catch (error) {
                console.error('Reset password API error:', error);
                return { status: 'error', error: 'Network error occurred' };
            }
        },

        async googleAuth(credential: string) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action: 'google_auth', credential }),
                });
                return await response.json();
            } catch (error) {
                console.error('Google auth API error:', error);
                return { status: 'error', error: 'Network error occurred' };
            }
        },
    },

    // Menu Service
    menu: {
        async getAll() {
            try {
                const response = await fetch(`${API_URL}?sheet=menu&t=${Date.now()}`);
                const data = await response.json();
                return data.menu || [];
            } catch (error) {
                console.error('Fetch menu error:', error);
                return [];
            }
        }
    },

    // Products Service
    products: {
        async getAll() {
            try {
                const response = await fetch(`${API_URL}?sheet=products&t=${Date.now()}`);
                const data = await response.json();
                return data.products || [];
            } catch (error) {
                console.error('Fetch products error:', error);
                return [];
            }
        },
        async add(product: any) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action: 'addProduct', ...product }),
                });
                return await response.json();
            } catch (error) {
                console.error('Add product API error:', error);
                return { status: 'error', error: 'Network error occurred' };
            }
        },
        async update(product: any) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action: 'editProduct', ...product }),
                });
                return await response.json();
            } catch (error) {
                console.error('Update product API error:', error);
                return { status: 'error', error: 'Network error occurred' };
            }
        },
        async delete(id: number) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action: 'deleteProduct', id }),
                });
                return await response.json();
            } catch (error) {
                console.error('Delete product API error:', error);
                return { status: 'error', error: 'Network error occurred' };
            }
        }
    },

    // Order Service
    order: {
        async create(payload: any) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action: 'order', ...payload }),
                });
                return await response.json();
            } catch (error) {
                console.error('Order API error:', error);
                return { status: 'error', error: 'Network error occurred' };
            }
        }
    },

    // Contact
    contact: {
        async send(data: FormData | { Name: string; Email: string; Message: string }) {
            try {
                let payload: any = { action: 'contact' };

                if (data instanceof FormData) {
                    payload.Name = data.get('Name');
                    payload.Email = data.get('Email');
                    payload.Message = data.get('Message');
                } else {
                    Object.assign(payload, data);
                }

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(payload),
                });
                return await response.json();
            } catch (error) {
                console.error('Contact API error:', error);
                return { status: 'error', error: 'Network error occurred' };
            }
        }
    },

    // Sheets Service
    sheets: {
        async getAll() {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action: 'getAllSheetsData' }),
                });
                return await response.json();
            } catch (error) {
                console.error('Get all sheets API error:', error);
                return { status: 'error', error: 'Network error occurred' };
            }
        }
    }
};
