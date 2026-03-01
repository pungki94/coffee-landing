// ==========================================
// UNIFIED GOOGLE APPS SCRIPT FOR CAFE BEANS
// ==========================================
// IMPORTANT: TO TEST THIS, YOU MUST DEPLOY AS WEB APP.
// DO NOT CLICK "RUN" IN THE EDITOR.

function doGet(e) {
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
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    const responseObj = {};
    responseObj[sheetName === 'products' ? 'products' : 'menu'] = result;
    responseObj.timestamp = new Date().toISOString();

    return output.setContent(JSON.stringify(responseObj));

  } catch (error) {
    return output.setContent(JSON.stringify({ error: error.toString() }));
  }
}

function doPost(e) {
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
    // Note: We authenticate by email alone here as token logic is skipped/simulated.
    // In a real app, verify the token.
    for (let i = 1; i < values.length; i++) {
        if (values[i][2] && values[i][2].toString().toLowerCase() === data.email.toLowerCase()) {
            // Update Password (Column D = Index 4 in 1-based notation, Index 3 in 0-based array)
            // sheet.getRange(row, col) is 1-based.
            // Row is i + 1. Column for Password is 4 (A=1, B=2, C=3, D=4).
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
