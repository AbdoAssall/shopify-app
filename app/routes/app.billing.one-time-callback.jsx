import { authenticate } from "../shopify.server";
import db from "../db.server";
import { redirect } from "@remix-run/node";
import { SECTIONS_CATALOG } from "../models/sections"; // 1. استيراد الكتالوج

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const url = new URL(request.url);

    // شوبيفاي بترجع المعاملات دي في الرابط بعد الدفع
    const sectionId = url.searchParams.get("sectionId");
    const chargeId = url.searchParams.get("charge_id");

    // 2. التحقق من صحة البيانات (Validation)
    if (!sectionId || !chargeId) {
        console.error("Missing sectionId or charge_id");
        return redirect("/app?error=missing_params");
    }

    // 3. التأكد إن السكشن ده موجود في الكتالوج بتاعنا
    const sectionDetails = SECTIONS_CATALOG[sectionId];
    if (!sectionDetails) {
        console.error("Invalid Section ID");
        return redirect("/app?error=invalid_section");
    }

    // 4. البحث عن المتجر في قاعدة البيانات
    const shopRecord = await db.shop.findUnique({ where: { shop: session.shop } });

    if (shopRecord) {
        // 5. تسجيل العملية في الداتابيز بشكل كامل وصحيح
        await db.purchasedSection.create({
            data: {
                shopId: shopRecord.id,
                sectionId: sectionId,

                // هنا بناخد السعر من الكتالوج (الصح) ✅
                price: sectionDetails.price,

                // وهنا بنخزن رقم العملية المرجعي (الصح) ✅
                shopifyChargeId: chargeId
            }
        });

        console.log(`Success: Shop ${session.shop} bought ${sectionId} for $${sectionDetails.price}`);
    }

    // 6. الرجوع للوحة التحكم مع رسالة نجاح (اختياري)
    return redirect("/app?success=section_purchased");
};