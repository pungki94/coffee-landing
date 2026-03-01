
function testAuth() {
  DriveApp.getRootFolder();
  SpreadsheetApp.getActiveSpreadsheet();
  MailApp.getRemainingDailyQuota();
  console.log("Authorization Successful");
}


// Convert a Google Drive image URL to a base64 data URL.
// This avoids browser-side 429 rate limit errors from Google Drive/lh3 hotlinking.
function convertDriveImageToBase64(url) {
    if (!url || typeof url !== 'string') return url;

    // Only process Google Drive URLs
    if (
        !url.includes('drive.google.com') &&
        !url.includes('googleusercontent.com') &&
        !url.includes('docs.google.com')
    ) {
        return url; // Not a Drive URL, return as-is
    }

    // Already a data URL
    if (url.startsWith('data:')) return url;

    try {
        // Extract Google Drive file ID (15+ chars of alphanumeric/dashes/underscores)
        var idMatch = url.match(/[-\w]{15,}/);
        if (!idMatch) return url;

        var fileId = idMatch[0];
        var file = DriveApp.getFileById(fileId);
        var blob = file.getBlob();
        var mimeType = blob.getContentType();
        var base64 = Utilities.base64Encode(blob.getBytes());

        return 'data:' + mimeType + ';base64,' + base64;
    } catch (e) {
        // If conversion fails (e.g., file deleted, no permission), return original URL
        console.log('Image conversion failed for: ' + url + ' Error: ' + e.toString());
        return url;
    }
}

function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  if (!e || !e.parameter) {
      return output.setContent(JSON.stringify({
          error: "This script must be deployed as a Web App. Do not run directly in editor."
      }));
  }

  const sheetName = e.parameter.sheet || 'products';

  try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(sheetName);

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

      // Find the image column index (if any)
      var imageColIndex = headers.findIndex(function(h) { return h.toString().toLowerCase() === 'image'; });

      const result = rows.map(row => {
          const obj = {};
          headers.forEach((header, index) => {
              obj[header] = row[index];
          });

          // Convert Drive image URLs to base64 to avoid 429 rate limits
          if (imageColIndex >= 0 && obj[headers[imageColIndex]]) {
              obj[headers[imageColIndex]] = convertDriveImageToBase64(obj[headers[imageColIndex]]);
          }

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

  if (!e) {
      return output.setContent(JSON.stringify({ status: 'error', error: "Do not run directly." }));
  }

  try {
      let data = {};
      let action = '';

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

      if (action === 'register') {
          return handleRegister(data, output);
      } else if (action === 'login') {
          return handleLogin(data, output);
      } else if (action === 'google_auth') {
          return handleGoogleAuth(data, output);
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
      } else {
          return output.setContent(JSON.stringify({ status: 'error', error: 'Invalid action: ' + action }));
      }

  } catch (error) {
      return output.setContent(JSON.stringify({ status: 'error', error: error.toString() }));
  }
}

function handleRegister(data, output) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Users");
  if (!sheet) {
      sheet = ss.insertSheet("Users");
      sheet.appendRow(["Timestamp", "Name", "Email", "Password", "VerificationToken", "IsVerified"]);
  }

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
      if (values[i][2] && values[i][2].toString().toLowerCase() === data.email.toLowerCase()) {
          return output.setContent(JSON.stringify({ status: 'error', error: 'Email already exists' }));
      }
  }

  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const isVerified = "FALSE";

  sheet.appendRow([new Date(), data.name, data.email, data.password, token, isVerified]);

  const verifyBase = data.verifyLinkBase;

  if (verifyBase) {
      const fullLink = verifyBase + "?email=" + encodeURIComponent(data.email) + "&token=" + token;
      try {
          MailApp.sendEmail({
              to: data.email,
              subject: "Cafe Beans - Verify Your Account",
              htmlBody: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; color: #333;">
                  <!-- Header -->
                  <div style="background-color: #6F4E37; color: white; padding: 15px; margin-bottom: 20px;">
                      <h1 style="margin: 0; font-size: 24px;">COFFEE BLISS</h1>
                      <p style="margin: 0; font-size: 14px;">PREMIUM COFFEE STORE</p>
                  </div>

                  <!-- Body -->
                  <p>Dear ${data.name},</p>

                  <p>Thank you for creating a COFFEE BLISS - Premium Coffee Store account.</p>

                  <p>Please visit the link below and sign into your account to verify your email address and complete your registration.</p>

                  <p style="text-align: center; margin: 30px 0;">
                      <a href="${fullLink}" style="background-color: #00C896; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Verifikasi Email</a>
                  </p>

                  <p>If the button above does not work, please click the link below:</p>

                  <p><a href="${fullLink}" style="color: #0066cc; text-decoration: underline;">${fullLink}</a></p>

                  <!-- Footer -->
                  <p style="margin-top: 30px; font-size: 13px; color: #666;">
                      You are receiving this email because you recently created an account or changed your email address. If you did not do this, please contact us.
                  </p>
              </div>
          `
          });
      } catch (e) {
      }
  }

  return output.setContent(JSON.stringify({ status: 'success', message: 'Registration successful. Please check your email to verify.' }));
}

function handleGoogleAuth(data, output) {
  if (!data.credential) {
      return output.setContent(JSON.stringify({ status: 'error', error: 'No credential provided' }));
  }

  try {
      // Decode the JWT credential (base64url encoded payload)
      var parts = data.credential.split('.');
      if (parts.length !== 3) {
          return output.setContent(JSON.stringify({ status: 'error', error: 'Invalid credential format' }));
      }

      // Decode base64url payload (part[1])
      var payload = parts[1];
      // Replace base64url characters
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      while (payload.length % 4 !== 0) {
          payload += '=';
      }

      var decoded = Utilities.base64Decode(payload);
      var jsonStr = Utilities.newBlob(decoded).getDataAsString();
      var userInfo = JSON.parse(jsonStr);

      var email = userInfo.email;
      var name = userInfo.name || userInfo.given_name || 'Google User';
      var emailVerified = userInfo.email_verified;

      if (!email) {
          return output.setContent(JSON.stringify({ status: 'error', error: 'Could not get email from Google account' }));
      }

      // Check Users sheet
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Users");
      if (!sheet) {
          sheet = ss.insertSheet("Users");
          sheet.appendRow(["Timestamp", "Name", "Email", "Password", "VerificationToken", "IsVerified"]);
      }

      var values = sheet.getDataRange().getValues();

      // Check if user already exists
      for (var i = 1; i < values.length; i++) {
          if (values[i][2] && values[i][2].toString().toLowerCase() === email.toLowerCase()) {
              // User exists — log them in
              // Also update IsVerified to TRUE if not already (Google verified)
              var currentVerified = values[i][5] ? values[i][5].toString().toUpperCase() : "";
              if (currentVerified !== "TRUE") {
                  sheet.getRange(i + 1, 6).setValue("TRUE");
              }
              return output.setContent(JSON.stringify({
                  status: 'success',
                  user: { name: values[i][1], email: values[i][2] },
                  message: 'Logged in with Google'
              }));
          }
      }

      // New user — register with Google (no password, auto-verified)
      sheet.appendRow([
          new Date(),
          name,
          email,
          'GOOGLE_AUTH', // No password — mark as Google-authenticated
          '',            // No verification token needed
          'TRUE'         // Auto-verified via Google
      ]);

      return output.setContent(JSON.stringify({
          status: 'success',
          user: { name: name, email: email },
          message: 'Registered and logged in with Google'
      }));

  } catch (e) {
      return output.setContent(JSON.stringify({ status: 'error', error: 'Google auth failed: ' + e.toString() }));
  }
}

function handleLogin(data, output) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Users");
  if (!sheet) return output.setContent(JSON.stringify({ status: 'error', error: 'User database empty' }));

  const values = sheet.getDataRange().getValues();
  const targetEmail = data.email.toString().trim().toLowerCase();
  const targetPassword = data.password.toString().trim();

  for (let i = 1; i < values.length; i++) {
      const rowEmail = values[i][2] ? values[i][2].toString().trim().toLowerCase() : "";
      const rowPassword = values[i][3] ? values[i][3].toString().trim() : "";

      if (rowEmail === targetEmail && rowPassword === targetPassword) {

          const tokenVal = values[i][4];
          const isVerifiedVal = values[i][5];

          const isVerifiedStr = isVerifiedVal ? isVerifiedVal.toString().toUpperCase() : "";

          if (isVerifiedStr === "FALSE") {
              return output.setContent(JSON.stringify({ status: 'error', error: 'Account not verified. Please check your email.' }));
          }

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

  for (let i = 1; i < values.length; i++) {
      const rowEmail = values[i][2] ? values[i][2].toString().toLowerCase() : "";
      const rowToken = values[i][4] ? values[i][4].toString().trim() : "";
      const isVerifiedVal = values[i][5] ? values[i][5].toString().toUpperCase() : "FALSE";

      if (rowEmail === data.email.toLowerCase()) {
          if (isVerifiedVal === "TRUE") {
              return output.setContent(JSON.stringify({ status: 'success', message: 'Email already verified' }));
          }

          if (rowToken === data.token.trim()) {
              sheet.getRange(i + 1, 6).setValue("TRUE");
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
  const resetBase = data.resetLinkBase;

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

  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const fullLink = resetBase + "?email=" + encodeURIComponent(email) + "&token=" + token;

  try {
      MailApp.sendEmail({
          to: email,
          subject: "Cafe Beans - Password Reset Request",
          htmlBody: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; color: #333;">
                  <!-- Header -->
                  <div style="background-color: #6F4E37; color: white; padding: 15px; margin-bottom: 20px;">
                      <h1 style="margin: 0; font-size: 24px;">COFFEE BLISS</h1>
                      <p style="margin: 0; font-size: 14px;">PREMIUM COFFEE STORE</p>
                  </div>

                  <!-- Body -->
                  <p>Dear Customer,</p>

                  <p>You requested to reset your password for your COFFEE BLISS account.</p>

                  <p>Please visit the link below to reset your password.</p>

                  <p style="text-align: center; margin: 30px 0;">
                      <a href="${fullLink}" style="background-color: #00C896; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
                  </p>

                  <p>If the button above does not work, please click the link below:</p>

                  <p><a href="${fullLink}" style="color: #0066cc; text-decoration: underline;">${fullLink}</a></p>

                  <p style="margin-top: 20px; font-size: 14px; color: #555;">If you did not request this, please ignore this email.</p>

                  <!-- Footer -->
                  <p style="margin-top: 30px; font-size: 13px; color: #666;">
                      You are receiving this email because you requested a password reset. If you did not do this, please contact us.
                  </p>
              </div>
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
  const targetEmail = data.email.toString().trim().toLowerCase();
  const newPassword = data.newPassword.toString().trim();

  // Iterate to find user by email (Index 2)
  for (let i = 1; i < values.length; i++) {
      const rowEmail = values[i][2] ? values[i][2].toString().trim().toLowerCase() : "";
      
      if (rowEmail === targetEmail) {
          // Update Password (Column D = Index 4 in 1-based notation)
          sheet.getRange(i + 1, 4).setValue(newPassword);
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

  const standardHeaders = ["id", "name", "description", "price", "image", "category"];

  if (!sheet) {
      sheet = ss.insertSheet("products");
      sheet.appendRow(standardHeaders);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const headerMap = {};
  headers.forEach((header, index) => {
      headerMap[header.toString().toLowerCase()] = index;
  });

  const getColIndex = (name) => headerMap[name.toLowerCase()];

  const lastRow = sheet.getLastRow();
  const idColIdx = getColIndex("id");

  let newId = 1;
  if (lastRow > 1 && idColIdx !== undefined) {
      const ids = sheet.getRange(2, idColIdx + 1, lastRow - 1, 1).getValues().flat();
      const maxId = Math.max(...ids.filter(id => !isNaN(id) && id !== ""));
      newId = (maxId === -Infinity ? 0 : maxId) + 1;
  }

  try {
      console.log('Add Product - Before image processing:', data.image ? data.image.substring(0, 100) + '...' : 'NO IMAGE'); // DEBUG
      if (data.image) {
          data.image = processImageUpload(data.image, data.name);
          console.log('Add Product - After image processing:', data.image); // DEBUG
      }
  } catch (e) {
      console.error('Image upload error:', e); // DEBUG
      return output.setContent(JSON.stringify({ status: 'error', error: "Image upload failed: " + e.toString() }));
  }

  const newRow = new Array(headers.length).fill(""); 

  if (idColIdx !== undefined) newRow[idColIdx] = newId;
  if (getColIndex("name") !== undefined) newRow[getColIndex("name")] = data.name;
  if (getColIndex("description") !== undefined) newRow[getColIndex("description")] = data.description;
  if (getColIndex("price") !== undefined) newRow[getColIndex("price")] = data.price;
  if (getColIndex("image") !== undefined) newRow[getColIndex("image")] = data.image;
  if (getColIndex("category") !== undefined) newRow[getColIndex("category")] = data.category;

  console.log('Add Product - Row to append:', newRow); // DEBUG
  sheet.appendRow(newRow);
  return output.setContent(JSON.stringify({ status: 'success', message: 'Product added successfully', id: newId }));
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

  for (let i = 1; i < values.length; i++) {
      if (values[i][idColIdx] == data.id) {

          if (getColIndex("name") !== undefined) sheet.getRange(i + 1, getColIndex("name") + 1).setValue(data.name);
          if (getColIndex("description") !== undefined) sheet.getRange(i + 1, getColIndex("description") + 1).setValue(data.description);
          if (getColIndex("price") !== undefined) sheet.getRange(i + 1, getColIndex("price") + 1).setValue(data.price);

          // Only process and update image if new image data provided
          if (data.image) {
              try {
                  data.image = processImageUpload(data.image, data.name);
                  if (getColIndex("image") !== undefined) {
                      sheet.getRange(i + 1, getColIndex("image") + 1).setValue(data.image);
                  }
              } catch (e) {
                  return output.setContent(JSON.stringify({ status: 'error', error: "Image upload failed: " + e.toString() }));
              }
          }
          // If no image provided, keep existing image (don't update the cell)
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

  for (let i = 1; i < values.length; i++) {
      if (values[i][idColIdx] == data.id) {
          sheet.deleteRow(i + 1);
          productFound = true;
          break;
      }
  }

  if (productFound) {
      return output.setContent(JSON.stringify({ status: 'success', message: 'Product deleted successfully' }));
  } else {
      return output.setContent(JSON.stringify({ status: 'error', error: 'Product not found' }));
  }
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
      return folders.next();
  } else {
      return DriveApp.createFolder(folderName);
  }
}

function processImageUpload(imageString, name) {
  if (!imageString || typeof imageString !== 'string' || !imageString.startsWith('data:image')) {
      return imageString;
  }

  try {
      const parts = imageString.split(',');
      if (parts.length < 2) return imageString;

      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      const base64Data = parts[1];

      const decodedData = Utilities.base64Decode(base64Data);
      const fileName = (name || 'product') + '_' + new Date().getTime() + '.' + mimeType.split('/')[1];

      const blob = Utilities.newBlob(decodedData, mimeType, fileName);

      const folder = getOrCreateFolder("CafeBeans_ProductImages");
      const file = folder.createFile(blob);

      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return "https://drive.google.com/uc?export=view&id=" + file.getId();

  } catch (e) {
      throw new Error("Drive upload failed: " + e.toString());
  }
}
