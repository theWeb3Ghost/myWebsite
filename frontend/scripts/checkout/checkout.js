import { createAuth0Client } from 'https://cdn.auth0.com/js/auth0-spa-js/2.3/auth0-spa-js.production.esm.js';
import { saveCart, getCartFromDB } from "./cartapi.js";
import { fetchWallet } from "./walletapi.js";
import { saveAddresses, saveAddressesToDB } from "./addressApi.js";
import { mintNFT } from "./mintApi.js";

const myAuthKey = {
    domain: "dev-b62l6w6s4k7oirma.us.auth0.com",
    clientId: "lNdbdg1Lbu9nupcqGGN4b7FiyMmQfpTT",
    authorizationParams: {
        redirect_uri: "http://localhost:5500/frontend/checkout.html",
        scope: "openid profile email offline_access",
        audience: "http://localhost/api"
    },
    cacheLocation: "localstorage"
};

let myAuth;

// === 1. Initialize Auth0 ===
async function initAuth0() {
    myAuth = await createAuth0Client(myAuthKey);

    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
        try {
            await myAuth.handleRedirectCallback();
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
            console.error("Error handling redirect callback:", err);
        }
    }

    const isAuthenticated = await myAuth.isAuthenticated();
    if (!isAuthenticated) {
        await myAuth.loginWithRedirect({
            authorizationParams: {
                redirect_uri: window.location.origin + "/frontend/checkout.html"
            }
        });
        return false;
    }

    return true;
}

// === 2. Token helper ===
async function getTokenSafe() {
    try {
        return await myAuth.getTokenSilently({
            audience: "http://localhost/api",
            scope: "openid profile email offline_access"
        });
    } catch (err) {
        if (err.error === "consent_required") {
            await myAuth.loginWithRedirect({
                authorizationParams: {
                    audience: "http://localhost/api",
                    scope: "openid profile email offline_access"
                }
            });
        } else {
            throw err;
        }
    }
}

// === 3. Cart merging ===
function mergeCarts(localCart = [], dbCart = []) {
    const merged = [...dbCart];
    localCart.forEach(localItem => {
        const index = merged.findIndex(dbItem => dbItem.id === localItem.id);
        if (index >= 0) {
            merged[index].quantity = Math.max(
                merged[index].quantity,
                localItem.quantity
            );
        } else {
            merged.push(localItem);
        }
    });
    return merged;
}

async function loadCart(token) {
    const localCartName = localStorage.getItem("activeCart") || "cart1";
    const localCart = JSON.parse(localStorage.getItem(localCartName)) || [];

    let dbCart = [];
    try {
        dbCart = await getCartFromDB(token);
    } catch (err) {
        console.warn("Could not fetch cart from DB:", err);
    }

    const finalCart = mergeCarts(localCart, dbCart);
    localStorage.setItem(localCartName, JSON.stringify(finalCart));

    try {
        await saveCart(finalCart, token);
    } catch (err) {
        console.warn("Could not save merged cart to DB:", err);
    }

    return finalCart;
}

// === 4. Render cart ===
async function renderCart() {
    const checkoutSum = document.getElementById("checkout-sum");
    if (!checkoutSum) return;

    const user = await myAuth.getUser();
    const token = await getTokenSafe();

    console.log("Logged in user:", user);
    console.log("User Token:", token);

    const cart = await loadCart(token);

    if (cart.length === 0) {
        checkoutSum.innerHTML = `
            <div class="empty">
                <p>Your cart is empty, go back to home page.</p>
                <a href="index.html" class="backhome">🏡 Back Home</a>
            </div>`;
        return;
    }

    let total = 0;
    const itemsHtml = cart.map(item => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        total += itemTotal;
        return `<div class="checkout">
            <span class="item-name">${item.name}</span>
            <span class="item-quant">x${item.quantity}</span>
            <span class="total">$${itemTotal.toFixed(2)}</span>
        </div>`;
    }).join("");

    //checknft

    let discountApplied = false;
    try {
        const res = await fetch("http://localhost:4000/api/wallet", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            console.warn("Wallet fetch failed with status:", res.status);
        } else {
            const data = await res.json();

            // <-- Put the log here
            console.log("Discount applied?", discountApplied, "NFT info:", data.nftInfo);


            if (data.nftInfo?.nftSent) {
                total *= 0.9; // apply 10% discount
                discountApplied = true;
            }
        }
    } catch (err) {
        console.warn("Could not fetch NFT info:", err);
    }


    checkoutSum.innerHTML = `
        <div class="checkout-container">
            ${itemsHtml}
            <div class="checkout-total">
                <strong>Total: $${total.toFixed(2)}</strong>
               ${discountApplied ? '<p class="discount-msg">🎉 10% NFT discount applied!</p>' : ''}
            </div>
        </div>`;

    const welcomeBox = document.getElementById("welcome-user");
    if (welcomeBox) {
        welcomeBox.innerHTML = `👋 Welcome, <strong>${user.name || user.nickname || user.email}</strong>`;
    }

    await saveCart(cart, token);
}

async function renderWallet() {
    const token = await getTokenSafe();
    const wallet = await fetchWallet(token);
    const user = await myAuth.getUser();

    console.log("User Wallet:", wallet);

    // Example: show on the checkout page
    const walletBox = document.getElementById("wallet-box");
    if (walletBox) {
        walletBox.innerHTML = `
      <p><strong>Wallet Address:</strong> ${wallet.wallet.address}</p>
      <p><strong>Private Key:</strong> <span class="blurred">${wallet.wallet.privatekey}</span></p>
    `;
    } await mintNFT({
        userId: user.sub,       // Auth0 unique user id
        email: user.email,
        wallet: wallet.wallet
    });
}

// === 5. Main entry point ===
document.addEventListener("DOMContentLoaded", async () => {
    const authenticated = await initAuth0();
    if (authenticated) {
        await renderCart();
        await renderWallet();

    }
});

// === 6. Logout ===
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        sessionStorage.clear();
        myAuth.logout({
            logoutParams: { returnTo: "http://localhost:5500/frontend/auth.html" }
        });
    });
}
//=== 7. info save===

document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("saveinfo");
    const payBtn = document.getElementById("payment");

    // Save locally
    saveBtn.addEventListener("click", () => {
        const address1 = document.getElementById("address1").value.trim();
        const address2 = document.getElementById("address2").value.trim();
        const contact = document.getElementById("contact").value.trim();
        if (!address1 || !contact) {
            alert("Please enter at least Address 1 and Contact before saving.");
            return;
        }
        saveAddresses(address1, address2, contact);
        alert("Addresses saved");
    });

    // Save to DB
    payBtn.addEventListener("click", async () => {
        try {

            const token = await getTokenSafe();
            await saveAddressesToDB(token);
            alert("Addresses saved to database. Proceeding to payment...");
            // payment
        } catch (err) {
            alert(err.message);
        }
    });
});
