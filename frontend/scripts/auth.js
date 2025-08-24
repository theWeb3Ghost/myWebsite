import { createAuth0Client } from 'https://cdn.auth0.com/js/auth0-spa-js/2.3/auth0-spa-js.production.esm.js';
let auth0;

async function initAuth0() {
    auth0 = await createAuth0Client({
        domain: "dev-b62l6w6s4k7oirma.us.auth0.com",
        clientId: "lNdbdg1Lbu9nupcqGGN4b7FiyMmQfpTT",
        authorizationParams: {
            redirect_uri: "https://mybeautybags.vercel.app/checkout.html"
        },
        cacheLocation: "localstorage",
        useRefreshTokens: true
    });

    // 👇 If coming back from Auth0 (code + state in URL)
    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
        try {
            await auth0.handleRedirectCallback();
            console.log("✅ Login successful");
        } catch (e) {
            console.error("❌ Error handling redirect", e);
        }
        // Clean up URL
        window.history.replaceState({}, document.title, "/auth.html");
    }

    const isAuthenticated = await auth0.isAuthenticated();

    if (!isAuthenticated) {
        // 👇 Not logged in yet → go to Auth0 login page
        return auth0.loginWithRedirect({
            authorizationParams: {
                redirect_uri: window.location.origin + "/checkout.html"

            }
        });
    }

    // 👇 Logged in already → send to checkout
    window.location.href = "/checkout.html";
}

initAuth0();