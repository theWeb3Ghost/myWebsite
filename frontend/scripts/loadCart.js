import { createAuth0Client } from 'https://cdn.auth0.com/js/auth0-spa-js/2.3/auth0-spa-js.production.esm.js';

let auth0;

async function initializeAuth0() {
    auth0 = await createAuth0Client({
        domain: "dev-b62l6w6s4k7oirma.us.auth0.com",
        clientId: "lNdbdg1Lbu9nupcqGGN4b7FiyMmQfpTT",
        authorizationParams: {
            redirect_uri: "http://localhost:5500/frontend/checkout.html"
        },
        cacheLocation: "localstorage",
        useRefreshTokens: true
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await initializeAuth0();

    // Handle redirect callback if coming back from Auth0
    if (window.location.search.includes("code=") &&
        window.location.search.includes("state=")) {
        await auth0.handleRedirectCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Just check login state, but DO NOT auto-redirect here
    const isAuthenticated = await auth0.isAuthenticated();
    console.log("Authenticated on load?", isAuthenticated);

    const user = isAuthenticated ? await auth0.getUser() : null;
    console.log("Logged in user:", user);

    // ✅ Attach Proceed to Checkout button
    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", proceedToCheckout);
    }

    // ✅ Attach cart selector change
    const cartSelector = document.getElementById("cart-selector");
    if (cartSelector) {
        cartSelector.addEventListener("change", (e) => {
            loadCart(e.target.value);
        });
    }

    // ✅ Load cart initially
    loadCart();
});

const totalPriceElement = document.getElementById("total-price");
const cartSelector = document.getElementById("cart-selector");
const checkoutLog = document.getElementById('checkout-btn');

let activeCart = localStorage.getItem("activeCart") || "cart1";

cartSelector.value = activeCart;
const cartItemsContainer = document.getElementById("cart-items");


function loadCart(cartName = activeCart) {
    activeCart = cartName;
    localStorage.setItem("activeCart", activeCart);
    const cart = JSON.parse(localStorage.getItem(activeCart)) || [];

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p class='empty-msg'>Your cart is empty.</p>";
        totalPriceElement.textContent = "";
        return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
    <div>
            <h3>
                ${item.name}
            </h3>
            <p> Quality: ${item.quantity}</p>
            <p> Price: $${item.price}</p>
            <button onclick="removeItem(${index})">Remove</button>
        </div>`

    }).join("");

    totalPriceElement.classList.add("checkout1");
    totalPriceElement.textContent = `Total: $${total.toFixed(2)}`
        ;
}


function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem(activeCart)) || [];
    cart.splice(index, 1);
    localStorage.setItem(activeCart, JSON.stringify(cart));
    loadCart();
}
function clearCart() {
    {
        localStorage.setItem(activeCart, JSON.stringify([])); // reset current cart to empty array
        loadCart();
    }

    loadCart();
}


async function proceedToCheckout() {
    if (!auth0) {
        console.error("Auth0 client not initialized yet!");
        return;
    }

    const cart = JSON.parse(localStorage.getItem(activeCart)) || [];
    if (cart.length === 0) {
        alert("Your cart is empty. Please add items before checking out.");
        return;
    }

    const isAuthenticated = await auth0.isAuthenticated();
    console.log("User authenticated?", isAuthenticated);

    if (!isAuthenticated) {
        await auth0.loginWithRedirect({
            authorizationParams: {
                redirect_uri: window.location.origin + "/frontend/checkout.html"
            }
        });
        return;
    }

    // Already logged in
    window.location.href = "/frontend/checkout.html";
}
document.addEventListener("DOMContentLoaded", () => {
    const clearBtn = document.querySelector("#clear-cart-btn");
    if (clearBtn) {
        clearBtn.addEventListener("click", clearCart);
    }
});




