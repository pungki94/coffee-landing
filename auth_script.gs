// ==========================================
// GOOGLE APPS SCRIPT FOR COFFEE LANDING AUTH (UPDATED)
// ==========================================
// 1. Open Extensions > Apps Script in your Spreadsheet.
// 2. REPLACE ALL existing code with this code.
// 3. Save (Ctrl+S).
// 4. Deploy > Manage Deployments > Edit (Pencil) > Version: NEW VERSION > Deploy.
// 5. Copy the URL if it changed (otherwise keep using the old one).

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // Route to handlers
    if (action === 'register') return register(data);
    if (action === 'login') return login(data);
    if (action === 'forgot_password') return forgotPassword(data);
    if (action === 'reset_password') return resetPassword(data);

    return errorResponse("Invalid action");

  } catch (error) {
    return errorResponse(error.toString());
  } finally {
    lock.releaseLock();
  }
}

// Handle CORS for Preflight
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .append("Access-Control-Allow-Origin: *")
    .append("Access-Control-Allow-Methods: POST, GET, OPTIONS")
    .append("Access-Control-Allow-Headers: Content-Type");
}

function successResponse(data) {
  const output = JSON.stringify(data);
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(message) {
  const output = JSON.stringify({ status: "error", error: message });
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper: Password Validation
function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
    return "Password must contain: lowercase, uppercase, number, and special character";
  }
  return null; // Valid
}

// -------------------------------------------------------------
// ACTIONS
// -------------------------------------------------------------

function register(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Users");
  const { name, email, password } = data;

  if (!name || !email || !password) return errorResponse("Missing fields");

  // Validate Password
  const passError = validatePassword(password);
  if (passError) return errorResponse(passError);

  // Check if user exists
  const users = sheet.getDataRange().getValues();
  // Skip header
  for (let i = 1; i < users.length; i++) {
    if (users[i][2] === email) { // Col C is email
      return errorResponse("User already exists");
    }
  }

  // Add user: timestamp, name, email, password, resetToken (empty)
  // Force password to string by adding '' prefix if needed, but usually just storing it is fine.
  // We'll trust the input is string.
  sheet.appendRow([new Date(), name, email, "'" + password, ""]); // Postfix with ' to force text format in some contexts, or just direct. 
  // Actually, standard string is fine. Let's just store as is.
  // Update: To handle the "number" issue, let's treat everything as string during read.

  // Send Welcome Email
  try {
    MailApp.sendEmail({
      to: email,
      subject: "Welcome to Coffee Bliss!",
      htmlBody: `
        <h2>Hi ${name},</h2>
        <p>Welcome to Coffee Bliss! We're excited to have you join our community.</p>
        <p>Start browsing our selection of premium roasted beans today.</p>
        <br>
        <p>Cheers,<br>The Coffee Bliss Team</p>
      `
    });
  } catch (e) {
    // Ignore email errors in dev
  }

  return successResponse({ status: "success", message: "User registered" });
}

function login(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Users");
  const { email, password } = data;

  const users = sheet.getDataRange().getValues();
  for (let i = 1; i < users.length; i++) {
    // users[i][2] = email
    // users[i][3] = password
    // Ensure we compare strings to avoid "123456" (number) != "123456" (string) issues
    if (String(users[i][2]) === String(email) && String(users[i][3]) === String(password)) {
      return successResponse({ 
        status: "success", 
        user: { name: users[i][1], email: users[i][2] } 
      });
    }
  }

  return errorResponse("Invalid credentials");
}

function forgotPassword(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Users");
  const { email } = data;
  
  // Define URL here safely
  const FRONTEND_URL = "http://localhost:5173/coffee-landing"; 

  const users = sheet.getDataRange().getValues();
  let rowIndex = -1;
  let userName = "";

  for (let i = 1; i < users.length; i++) {
    if (String(users[i][2]) === String(email)) {
      rowIndex = i + 1; // 1-based index
      userName = users[i][1];
      break;
    }
  }

  if (rowIndex === -1) {
    return errorResponse("User not found");
  }

  const token = Utilities.getUuid();
  // Update resetToken in column E (5th column)
  sheet.getRange(rowIndex, 5).setValue(token);

  const link = `${FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    MailApp.sendEmail({
      to: email,
      subject: "Reset Your Password - Coffee Bliss",
      htmlBody: `
        <h2>Hi ${userName},</h2>
        <p>You requested to reset your password.</p>
        <p><a href="${link}">Click here to reset your password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });
  } catch (e) {
    return errorResponse("Failed to send email: " + e.toString());
  }

  return successResponse({ status: "success", message: "Reset email sent" });
}

function resetPassword(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Users");
  const { email, token, newPassword } = data;

  // Validate Password
  const passError = validatePassword(newPassword);
  if (passError) return errorResponse(passError);

  const users = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < users.length; i++) {
    if (String(users[i][2]) === String(email)) {
       // Check token
       if (String(users[i][4]) === String(token)) {
         rowIndex = i + 1;
         break;
       } else {
         return errorResponse("Invalid or expired token");
       }
    }
  }

  if (rowIndex === -1) {
    return errorResponse("User not found or token invalid");
  }

  // Update password (Col D / 4) and clear token (Col E / 5)
  // Store as string explicitly if needed, but String() comparison on read handles it.
  // Using setValue("'" + newPassword) forces text in Sheets if user enters strict number.
  // This helps visual consistency.
  sheet.getRange(rowIndex, 4).setValue("'" + newPassword); 
  sheet.getRange(rowIndex, 5).setValue("");

  return successResponse({ status: "success", message: "Password updated" });
}
