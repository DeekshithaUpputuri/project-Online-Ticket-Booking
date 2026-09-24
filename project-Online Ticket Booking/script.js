"use strict";

/* ============================================================
   State
   ============================================================ */

let selectedEvent = "";
let ticketPrice = 0;
let selectedCapacity = 0;
let selectedSeats = []; // [{ name, tier, price }]
let latestTicket = null;
let selectedMovie = null;
let selectedTheatre = null;
let selectedTime = null;
let selectedCategory = "movie";
let selectedCricketState = null;
let selectedCricketMatch = null;
let activeGenreFilter = "All";

/* ============================================================
   Storage keys & constants
   ============================================================ */

const ACCOUNTS_KEY = "ticketHubAccounts";
const SESSION_KEY = "ticketHubCurrentUser";
const BOOKINGS_KEY = "ticketHubBookings";
const WISHLIST_KEY = "ticketHubWishlist";
const THEME_KEY = "ticketHubTheme";
const NEWSLETTER_KEY = "ticketHubNewsletter";

const PROMO_CODES = {
    FIRST50: { discount: 0.5, label: "50% off" },
    STUDENT10: { discount: 0.1, label: "10% off" },
    WELCOME20: { discount: 0.2, label: "20% off" }
};

const SEAT_CONFIG = {
    movie: { rows: ["A", "B", "C", "D"], cols: 6, premiumRows: ["A", "B"], surcharge: 100 },
    cricket: { rows: ["A", "B", "C", "D"], cols: 10, premiumRows: ["A", "B"], surcharge: 150 },
    event: { rows: ["A", "B", "C"], cols: 8, premiumRows: ["A"], surcharge: 100 }
};

/* ============================================================
   Poster generator (unchanged)
   ============================================================ */

function createPosterSvg(title, subtitle, topColor, bottomColor, accentColor, textColor) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
            <defs>
                <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="${topColor}"/>
                    <stop offset="100%" stop-color="${bottomColor}"/>
                </linearGradient>
                <radialGradient id="glow" cx="50%" cy="35%" r="55%">
                    <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.9"/>
                    <stop offset="60%" stop-color="${accentColor}" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
                </radialGradient>
            </defs>
            <rect width="900" height="1200" fill="url(#bg)"/>
            <rect width="900" height="1200" fill="url(#glow)"/>
            <g opacity="0.28">
                <circle cx="110" cy="180" r="10" fill="${accentColor}"/>
                <circle cx="780" cy="240" r="15" fill="${textColor}"/>
                <circle cx="680" cy="100" r="20" fill="${accentColor}"/>
                <circle cx="760" cy="920" r="24" fill="${textColor}"/>
            </g>
            <g fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="6">
                <path d="M0 220 L900 220"/>
                <path d="M0 990 L900 990"/>
            </g>
            <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" font-size="150" font-weight="900" fill="${textColor}" font-family="Arial, Helvetica, sans-serif" letter-spacing="5">${title}</text>
            <text x="50%" y="66%" dominant-baseline="middle" text-anchor="middle" font-size="34" font-weight="700" fill="${textColor}" font-family="Arial, Helvetica, sans-serif" letter-spacing="8">${subtitle}</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/* ============================================================
   Catalog data
   ============================================================ */

const movieCatalog = [
    {
        name: "Toxic",
        price: 280,
        capacity: 180,
        rating: 4.3,
        poster: createPosterSvg("TOXIC", "A FILM OF NO LIMITS", "#0f1117", "#4c0d10", "#d12424", "#f4efe6"),
        genre: "Action / Thriller",
        theatres: ["INOX: Central Mall", "PVR: City Square", "Cinepolis: Grand Avenue"]
    },
    {
        name: "Irumudi",
        price: 260,
        capacity: 160,
        rating: 4.6,
        poster: createPosterSvg("IRUMUDI", "CELEBRATION OF ROOTS", "#c25b1d", "#062d2a", "#f8c75a", "#fff7e6"),
        genre: "Drama",
        theatres: ["Prasads: Screen 1", "PVR: Forum Mall", "Apsara: Multiplex"]
    },
    {
        name: "The Paradise",
        price: 320,
        capacity: 200,
        rating: 4.1,
        poster: createPosterSvg("PARADISE", "THE ULTIMATE QUEST", "#071925", "#5d0f1d", "#d9c071", "#f7f4ed"),
        genre: "Adventure",
        theatres: ["INOX: Riverside", "PVR: Liberty Plaza", "Cinepolis: Horizon"]
    },
    {
        name: "Vishwanath and Sons",
        price: 300,
        capacity: 190,
        rating: 4.5,
        poster: createPosterSvg("VISHWANATH", "& SONS", "#dfeaf1", "#9ba9b7", "#cf8d2d", "#18314d"),
        genre: "Comedy / Family",
        theatres: ["INOX: Central Mall", "PVR: Forum Mall", "Apsara: Multiplex"]
    },
    {
        name: "DC",
        price: 340,
        capacity: 220,
        rating: 4.0,
        poster: createPosterSvg("DC", "AN EPIC THRILL", "#09171e", "#102f3d", "#f2ca59", "#f5f3ef"),
        genre: "Superhero",
        theatres: ["PVR: City Square", "Cinepolis: Grand Avenue", "Prasads: Screen 2"]
    },
    {
        name: "Spider Man: Brand New Day",
        price: 360,
        capacity: 230,
        rating: 4.8,
        poster: createPosterSvg("SPIDER-MAN", "BRAND NEW DAY", "#f3d2a1", "#d97036", "#e0e9f2", "#1f2d44"),
        genre: "Action / Sci-Fi",
        theatres: ["INOX: Riverside", "PVR: Liberty Plaza", "Cinepolis: Horizon"]
    }
];

const cricketStateMatches = {
    Delhi: [
        { name: "India vs Pakistan", stadium: "Arun Jaitley Stadium", time: "7:30 PM", price: 999, capacity: 760 },
        { name: "India vs Australia", stadium: "Arun Jaitley Stadium", time: "9:15 PM", price: 1199, capacity: 820 }
    ],
    Mumbai: [
        { name: "India vs Pakistan", stadium: "Wankhede Stadium", time: "6:45 PM", price: 899, capacity: 710 },
        { name: "India vs Australia", stadium: "Wankhede Stadium", time: "8:30 PM", price: 1099, capacity: 790 }
    ],
    Chennai: [
        { name: "India vs Pakistan", stadium: "MA Chidambaram Stadium", time: "5:30 PM", price: 849, capacity: 690 },
        { name: "India vs Australia", stadium: "MA Chidambaram Stadium", time: "7:45 PM", price: 1049, capacity: 770 }
    ],
    Bengaluru: [
        { name: "India vs Pakistan", stadium: "M. Chinnaswamy Stadium", time: "6:00 PM", price: 929, capacity: 700 },
        { name: "India vs Australia", stadium: "M. Chinnaswamy Stadium", time: "8:15 PM", price: 1149, capacity: 780 }
    ]
};

const showTimes = ["10:30 AM", "1:15 PM", "4:00 PM", "7:30 PM", "9:45 PM"];
const eventTimes = ["6:00 PM", "7:30 PM", "8:45 PM", "9:30 PM"];

const faqData = [
    {
        q: "How quickly will I get my ticket after booking?",
        a: "Your digital ticket is generated instantly on this page as soon as your booking is confirmed — no waiting."
    },
    {
        q: "Can I cancel or change a booking?",
        a: "Yes. Log in, open \"My bookings\" from your account menu, and cancel the booking you no longer need."
    },
    {
        q: "What's the difference between standard and premium seats?",
        a: "Premium seats sit in the best rows of the venue and cost a small surcharge on top of the base ticket price."
    },
    {
        q: "Do promo codes stack with other offers?",
        a: "Only one promo code can be applied per booking. Try FIRST50, STUDENT10, or WELCOME20 at checkout."
    },
    {
        q: "Is my payment information secure?",
        a: "This demo does not collect real payment details. In production, TicketHub would use an encrypted, PCI-compliant payment gateway."
    }
];

const testimonialData = [
    { name: "Ananya R.", role: "Movie enthusiast", rating: 5, quote: "Booking took less than a minute and the seat map made choosing easy." },
    { name: "Karthik S.", role: "Cricket fan", rating: 5, quote: "Got great seats for the India vs Australia match without any hassle." },
    { name: "Meera P.", role: "Frequent traveler", rating: 4, quote: "Love that my bookings are saved to my account so I can find them later." }
];

/* ============================================================
   Toast notifications
   ============================================================ */

function showToast(message, type = "info") {
    const stack = document.getElementById("toastStack");
    if (!stack) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    stack.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";
        setTimeout(() => toast.remove(), 250);
    }, 3200);
}

/* ============================================================
   Theme (dark mode)
   ============================================================ */

function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    applyTheme(theme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    const icon = document.querySelector("#themeToggle .theme-icon");
    if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(current === "dark" ? "light" : "dark");
}

/* ============================================================
   Mobile navigation
   ============================================================ */

function initMobileNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("siteNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        });
    });
}

/* ============================================================
   Scroll reveal + animated counters + back-to-top
   ============================================================ */

function initScrollReveal() {
    const revealItems = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || revealItems.length === 0) {
        revealItems.forEach((item) => item.classList.add("in-view"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealItems.forEach((item) => observer.observe(item));
}

function initCounters() {
    const statsStrip = document.querySelector(".stats-strip");
    if (!statsStrip) return;

    let animated = false;

    const runCounters = () => {
        if (animated) return;
        animated = true;

        statsStrip.querySelectorAll("strong[data-count]").forEach((el) => {
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || "";
            const isDecimal = el.hasAttribute("data-decimal");
            const duration = 1200;
            const start = performance.now();

            function tick(now) {
                const progress = Math.min((now - start) / duration, 1);
                const value = target * progress;
                el.textContent = (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    };

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    runCounters();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.4 });
        observer.observe(statsStrip);
    } else {
        runCounters();
    }
}

function initBackToTop() {
    const button = document.getElementById("backToTop");
    if (!button) return;

    window.addEventListener("scroll", () => {
        button.classList.toggle("show", window.scrollY > 500);
    });
}

/* ============================================================
   Account storage helpers
   ============================================================ */

function getAccounts() {
    try {
        return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
    } catch (err) {
        return [];
    }
}

function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (err) {
        return null;
    }
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

function getInitials(name) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
}

/* ============================================================
   Bookings history (per account)
   ============================================================ */

function getAllBookings() {
    try {
        return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || {};
    } catch (err) {
        return {};
    }
}

function saveAllBookings(bookings) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function addBookingForUser(email, ticket) {
    const bookings = getAllBookings();
    if (!bookings[email]) bookings[email] = [];
    bookings[email].unshift(ticket);
    saveAllBookings(bookings);
}

function getBookingsForUser(email) {
    const bookings = getAllBookings();
    return bookings[email] || [];
}

function cancelBooking(email, ticketNumber) {
    const bookings = getAllBookings();
    if (!bookings[email]) return;
    bookings[email] = bookings[email].filter((t) => t.ticketNumber !== ticketNumber);
    saveAllBookings(bookings);
    renderBookingsPanel();
    showToast("Booking cancelled.", "info");
}

/* ============================================================
   Wishlist (saved movies, per account)
   ============================================================ */

function getAllWishlists() {
    try {
        return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || {};
    } catch (err) {
        return {};
    }
}

function saveAllWishlists(wishlists) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlists));
}

function getWishlist(email) {
    const wishlists = getAllWishlists();
    return wishlists[email] || [];
}

function toggleWishlist(movieName) {
    const user = getCurrentUser();
    if (!user) {
        showToast("Log in to save movies to your wishlist.", "info");
        openAuthModal("login");
        return;
    }

    const wishlists = getAllWishlists();
    const current = wishlists[user.email] || [];
    const alreadySaved = current.includes(movieName);

    wishlists[user.email] = alreadySaved
        ? current.filter((name) => name !== movieName)
        : [...current, movieName];

    saveAllWishlists(wishlists);
    renderMovieCards();
    renderSavedPanel();
    showToast(alreadySaved ? `Removed ${movieName} from saved movies.` : `Saved ${movieName} to your wishlist.`, "success");
}

function removeFromWishlist(movieName) {
    toggleWishlist(movieName);
}

/* ============================================================
   Modal open/close/tabs
   ============================================================ */

function closeModal(id) {
    document.getElementById(id).classList.remove("open");
}

function handleOverlayClick(event, id) {
    if (event.target.id === id) {
        closeModal(id);
    }
}

function openAuthModal(tab = "login") {
    switchAuthTab(tab);
    document.getElementById("authModal").classList.add("open");
    document.getElementById("loginError").textContent = "";
    document.getElementById("signupError").textContent = "";
}

function switchAuthTab(tab) {
    const isLogin = tab === "login";
    document.getElementById("loginForm").classList.toggle("hidden", !isLogin);
    document.getElementById("signupForm").classList.toggle("hidden", isLogin);
    document.getElementById("loginTabBtn").classList.toggle("active", isLogin);
    document.getElementById("signupTabBtn").classList.toggle("active", !isLogin);
}

function openAccountModal() {
    const user = getCurrentUser();
    if (!user) {
        openAuthModal("login");
        return;
    }
    switchAccountTab("bookings");
    renderBookingsPanel();
    renderSavedPanel();
    document.getElementById("accountModal").classList.add("open");
}

function switchAccountTab(tab) {
    const isBookings = tab === "bookings";
    document.getElementById("bookingsPanel").classList.toggle("hidden", !isBookings);
    document.getElementById("savedPanel").classList.toggle("hidden", isBookings);
    document.getElementById("bookingsTabBtn").classList.toggle("active", isBookings);
    document.getElementById("savedTabBtn").classList.toggle("active", !isBookings);
}

function renderBookingsPanel() {
    const user = getCurrentUser();
    const list = document.getElementById("bookingsList");
    if (!user) return;

    const bookings = getBookingsForUser(user.email);
    list.innerHTML = "";

    if (bookings.length === 0) {
        list.innerHTML = '<p class="account-empty">No bookings yet. Go book something exciting!</p>';
        return;
    }

    bookings.forEach((ticket) => {
        const item = document.createElement("div");
        item.className = "account-item";
        item.innerHTML = `
            <div class="account-item-info">
                <strong>${ticket.event}</strong>
                <span>${ticket.ticketNumber} • ${ticket.quantity} ticket${ticket.quantity === 1 ? "" : "s"} • ₹${ticket.total}</span>
            </div>
        `;
        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "account-item-action";
        cancelButton.textContent = "Cancel";
        cancelButton.onclick = () => cancelBooking(user.email, ticket.ticketNumber);
        item.appendChild(cancelButton);
        list.appendChild(item);
    });
}

function renderSavedPanel() {
    const user = getCurrentUser();
    const list = document.getElementById("savedList");
    if (!user) return;

    const saved = getWishlist(user.email);
    list.innerHTML = "";

    if (saved.length === 0) {
        list.innerHTML = '<p class="account-empty">No saved movies yet. Tap the heart on any movie card.</p>';
        return;
    }

    saved.forEach((movieName) => {
        const item = document.createElement("div");
        item.className = "account-item";
        item.innerHTML = `<div class="account-item-info"><strong>${movieName}</strong></div>`;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "account-item-action";
        removeButton.textContent = "Remove";
        removeButton.onclick = () => removeFromWishlist(movieName);
        item.appendChild(removeButton);
        list.appendChild(item);
    });
}

/* ============================================================
   Signup / Login / Logout
   ============================================================ */

function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const errorBox = document.getElementById("signupError");

    if (!name || !email || password.length < 6) {
        errorBox.textContent = "Please fill every field (password: 6+ characters).";
        return;
    }

    const accounts = getAccounts();
    if (accounts.some((account) => account.email === email)) {
        errorBox.textContent = "An account with this email already exists. Try logging in.";
        return;
    }

    accounts.push({ name, email, password });
    saveAccounts(accounts);
    setCurrentUser({ name, email });

    errorBox.textContent = "";
    document.getElementById("signupForm").reset();
    closeModal("authModal");
    renderAuthArea();
    showToast(`Welcome, ${name}! Your account is ready.`, "success");
}

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const errorBox = document.getElementById("loginError");

    const accounts = getAccounts();
    const match = accounts.find((account) => account.email === email && account.password === password);

    if (!match) {
        errorBox.textContent = "Incorrect email or password.";
        return;
    }

    setCurrentUser({ name: match.name, email: match.email });
    errorBox.textContent = "";
    document.getElementById("loginForm").reset();
    closeModal("authModal");
    renderAuthArea();
    showToast(`Logged in as ${match.name}.`, "success");
}

function handleLogout() {
    setCurrentUser(null);
    renderAuthArea();
    showToast("You have been logged out.", "info");
}

/* ============================================================
   Header auth area + booking form sync
   ============================================================ */

function renderAuthArea() {
    const authArea = document.getElementById("authArea");
    const user = getCurrentUser();
    authArea.innerHTML = "";

    if (user) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "user-chip";
        chip.title = "View my account";
        chip.innerHTML = `
            <span class="user-avatar">${getInitials(user.name)}</span>
            <span>${user.name}</span>
        `;
        chip.onclick = openAccountModal;

        const logoutButton = document.createElement("button");
        logoutButton.type = "button";
        logoutButton.className = "logout-button";
        logoutButton.textContent = "Log out";
        logoutButton.onclick = handleLogout;

        authArea.appendChild(chip);
        authArea.appendChild(logoutButton);
    } else {
        const loginButton = document.createElement("button");
        loginButton.type = "button";
        loginButton.className = "auth-button";
        loginButton.textContent = "Log in";
        loginButton.onclick = () => openAuthModal("login");

        const signupButton = document.createElement("button");
        signupButton.type = "button";
        signupButton.className = "auth-button filled";
        signupButton.textContent = "Sign up";
        signupButton.onclick = () => openAuthModal("signup");

        authArea.appendChild(loginButton);
        authArea.appendChild(signupButton);
    }

    syncBookingFormWithAuth();
    renderMovieCards();
}

function syncBookingFormWithAuth() {
    const user = getCurrentUser();
    const nameField = document.getElementById("customerName");
    const emailField = document.getElementById("email");
    const authHint = document.getElementById("authHint");

    if (user) {
        nameField.value = user.name;
        emailField.value = user.email;
        nameField.readOnly = true;
        emailField.readOnly = true;
        authHint.classList.remove("show");
    } else {
        nameField.readOnly = false;
        emailField.readOnly = false;
        authHint.classList.add("show");
    }
}

/* ============================================================
   Booking flow — navigation
   ============================================================ */

function scrollToEvents() {
    document.getElementById("events").scrollIntoView({ behavior: "smooth" });
}

function startMovieBooking() {
    selectedCategory = "movie";
    selectedMovie = null;
    selectedTheatre = null;
    selectedTime = null;
    selectedSeats = [];
    renderMovieCards();
    showStep("movieSelection");
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}

function startCricketBooking() {
    selectedCategory = "cricket";
    selectedMovie = null;
    selectedTheatre = null;
    selectedTime = null;
    selectedCricketState = null;
    selectedCricketMatch = null;
    selectedSeats = [];
    selectedEvent = "Cricket Match";
    document.getElementById("eventName").value = "Cricket Match";
    renderCricketStates();
    showStep("cricketStateSelection");
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}

function renderCricketStates() {
    const stateList = document.getElementById("cricketStateList");
    stateList.innerHTML = "";

    Object.entries(cricketStateMatches).forEach(([state, matches]) => {
        const stadium = matches[0].stadium;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-item";
        button.innerHTML = `<strong>${state}</strong><span>${stadium}</span>`;
        button.onclick = () => selectCricketState(state);
        stateList.appendChild(button);
    });
}

/* ---------- Movie search + genre filter + wishlist + ratings ---------- */

function renderGenreChips() {
    const container = document.getElementById("genreChips");
    if (!container) return;

    const genres = ["All", ...new Set(movieCatalog.map((movie) => movie.genre))];
    container.innerHTML = "";

    genres.forEach((genre) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "genre-chip" + (genre === activeGenreFilter ? " active" : "");
        chip.textContent = genre;
        chip.onclick = () => {
            activeGenreFilter = genre;
            renderGenreChips();
            renderMovieCards();
        };
        container.appendChild(chip);
    });
}

function renderStars(rating) {
    const fullStars = Math.round(rating);
    return "★".repeat(fullStars) + "☆".repeat(5 - fullStars) + ` ${rating.toFixed(1)}`;
}

function renderMovieCards() {
    const movieList = document.getElementById("movieList");
    if (!movieList) return;

    const searchInput = document.getElementById("movieSearch");
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const user = getCurrentUser();
    const savedList = user ? getWishlist(user.email) : [];

    const filtered = movieCatalog.filter((movie) => {
        const matchesGenre = activeGenreFilter === "All" || movie.genre === activeGenreFilter;
        const matchesSearch = movie.name.toLowerCase().includes(query) || movie.genre.toLowerCase().includes(query);
        return matchesGenre && matchesSearch;
    });

    movieList.innerHTML = "";

    if (filtered.length === 0) {
        movieList.innerHTML = '<p class="no-results">No movies match your search. Try a different title or genre.</p>';
        return;
    }

    filtered.forEach((movie) => {
        const isSaved = savedList.includes(movie.name);
        const card = document.createElement("div");
        card.className = "movie-card-item";
        card.innerHTML = `
            <div class="movie-poster" style="background-image: linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.65)), url('${movie.poster}')">
                <button type="button" class="wishlist-button ${isSaved ? "saved" : ""}" aria-label="Save to wishlist">${isSaved ? "♥" : "♡"}</button>
                <span class="movie-genre">${movie.genre}</span>
            </div>
            <div class="movie-card-content">
                <div class="movie-rating">${renderStars(movie.rating)}</div>
                <h4>${movie.name}</h4>
                <p>From ₹${movie.price}</p>
                <button type="button" class="secondary-button" data-action="select">Select movie</button>
            </div>
        `;
        card.querySelector(".wishlist-button").onclick = (event) => {
            event.stopPropagation();
            toggleWishlist(movie.name);
        };
        card.querySelector('[data-action="select"]').onclick = () => selectMovie(movie.name);
        movieList.appendChild(card);
    });
}

function renderTheatres() {
    const theatreList = document.getElementById("theatreList");
    theatreList.innerHTML = "";

    if (!selectedMovie) return;

    selectedMovie.theatres.forEach((theatre) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-item";
        button.textContent = theatre;
        button.onclick = () => selectTheatre(theatre);
        theatreList.appendChild(button);
    });
}

function renderTimes() {
    const timeList = document.getElementById("timeList");
    timeList.innerHTML = "";
    const title = document.getElementById("timeSelectionTitle");

    if (selectedCategory === "cricket") {
        title.textContent = "Timings";
        renderCricketMatches(cricketStateMatches[selectedCricketState]);
        return;
    }

    if (selectedCategory === "event") {
        title.textContent = "Timings";
        eventTimes.forEach((time) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "option-item time-item";
            button.textContent = time;
            button.onclick = () => selectTime(time);
            timeList.appendChild(button);
        });
        return;
    }

    title.textContent = "Timings";
    showTimes.forEach((time) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-item time-item";
        button.textContent = time;
        button.onclick = () => selectTime(time);
        timeList.appendChild(button);
    });
}

function selectMovie(title) {
    const movie = movieCatalog.find((item) => item.name === title);
    if (!movie) return;

    selectedCategory = "movie";
    selectedMovie = movie;
    selectedEvent = movie.name;
    ticketPrice = movie.price;
    selectedCapacity = movie.capacity;
    selectedTheatre = null;
    selectedTime = null;
    selectedSeats = [];

    document.getElementById("eventName").value = `${movie.name} • ${movie.genre}`;
    renderTheatres();
    showStep("theatreSelection");
    calculateTotal();
}

function selectCricketState(state) {
    selectedCategory = "cricket";
    selectedCricketState = state;
    selectedCricketMatch = null;
    selectedSeats = [];
    const matches = cricketStateMatches[state];
    const stadium = matches[0].stadium;
    selectedTheatre = stadium;
    selectedTime = null;

    document.getElementById("eventName").value = `${state} • ${stadium}`;
    renderCricketMatches(matches);
    showStep("timeSelection");
    calculateTotal();
}

function renderCricketMatches(matches) {
    const timeList = document.getElementById("timeList");
    timeList.innerHTML = "";

    matches.forEach((match) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-item time-item";
        button.innerHTML = `
            <strong>${match.name}</strong>
            <span>Match time: ${match.time}</span>
            <span>${match.stadium} • ₹${match.price}</span>
        `;
        button.onclick = () => selectCricketMatch(match);
        timeList.appendChild(button);
    });
}

function selectCricketMatch(match) {
    selectedCricketMatch = match;
    selectedEvent = `${match.name} • ${selectedCricketState}`;
    ticketPrice = match.price;
    selectedCapacity = match.capacity;
    selectedTime = match.time;
    selectedTheatre = match.stadium;
    selectedSeats = [];
    document.getElementById("eventName").value = `${match.name} • ${match.stadium} • ${match.time}`;
    showStep("seatSelectionPanel");
    renderSeatMap();
    calculateTotal();
}

function selectTheatre(theatre) {
    selectedTheatre = theatre;
    document.getElementById("eventName").value = `${selectedMovie.name} • ${theatre}`;
    renderTimes();
    showStep("timeSelection");
}

function selectTime(time) {
    selectedTime = time;
    selectedSeats = [];

    if (selectedCategory === "cricket" || selectedCategory === "event") {
        document.getElementById("eventName").value = `${selectedEvent} • ${time}`;
    } else {
        document.getElementById("eventName").value = `${selectedMovie.name} • ${selectedTheatre} • ${time}`;
    }

    showStep("seatSelectionPanel");
    renderSeatMap();
    calculateTotal();
}

function showSeatPanel() {
    if (selectedTime) {
        showStep("seatSelectionPanel");
        renderSeatMap();
    } else {
        showToast("Please choose a show time first.", "info");
    }
}

function showStep(stepId) {
    document.querySelectorAll(".step-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.id === stepId);
    });
}

function selectEvent(event, price, capacity = 0) {
    selectedCategory = "event";
    selectedEvent = event;
    ticketPrice = price;
    selectedCapacity = capacity;
    selectedMovie = null;
    selectedTheatre = null;
    selectedTime = null;
    selectedCricketState = null;
    selectedCricketMatch = null;
    selectedSeats = [];
    document.getElementById("eventName").value = capacity ? `${event} • ${capacity} seats` : event;
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
    renderTimes();
    showStep("timeSelection");
    calculateTotal();
}

/* ============================================================
   Seat map (standard + premium tiers)
   ============================================================ */

function renderSeatMap() {
    const config = SEAT_CONFIG[selectedCategory] || SEAT_CONFIG.event;
    const seatMap = document.getElementById("seatMap");
    if (!seatMap) return;

    seatMap.innerHTML = "";
    seatMap.style.gridTemplateColumns = `24px repeat(${config.cols}, minmax(34px, 1fr))`;

    config.rows.forEach((row) => {
        const isPremium = config.premiumRows.includes(row);

        const rowLabel = document.createElement("span");
        rowLabel.className = "seat-row-label";
        rowLabel.textContent = row;
        seatMap.appendChild(rowLabel);

        for (let col = 1; col <= config.cols; col++) {
            const seatName = `${row}${col}`;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "seat" + (isPremium ? " premium" : "");
            button.dataset.seat = seatName;
            button.dataset.tier = isPremium ? "premium" : "standard";
            button.textContent = seatName;
            button.setAttribute("aria-label", `Seat ${seatName}${isPremium ? " (premium)" : ""}`);
            button.onclick = () => selectSeat(button);
            seatMap.appendChild(button);
        }
    });

    seatMap.style.display = "grid";
    seatMap.style.gap = "8px";
    updateSeatHint();
}

function selectSeat(button) {
    if (button.classList.contains("booked")) {
        showToast("This seat is already booked.", "error");
        return;
    }

    const quantity = Number(document.getElementById("quantity").value);
    const config = SEAT_CONFIG[selectedCategory] || SEAT_CONFIG.event;
    const seatName = button.dataset.seat;
    const tier = button.dataset.tier;
    const price = ticketPrice + (tier === "premium" ? config.surcharge : 0);

    if (button.classList.contains("selected")) {
        button.classList.remove("selected");
        selectedSeats = selectedSeats.filter((seat) => seat.name !== seatName);
    } else if (selectedSeats.length < quantity) {
        button.classList.add("selected");
        selectedSeats.push({ name: seatName, tier, price });
    } else {
        showToast(`Please choose ${quantity} seat${quantity === 1 ? "" : "s"}.`, "info");
        return;
    }

    calculateTotal();
}

/* ============================================================
   Pricing — quantity, seat tiers, promo codes
   ============================================================ */

function applyPromoCode(subtotal) {
    const codeInput = document.getElementById("promoCode");
    const hint = document.getElementById("promoHint");
    const code = codeInput.value.trim().toUpperCase();

    if (!code) {
        hint.textContent = "";
        hint.className = "promo-hint";
        return Math.round(subtotal);
    }

    const promo = PROMO_CODES[code];
    if (promo) {
        hint.textContent = `Promo applied: ${promo.label}`;
        hint.className = "promo-hint success";
        return Math.round(subtotal * (1 - promo.discount));
    }

    hint.textContent = "Invalid promo code";
    hint.className = "promo-hint error";
    return Math.round(subtotal);
}

function calculateTotal() {
    const quantity = Number(document.getElementById("quantity").value);

    if (selectedSeats.length > quantity) {
        const keepNames = new Set(selectedSeats.slice(0, quantity).map((seat) => seat.name));
        document.querySelectorAll(".seat").forEach((seat) => {
            if (!keepNames.has(seat.dataset.seat)) seat.classList.remove("selected");
        });
        selectedSeats = selectedSeats.slice(0, quantity);
    }

    const chosenTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const remainingSeats = quantity - selectedSeats.length;
    const subtotal = chosenTotal + Math.max(remainingSeats, 0) * ticketPrice;

    const total = applyPromoCode(subtotal);
    document.getElementById("total").innerText = total;
    updateSeatHint();
}

function updateSeatHint() {
    const quantity = Number(document.getElementById("quantity").value);
    const hint = document.getElementById("seatHint");
    if (hint) hint.innerText = `${selectedSeats.length}/${quantity} selected`;
}

/* ============================================================
   Booking confirmation
   ============================================================ */

function bookTicket() {
    const user = getCurrentUser();
    if (!user) {
        showToast("Please log in or create an account before confirming your booking.", "error");
        openAuthModal("login");
        return;
    }

    const name = document.getElementById("customerName").value;
    const email = document.getElementById("email").value;
    const quantity = Number(document.getElementById("quantity").value);

    if (selectedEvent === "") {
        showToast("Please select a movie or event.", "error");
        return;
    }

    if (name === "" || email === "") {
        showToast("Please enter your name and email.", "error");
        return;
    }

    if (selectedSeats.length !== quantity) {
        showToast(`Please select ${quantity} seat${quantity === 1 ? "" : "s"}.`, "error");
        return;
    }

    const chosenTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const total = applyPromoCode(chosenTotal);
    const ticketNumber = "TKT" + Math.floor(100000 + Math.random() * 900000);
    const promoCode = document.getElementById("promoCode").value.trim().toUpperCase();

    latestTicket = {
        ticketNumber,
        name,
        email,
        event: selectedEvent,
        seats: selectedSeats.map((seat) => seat.name).join(", "),
        quantity,
        total,
        capacity: selectedCapacity,
        theatre: selectedTheatre,
        time: selectedTime,
        promoCode: PROMO_CODES[promoCode] ? promoCode : null,
        bookedAt: new Date().toISOString()
    };

    addBookingForUser(user.email, latestTicket);

    const ticketDetails = document.getElementById("ticketDetails");
    ticketDetails.replaceChildren();
    [["Ticket ID", ticketNumber], ["Name", name], ["Email", email], ["Event", selectedEvent], ["Theatre", selectedTheatre || "Standard theatre"], ["Timing", selectedTime || "Any show"], ["Seats", latestTicket.seats], ["Tickets", quantity], ["Total amount", `₹${total}`], ["Status", "Booking confirmed"]].forEach(([label, value]) => {
        const item = document.createElement("div");
        item.innerHTML = `<p>${label}</p><strong></strong>`;
        item.querySelector("strong").textContent = value;
        ticketDetails.appendChild(item);
    });
    ticketDetails.className = "ticket-card-grid";

    document.getElementById("ticket").style.display = "block";
    document.getElementById("ticket").scrollIntoView({ behavior: "smooth" });

    document.querySelectorAll(".seat").forEach((seat) => {
        if (selectedSeats.some((s) => s.name === seat.dataset.seat)) {
            seat.classList.add("booked");
            seat.classList.remove("selected");
        }
    });

    showToast("Ticket booked successfully!", "success");
    selectedSeats = [];
    updateSeatHint();
}

function downloadTicketFile() {
    if (!latestTicket) return;

    const ticketText = [
        "TICKETHUB - DIGITAL TICKET",
        "===========================",
        `Ticket ID: ${latestTicket.ticketNumber}`,
        `Name: ${latestTicket.name}`,
        `Email: ${latestTicket.email}`,
        `Event: ${latestTicket.event}`,
        `Theatre: ${latestTicket.theatre || "Standard theatre"}`,
        `Timing: ${latestTicket.time || "Any show"}`,
        `Seats: ${latestTicket.seats}`,
        `Tickets: ${latestTicket.quantity}`,
        `Total amount: ₹${latestTicket.total}`,
        latestTicket.promoCode ? `Promo code: ${latestTicket.promoCode}` : null,
        "Status: Booking confirmed"
    ].filter(Boolean).join("\n");

    const file = new Blob([ticketText], { type: "text/plain;charset=utf-8" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = `${latestTicket.ticketNumber}-ticket.txt`;
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);
}

/* ============================================================
   FAQ accordion
   ============================================================ */

function renderFaq() {
    const list = document.getElementById("faqList");
    if (!list) return;

    list.innerHTML = "";
    faqData.forEach((entry, index) => {
        const item = document.createElement("div");
        item.className = "faq-item";
        item.innerHTML = `
            <button type="button" class="faq-question">
                <span>${entry.q}</span>
                <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="faq-answer"><p>${entry.a}</p></div>
        `;
        item.querySelector(".faq-question").onclick = () => {
            const wasOpen = item.classList.contains("open");
            list.querySelectorAll(".faq-item").forEach((el) => el.classList.remove("open"));
            if (!wasOpen) item.classList.add("open");
        };
        list.appendChild(item);
    });
}

/* ============================================================
   Testimonials
   ============================================================ */

function renderTestimonials() {
    const grid = document.getElementById("testimonialGrid");
    if (!grid) return;

    grid.innerHTML = "";
    testimonialData.forEach((entry) => {
        const card = document.createElement("div");
        card.className = "testimonial-card";
        card.setAttribute("data-reveal", "");
        card.innerHTML = `
            <div class="testimonial-stars">${"★".repeat(entry.rating)}${"☆".repeat(5 - entry.rating)}</div>
            <p class="testimonial-quote">"${entry.quote}"</p>
            <div class="testimonial-person">
                <span class="testimonial-avatar">${getInitials(entry.name)}</span>
                <div>
                    <div class="testimonial-name">${entry.name}</div>
                    <div class="testimonial-role">${entry.role}</div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    initScrollReveal();
}

/* ============================================================
   Newsletter signup
   ============================================================ */

function handleNewsletterSignup(event) {
    event.preventDefault();
    const emailField = document.getElementById("newsletterEmail");
    const note = document.getElementById("newsletterNote");
    const email = emailField.value.trim().toLowerCase();

    if (!email) return;

    try {
        const list = JSON.parse(localStorage.getItem(NEWSLETTER_KEY)) || [];
        if (!list.includes(email)) list.push(email);
        localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(list));
    } catch (err) {
        // ignore storage errors for this non-critical feature
    }

    note.textContent = "Thanks for subscribing! Watch your inbox for updates.";
    emailField.value = "";
    showToast("Subscribed to the newsletter.", "success");
}

/* ============================================================
   Init
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initMobileNav();

    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

    renderGenreChips();
    renderMovieCards();
    showStep("movieSelection");
    calculateTotal();
    renderAuthArea();
    renderFaq();
    renderTestimonials();
    initBackToTop();
    initCounters();
    initScrollReveal();
});
