export const PLANS = {
    FREE: "FREE",
    BASIC: "BASIC",     // $9.99/month
    STANDARD: "STANDARD", // $19.99/month
    GOLD: "GOLD",       // $49.99/month
    PREMIUM: "PREMIUM"  // One-time $99 
};

export const PRICING = {
    BASIC: { amount: 9.99, currencyCode: 'USD', interval: 'EVERY_30_DAYS' },
    STANDARD: { amount: 19.99, currencyCode: 'USD', interval: 'EVERY_30_DAYS' },
    GOLD: { amount: 49.99, currencyCode: 'USD', interval: 'EVERY_30_DAYS' },
    // الـ One-time بيتعامل معاملة مختلفة في الكود
};