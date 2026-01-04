/**
 * Coffee Products & Menu API - Google Apps Script
 * 
 * Script ini membaca data dari 2 sheets:
 * 1. "Products" - Data produk kopi
 * 2. "Menu" - Data menu navbar
 * 
 * CARA DEPLOY:
 * 1. Copy seluruh kode ini
 * 2. Buka spreadsheet Anda
 * 3. Extensions → Apps Script
 * 4. Hapus semua kode yang ada
 * 5. Paste kode ini
 * 6. Klik Save (💾)
 * 7. Klik Deploy → New deployment (atau Manage deployments → Edit → New version)
 * 8. Pilih type: Web app
 * 9. Execute as: Me
 * 10. Who has access: Anyone
 * 11. Deploy dan copy URL
 */

/**
 * Reusable function untuk membaca data dari sheet
 */
function getSheetData(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log(`Sheet "${sheetName}" not found`);
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Validasi: pastikan ada data (minimal header + 1 row)
    if (data.length < 2) {
      Logger.log(`Sheet "${sheetName}" has no data rows`);
      return [];
    }
    
    // Baris pertama adalah header
    const headers = data[0];
    const rows = [];
    
    Logger.log(`Reading ${sheetName} - Headers: ${headers.join(", ")}`);
    
    // Mulai dari baris kedua (index 1)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const obj = {};
      
      headers.forEach((header, index) => {
        const value = row[index];
        
        // Convert specific fields to numbers
        if (header === 'id' || header === 'price' || header === 'order') {
          obj[header] = Number(value);
        } else {
          obj[header] = value;
        }
      });
      
      // Validation: only add if has required data
      if (sheetName === 'Products' && obj.id && obj.name) {
        rows.push(obj);
      } else if (sheetName === 'Menu' && obj.name && obj.path) {
        rows.push(obj);
      }
    }
    
    Logger.log(`${sheetName}: Found ${rows.length} valid rows`);
    return rows;
    
  } catch (error) {
    Logger.log(`Error reading ${sheetName}: ${error.toString()}`);
    return [];
  }
}

/**
 * Main function - dipanggil saat GET request
 */
function doGet(e) {
  try {
    // Read data from both sheets
    const products = getSheetData('Products');
    const menu = getSheetData('Menu');
    
    // Sort menu by order (ascending)
    menu.sort((a, b) => (a.order || 999) - (b.order || 999));
    
    // Prepare response
    const response = {
      products: products,
      menu: menu,
      timestamp: new Date().toISOString()
    };
    
    Logger.log(`Response: ${products.length} products, ${menu.length} menu items`);
    
    // Return JSON response
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Error handling
    Logger.log("Error in doGet: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString(),
      products: [],
      menu: [],
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Function untuk test di Apps Script Editor
 * Jalankan function ini untuk melihat output
 */
function testAPI() {
  const result = doGet();
  const output = result.getContent();
  Logger.log("=== API Response ===");
  Logger.log(output);
  return output;
}
