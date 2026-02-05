// app/models/config.js

export const PLAN_LIMITS = {
    FREE: 0,
    BASIC: 5,
    STANDARD: 10,
    GOLD: 25,
    PREMIUM: 9999,
};

export const SUBSCRIPTION_PLANS = {
    BASIC: { name: "Basic Plan", amount: 9.99, currency: "USD", interval: "EVERY_30_DAYS" },
    STANDARD: { name: "Standard Plan", amount: 19.99, currency: "USD", interval: "EVERY_30_DAYS" },
    GOLD: { name: "Gold Plan", amount: 49.99, currency: "USD", interval: "EVERY_30_DAYS" },
    PREMIUM: { name: "Premium Plan", amount: 99.99, currency: "USD", interval: "EVERY_30_DAYS" },
};

export const SECTIONS_CATALOG = {
    // 1. السكشن المجاني (سعره 0)
    "free-marquee": {
        id: "free-marquee",
        name: "Running Text (Free)",
        price: 0.00
    },

    // 2. السكشن المدفوع الأول
    "video-hero": {
        id: "video-hero",
        name: "Pro Video Hero",
        price: 20.00
    },

    // 3. السكشن المدفوع الثاني
    "faq-accordion": {
        id: "faq-accordion",
        name: "Smart FAQ",
        price: 15.00
    },
    "promo-banner": {
        id: "promo-banner",
        name: "Pro Promo Banner",
        price: 30.00, // One-time purchase price
        description: "Advanced banner with countdown."
    },
};