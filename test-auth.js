const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyl4pR2pEZ_xv5JC-jOCu9jYaUfhfJBuEIn8fzGaeUZSuFBi7S9VQXJHyaaz9xWaUFN/exec";

async function test() {
    try {
        console.log("Testing URL:", SCRIPT_URL);
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                action: "register",
                name: "TestUser",
                email: "test" + Date.now() + "@example.com",
                password: "password123"
            })
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
