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

const SPREADSHEET_API_URL = 'https://script.google.com/macros/s/AKfycbyx7VBEo-tXeTq1fdnHtNFesM8YHxc53v5XiidRM9ZxkM7YgVph_7H5xXiGYpRcU4pe/exec';

// Main function to fetch all data from spreadsheet
export const fetchDataFromSpreadsheet = async (): Promise<SpreadsheetResponse> => {
    try {
        // Append timestamp to prevent caching
        const response = await fetch(`${SPREADSHEET_API_URL}?t=${Date.now()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch data from spreadsheet');
        }
        const data = await response.json();

        // Handle both old format (array) and new format (object)
        if (Array.isArray(data)) {
            // Old format - just products array
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
    const data = await fetchDataFromSpreadsheet();
    return data.products;
};

// Fetch only menu items
export const fetchMenuFromSpreadsheet = async (): Promise<MenuItem[]> => {
    const data = await fetchDataFromSpreadsheet();
    return data.menu;
};
