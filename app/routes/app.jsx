import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";

// 1. استيراد Polaris Provider والستايل والترجمات
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import polarisTranslations from "@shopify/polaris/locales/en.json";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  // نرجع البيانات مباشرة بدون json() لأنك في React Router v7
  return { apiKey: process.env.SHOPIFY_API_KEY };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      {/* 2. تغليف التطبيق بـ Polaris Provider */}
      <PolarisAppProvider i18n={polarisTranslations}>
        <Outlet />
      </PolarisAppProvider>
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};



// import { Outlet, useLoaderData, useRouteError } from "react-router";
// import { boundary } from "@shopify/shopify-app-react-router/server";
// import { AppProvider } from "@shopify/shopify-app-react-router/react";
// import { authenticate } from "../shopify.server";

// export const loader = async ({ request }) => {
//   await authenticate.admin(request);

//   // eslint-disable-next-line no-undef
//   return { apiKey: process.env.SHOPIFY_API_KEY || "" };
// };

// export default function App() {
//   const { apiKey } = useLoaderData();

//   return (
//     <AppProvider embedded apiKey={apiKey}>
//       <s-app-nav>
//         <s-link href="/app">Home</s-link>
//         <s-link href="/app/additional">Additional page</s-link>
//       </s-app-nav>
//       <Outlet />
//     </AppProvider>
//   );
// }

// // Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
// export function ErrorBoundary() {
//   return boundary.error(useRouteError());
// }

// export const headers = (headersArgs) => {
//   return boundary.headers(headersArgs);
// };
