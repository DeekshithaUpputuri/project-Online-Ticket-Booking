"use strict";

/* =========================================================
   ADMIN CONFIGURATION
   ========================================================= */

const ADMIN_EMAIL = "admin@tickethub.com";
const ADMIN_PASSWORD = "admin123";

const ACCOUNTS_KEY = "ticketHubAccounts";
const BOOKINGS_KEY = "ticketHubBookings";
const NEWSLETTER_KEY = "ticketHubNewsletter";

const ADMIN_SESSION_KEY = "ticketHubAdminSession";


/* =========================================================
   STORAGE HELPERS
   ========================================================= */

function getAccounts() {

    try {

        return JSON.parse(
            localStorage.getItem(ACCOUNTS_KEY)
        ) || [];

    } catch (error) {

        return [];

    }

}


function getBookings() {

    try {

        return JSON.parse(
            localStorage.getItem(BOOKINGS_KEY)
        ) || {};

    } catch (error) {

        return {};

    }

}


function getSubscribers() {

    try {

        return JSON.parse(
            localStorage.getItem(NEWSLETTER_KEY)
        ) || [];

    } catch (error) {

        return [];

    }

}


/* =========================================================
   FLATTEN BOOKINGS
   ========================================================= */

function getAllBookings() {

    const bookingData = getBookings();

    const allBookings = [];

    Object.entries(bookingData).forEach(
        ([email, bookings]) => {

            bookings.forEach((booking) => {

                allBookings.push({
                    ...booking,
                    accountEmail: email
                });

            });

        }
    );

    return allBookings;

}


/* =========================================================
   LOGIN
   ========================================================= */

function loginAdmin(event) {

    event.preventDefault();

    const email =
        document.getElementById("adminEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document.getElementById("adminPassword")
            .value;

    const error =
        document.getElementById("adminLoginError");


    if (
        email === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
    ) {

        sessionStorage.setItem(
            ADMIN_SESSION_KEY,
            "true"
        );

        showDashboard();

    } else {

        error.textContent =
            "Invalid admin email or password.";

    }

}


/* =========================================================
   SHOW / HIDE DASHBOARD
   ========================================================= */

function showDashboard() {

    document
        .getElementById("adminLogin")
        .classList.add("hidden");

    document
        .getElementById("adminDashboard")
        .classList.remove("hidden");

    renderDashboard();

}


function logoutAdmin() {

    sessionStorage.removeItem(
        ADMIN_SESSION_KEY
    );

    document
        .getElementById("adminDashboard")
        .classList.add("hidden");

    document
        .getElementById("adminLogin")
        .classList.remove("hidden");

}


/* =========================================================
   DASHBOARD STATISTICS
   ========================================================= */

function renderDashboard() {

    const users = getAccounts();

    const bookings = getAllBookings();

    const subscribers = getSubscribers();


    const revenue = bookings.reduce(
        (total, booking) => {

            return total +
                Number(booking.total || 0);

        },
        0
    );


    document.getElementById("totalUsers")
        .textContent = users.length;


    document.getElementById("totalBookings")
        .textContent = bookings.length;


    document.getElementById("totalRevenue")
        .textContent =
        `₹${revenue.toLocaleString("en-IN")}`;


    document.getElementById("totalSubscribers")
        .textContent = subscribers.length;


    renderRecentBookings(bookings);

    renderEventOverview();

    renderEvents();

    renderBookings();

    renderUsers();

    renderNewsletter();

}


/* =========================================================
   RECENT BOOKINGS
   ========================================================= */

function renderRecentBookings(bookings) {

    const container =
        document.getElementById(
            "recentBookings"
        );

    if (bookings.length === 0) {

        container.innerHTML =
            `<p class="empty-state">
                No bookings yet.
            </p>`;

        return;

    }


    const recent =
        bookings.slice(0, 5);


    container.innerHTML =
        recent.map((booking) => `

            <div class="activity-row">

                <div>

                    <strong>
                        ${booking.event || "Event"}
                    </strong>

                    <span>
                        ${booking.name || "Customer"}
                    </span>

                </div>

                <strong>
                    ₹${booking.total || 0}
                </strong>

            </div>

        `).join("");

}


/* =========================================================
   EVENT OVERVIEW
   ========================================================= */

function renderEventOverview() {

    const container =
        document.getElementById(
            "eventOverview"
        );


    const events = [

        {
            name: "Movies",
            icon: "🎬",
            description:
                "Movie ticket bookings"
        },

        {
            name: "Cricket",
            icon: "🏏",
            description:
                "Live cricket matches"
        },

        {
            name: "Events",
            icon: "🎤",
            description:
                "Shows and experiences"
        }

    ];


    container.innerHTML =
        events.map((event) => `

            <div class="event-overview">

                <span class="event-icon">
                    ${event.icon}
                </span>

                <div>

                    <strong>
                        ${event.name}
                    </strong>

                    <span>
                        ${event.description}
                    </span>

                </div>

            </div>

        `).join("");

}


/* =========================================================
   EVENTS
   ========================================================= */

function renderEvents() {

    const container =
        document.getElementById(
            "adminEventsList"
        );


    const events = [

        ["🎬", "Movies", "From ₹260"],
        ["🏏", "Cricket Matches", "From ₹849"],
        ["🎤", "Live Events", "From ₹499"]

    ];


    container.innerHTML = `

        <div class="event-management-list">

            ${events.map((event) => `

                <div class="managed-event">

                    <span class="large-event-icon">
                        ${event[0]}
                    </span>

                    <div class="managed-event-info">

                        <strong>
                            ${event[1]}
                        </strong>

                        <span>
                            ${event[2]}
                        </span>

                    </div>

                    <span class="status-badge">
                        Active
                    </span>

                </div>

            `).join("")}

        </div>

    `;

}


/* =========================================================
   BOOKINGS TABLE
   ========================================================= */

function renderBookings() {

    const container =
        document.getElementById(
            "adminBookingsList"
        );

    const bookings =
        getAllBookings();


    if (bookings.length === 0) {

        container.innerHTML =
            `<p class="empty-state">
                No bookings found.
            </p>`;

        return;

    }


    container.innerHTML = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>
                        <th>Ticket</th>
                        <th>Customer</th>
                        <th>Event</th>
                        <th>Seats</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>

                </thead>

                <tbody>

                    ${bookings.map((booking) => `

                        <tr>

                            <td>
                                <strong>
                                    ${booking.ticketNumber}
                                </strong>
                            </td>

                            <td>
                                ${booking.name}
                                <small>
                                    ${booking.email}
                                </small>
                            </td>

                            <td>
                                ${booking.event}
                            </td>

                            <td>
                                ${booking.seats}
                            </td>

                            <td>
                                ₹${booking.total}
                            </td>

                            <td>
                                <span class="status-badge">
                                    Confirmed
                                </span>
                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `;

}


/* =========================================================
   USERS TABLE
   ========================================================= */

function renderUsers() {

    const container =
        document.getElementById(
            "adminUsersList"
        );

    const users = getAccounts();


    if (users.length === 0) {

        container.innerHTML =
            `<p class="empty-state">
                No registered users yet.
            </p>`;

        return;

    }


    container.innerHTML = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Account</th>
                    </tr>

                </thead>

                <tbody>

                    ${users.map((user) => `

                        <tr>

                            <td>
                                <strong>
                                    ${user.name}
                                </strong>
                            </td>

                            <td>
                                ${user.email}
                            </td>

                            <td>
                                <span class="status-badge">
                                    Active
                                </span>
                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `;

}


/* =========================================================
   NEWSLETTER
   ========================================================= */

function renderNewsletter() {

    const container =
        document.getElementById(
            "adminNewsletterList"
        );

    const subscribers =
        getSubscribers();


    if (subscribers.length === 0) {

        container.innerHTML =
            `<p class="empty-state">
                No newsletter subscribers yet.
            </p>`;

        return;

    }


    container.innerHTML = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>
                        <th>#</th>
                        <th>Email</th>
                        <th>Status</th>
                    </tr>

                </thead>

                <tbody>

                    ${subscribers.map(
                        (email, index) => `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${email}
                            </td>

                            <td>
                                <span class="status-badge">
                                    Subscribed
                                </span>
                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `;

}


/* =========================================================
   SIDEBAR NAVIGATION
   ========================================================= */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".sidebar-link"
        );


    buttons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach((item) =>
                    item.classList.remove("active")
                );

                button.classList.add("active");


                const section =
                    button.dataset.section;


                document
                    .querySelectorAll(".admin-section")
                    .forEach((item) => {

                        item.classList.remove(
                            "active"
                        );

                    });


                const target =
                    document.getElementById(
                        `${section}Section`
                    );


                if (target) {

                    target.classList.add(
                        "active"
                    );

                }


                document.getElementById(
                    "pageTitle"
                ).textContent =
                    section.charAt(0).toUpperCase() +
                    section.slice(1);

            }
        );

    });

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "adminToast"
        );

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const loginForm =
            document.getElementById(
                "adminLoginForm"
            );


        loginForm.addEventListener(
            "submit",
            loginAdmin
        );


        document
            .getElementById("adminLogout")
            .addEventListener(
                "click",
                logoutAdmin
            );


        setupNavigation();


        if (
            sessionStorage.getItem(
                ADMIN_SESSION_KEY
            ) === "true"
        ) {

            showDashboard();

        }

    }
);