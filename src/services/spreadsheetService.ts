import { Product } from '../types/product';

export interface MenuItem {
    name: string;
    path: string;
    order?: number;
}

interface SpreadsheetResponse {
    products: Product[];
    menu: MenuItem[];
    timestamp?: string;
}

const SPREADSHEET_API_URL = 'https://script.google.com/macros/s/AKfycbyOhc4jCfJvcQ9eSK5WMWOTmgGu_DtDHLrfcbV0CU-PIUM1buDsaHIMNY4mpseAy6q4/exec';

// Main function to fetch all data from spreadsheet
export const fetchDataFromSpreadsheet = async (sheet: string = 'products'): Promise<SpreadsheetResponse> => {
    try {
        // Append timestamp to prevent caching and sheet parameter
        const response = await fetch(`${SPREADSHEET_API_URL}?sheet=${sheet}&t=${Date.now()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch data from spreadsheet');
        }
        const data = await response.json();

        // Handle both old format (array) and new format (object)
        if (Array.isArray(data)) {
            // If the script returns an array directly (legacy or simple mode)
            // We need to guess what it is based on the requested sheet or content
            // For now, if we asked for 'menu' and got an array, we'll try to treat it as menu items
            // But to be safe vs the "products array" bug, we rely on the object format usually.
            // If the user uses OUR new script, it returns { products: [], menu: [] } or similar object.

            // Fallback for legacy script:
            return { products: data, menu: [] };
        }

        // New format - object with products and menu
        return {
            products: data.products || [],
            menu: data.menu || [],
            timestamp: data.timestamp
        };
    } catch (error) {
        console.error('Error fetching data from spreadsheet:', error);
        return { products: [], menu: [] };
    }
};

// Fetch only products (backward compatibility)
export const fetchProductsFromSpreadsheet = async (): Promise<Product[]> => {
    const data = await fetchDataFromSpreadsheet('products');
    return data.products;
};

// Fetch only menu items
export const fetchMenuFromSpreadsheet = async (): Promise<MenuItem[]> => {
    const data = await fetchDataFromSpreadsheet('menu');
    return data.menu;
};
