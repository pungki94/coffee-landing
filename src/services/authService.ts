// Replace this with your deployed Google Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyl4pR2pEZ_xv5JC-jOCu9jYaUfhfJBuEIn8fzGaeUZSuFBi7S9VQXJHyaaz9xWaUFN/exec"

interface AuthResponse {
    status: 'success' | 'error';
    message?: string;
    error?: string;
    user?: {
        name: string;
        email: string;
    };
}

export const authService = {

    async register(name: string, email: string, password: string): Promise<AuthResponse> {
        return this.post({ action: 'register', name, email, password });
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        return this.post({ action: 'login', email, password });
    },

    async forgotPassword(email: string): Promise<AuthResponse> {
        return this.post({ action: 'forgot_password', email });
    },

    async resetPassword(email: string, token: string, newPassword: string): Promise<AuthResponse> {
        return this.post({ action: 'reset_password', email, token, newPassword });
    },

    async post(data: any): Promise<AuthResponse> {
        if (SCRIPT_URL.includes("INSERT_YOUR")) {
            console.error("Please update the SCRIPT_URL in src/services/authService.ts");
            return { status: 'error', error: "Configuration Error: SCRIPT_URL not set" };
        }

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                // 'text/plain' ensures no preflight OPTIONS request is sent, which is better for GAS
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Auth Service Error:", error);
            return { status: 'error', error: "Network or Server Error" };
        }
    }
};
