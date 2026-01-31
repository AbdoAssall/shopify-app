import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
    // 1. استقبال الويب هوك والتأكد إنه جاي من شوبيفاي فعلاً
    const { topic, shop, session, admin } = await authenticate.webhook(request);

    if (!admin) {
        // The webhook request was valid, but the shop has likely uninstalled the app.
        // So we can't use the admin API, but we have the shop name.
        if (topic === "APP_UNINSTALLED") {
            await db.session.deleteMany({ where: { shop } });
            // اختياري: امسح أو عطل سجل المتجر في جدول Shop
            await db.shop.update({
                where: { shop },
                data: { plan: "FREE", isPaid: false }
            });
        }
        return new Response();
    }

    // 2. معالجة تحديث الاشتراك
    if (topic === "APP_SUBSCRIPTION_UPDATE") {
        // هنا بيوصلك إشعار إن حالة الدفع اتغيرت
        // ممكن تعمل استعلام وتحدث الداتابيز
        // (ده كود متقدم شوية بنحتاجه عشان نضمن إن الداتابيز متزامنة)
        console.log(`Subscription updated for shop: ${shop}`);
    }

    return new Response();
};