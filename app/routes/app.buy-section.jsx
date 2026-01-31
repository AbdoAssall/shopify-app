import { authenticate } from "../shopify.server";
import { SECTIONS_CATALOG } from "../models/sections";
import { redirect } from "@remix-run/node";

export const action = async ({ request }) => {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();

    // 1. استقبال الـ ID بتاع السكشن اللي العميل عايز يشتريه
    const sectionId = formData.get("sectionId");
    const section = SECTIONS_CATALOG[sectionId];

    if (!section) return null;

    // 2. طلب الدفع من شوبيفاي (One-time)
    const response = await admin.graphql(
        `#graphql
    mutation AppPurchaseOneTimeCreate($name: String!, $price: MoneyInput!, $returnUrl: URL!) {
      appPurchaseOneTimeCreate(name: $name, price: $price, returnUrl: $returnUrl) {
        userErrors { field message }
        confirmationUrl
        appPurchaseOneTime { id }
      }
    }`,
        {
            variables: {
                name: `Purchase Section: ${section.name}`,
                returnUrl: `${process.env.SHOPIFY_APP_URL}/app/billing/one-time-callback?sectionId=${sectionId}`,
                price: { amount: section.price, currencyCode: "USD" }
            },
        }
    );

    const data = await response.json();

    // 3. توجيه العميل للموافقة على الدفع
    if (data.data.appPurchaseOneTimeCreate.confirmationUrl) {
        return redirect(data.data.appPurchaseOneTimeCreate.confirmationUrl);
    }

    return null;
};