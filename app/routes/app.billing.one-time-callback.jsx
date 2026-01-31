import { authenticate } from "../shopify.server";
import db from "../db.server";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const url = new URL(request.url);
    const sectionId = url.searchParams.get("sectionId");
    const chargeId = url.searchParams.get("charge_id"); // بيجي من شوبيفاي

    // 1. تسجيل السكشن في الداتابيز
    // بنبحث عن المتجر الأول
    const shopRecord = await db.shop.findUnique({ where: { shop: session.shop } });

    if (shopRecord && sectionId) {
        await db.purchasedSection.create({
            data: {
                shopId: shopRecord.id,
                sectionId: sectionId,
                price: 15.00, // المفروض تجيب السعر من الكتالوج للتأكيد
            }
        });
    }

    // 2. الرجوع للوحة التحكم
    return redirect("/app");
};