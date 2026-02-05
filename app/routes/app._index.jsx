import { useLoaderData, Form, useSubmit } from "react-router"; // تحديث الاستيراد وحذف json
import { Page, Layout, Card, Text, Button, BlockStack, Box, InlineGrid, Badge } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { SUBSCRIPTION_PLANS } from "../models/config"; // استيراد الخطط من ملف الإعدادات

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  // 1. جلب بيانات المتجر من جدول Shop (وليس ShopSettings)
  let shopData = await db.shop.findUnique({ where: { shop: session.shop } });

  // لو المتجر مش موجود في الداتابيز لسبب ما، ننشئه كـ FREE
  if (!shopData) {
    shopData = await db.shop.create({
      data: {
        shop: session.shop,
        plan: "FREE",
        isPaid: false
      }
    });
  }

  // 2. إرجاع البيانات مباشرة بدون دالة json()
  return {
    shop: shopData,
    plans: SUBSCRIPTION_PLANS
  };
};

// الـ Action هنا مش محتاجينه لأننا هنوجه الفورم لملف app.upgrade مباشرة
export const action = async ({ request }) => {
  return null;
};

export default function Index() {
  const { shop, plans } = useLoaderData();
  const submit = useSubmit();

  // دالة المساعدة لمعرفة الخطة الحالية
  const isCurrentPlan = (planKey) => {
    if (planKey === "FREE" && shop.plan === "FREE") return true;
    return shop.plan === planKey && shop.isPaid;
  };

  return (
    <Page title="Dashboard & Pricing">
      <Layout>
        {/* قسم عرض الحالة الحالية */}
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Text variant="headingMd" as="h2">Current Subscription</Text>
              <Text variant="bodyMd">
                You are currently on the <Text fontWeight="bold">{shop.plan}</Text> plan.
              </Text>
              <Text tone={shop.isPaid ? "success" : "subdued"}>
                Status: {shop.isPaid ? "Active" : "Free / Inactive"}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* قسم عرض الخطط ديناميكياً */}
        <Layout.Section>
          <Text variant="headingXl" as="h2" alignment="center">Choose your plan</Text>
          <Box paddingBlockStart="400">
            <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">

              {/* 1. Free Plan Card */}
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingLg" as="h3">Free</Text>
                  <Text variant="headingxl" as="p">$0.00 <Text variant="bodySm" as="span">/month</Text></Text>
                  <Text>Basic access to limited sections.</Text>

                  {shop.plan === "FREE" ? (
                    <Badge tone="info">Current Plan</Badge>
                  ) : (
                    <Button disabled>Downgrade (Contact Support)</Button>
                  )}
                </BlockStack>
              </Card>

              {/* 2. Paid Plans Loop */}
              {Object.keys(plans).map((planKey) => {
                const plan = plans[planKey];
                const active = isCurrentPlan(planKey);

                return (
                  <Card key={planKey}>
                    <BlockStack gap="400">
                      <Text variant="headingLg" as="h3">{plan.name}</Text>
                      <Text variant="headingxl" as="p">
                        ${plan.amount} <Text variant="bodySm" as="span">/{plan.interval === "EVERY_30_DAYS" ? "mo" : "year"}</Text>
                      </Text>

                      {/* عرض المزايا بناء على الخطة - اختياري */}
                      <BlockStack gap="200">
                        <Text>Unlock premium sections</Text>
                        <Text>Priority Support</Text>
                      </BlockStack>

                      {/* زر الترقية يوجه لملف app.upgrade */}
                      <Form action="/app/upgrade" method="post">
                        <input type="hidden" name="plan" value={planKey} />
                        <Button
                          submit
                          variant="primary"
                          disabled={active}
                        >
                          {active ? "Active Plan" : `Upgrade to ${planKey}`}
                        </Button>
                      </Form>

                    </BlockStack>
                  </Card>
                );
              })}
            </InlineGrid>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// import { useEffect } from "react";
// import { useFetcher } from "react-router";
// import { useAppBridge } from "@shopify/app-bridge-react";
// import { boundary } from "@shopify/shopify-app-react-router/server";
// import { authenticate } from "../shopify.server";

// export const loader = async ({ request }) => {
//   await authenticate.admin(request);

//   return null;
// };

// export const action = async ({ request }) => {
//   const { admin } = await authenticate.admin(request);
//   const color = ["Red", "Orange", "Yellow", "Green"][
//     Math.floor(Math.random() * 4)
//   ];
//   const response = await admin.graphql(
//     `#graphql
//       mutation populateProduct($product: ProductCreateInput!) {
//         productCreate(product: $product) {
//           product {
//             id
//             title
//             handle
//             status
//             variants(first: 10) {
//               edges {
//                 node {
//                   id
//                   price
//                   barcode
//                   createdAt
//                 }
//               }
//             }
//           }
//         }
//       }`,
//     {
//       variables: {
//         product: {
//           title: `${color} Snowboard`,
//         },
//       },
//     },
//   );
//   const responseJson = await response.json();
//   const product = responseJson.data.productCreate.product;
//   const variantId = product.variants.edges[0].node.id;
//   const variantResponse = await admin.graphql(
//     `#graphql
//     mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
//       productVariantsBulkUpdate(productId: $productId, variants: $variants) {
//         productVariants {
//           id
//           price
//           barcode
//           createdAt
//         }
//       }
//     }`,
//     {
//       variables: {
//         productId: product.id,
//         variants: [{ id: variantId, price: "100.00" }],
//       },
//     },
//   );
//   const variantResponseJson = await variantResponse.json();

//   return {
//     product: responseJson.data.productCreate.product,
//     variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
//   };
// };

// export default function Index() {
//   const fetcher = useFetcher();
//   const shopify = useAppBridge();
//   const isLoading =
//     ["loading", "submitting"].includes(fetcher.state) &&
//     fetcher.formMethod === "POST";

//   useEffect(() => {
//     if (fetcher.data?.product?.id) {
//       shopify.toast.show("Product created");
//     }
//   }, [fetcher.data?.product?.id, shopify]);
//   const generateProduct = () => fetcher.submit({}, { method: "POST" });

//   return (
//     <s-page heading="Shopify app template">
//       <s-button slot="primary-action" onClick={generateProduct}>
//         Generate a product
//       </s-button>

//       <s-section heading="Congrats on creating a new Shopify app 🎉">
//         <s-paragraph>
//           This embedded app template uses{" "}
//           <s-link
//             href="https://shopify.dev/docs/apps/tools/app-bridge"
//             target="_blank"
//           >
//             App Bridge
//           </s-link>{" "}
//           interface examples like an{" "}
//           <s-link href="/app/additional">additional page in the app nav</s-link>
//           , as well as an{" "}
//           <s-link
//             href="https://shopify.dev/docs/api/admin-graphql"
//             target="_blank"
//           >
//             Admin GraphQL
//           </s-link>{" "}
//           mutation demo, to provide a starting point for app development.
//         </s-paragraph>
//       </s-section>
//       <s-section heading="Get started with products">
//         <s-paragraph>
//           Generate a product with GraphQL and get the JSON output for that
//           product. Learn more about the{" "}
//           <s-link
//             href="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
//             target="_blank"
//           >
//             productCreate
//           </s-link>{" "}
//           mutation in our API references.
//         </s-paragraph>
//         <s-stack direction="inline" gap="base">
//           <s-button
//             onClick={generateProduct}
//             {...(isLoading ? { loading: true } : {})}
//           >
//             Generate a product
//           </s-button>
//           {fetcher.data?.product && (
//             <s-button
//               onClick={() => {
//                 shopify.intents.invoke?.("edit:shopify/Product", {
//                   value: fetcher.data?.product?.id,
//                 });
//               }}
//               target="_blank"
//               variant="tertiary"
//             >
//               Edit product
//             </s-button>
//           )}
//         </s-stack>
//         {fetcher.data?.product && (
//           <s-section heading="productCreate mutation">
//             <s-stack direction="block" gap="base">
//               <s-box
//                 padding="base"
//                 borderWidth="base"
//                 borderRadius="base"
//                 background="subdued"
//               >
//                 <pre style={{ margin: 0 }}>
//                   <code>{JSON.stringify(fetcher.data.product, null, 2)}</code>
//                 </pre>
//               </s-box>

//               <s-heading>productVariantsBulkUpdate mutation</s-heading>
//               <s-box
//                 padding="base"
//                 borderWidth="base"
//                 borderRadius="base"
//                 background="subdued"
//               >
//                 <pre style={{ margin: 0 }}>
//                   <code>{JSON.stringify(fetcher.data.variant, null, 2)}</code>
//                 </pre>
//               </s-box>
//             </s-stack>
//           </s-section>
//         )}
//       </s-section>

//       <s-section slot="aside" heading="App template specs">
//         <s-paragraph>
//           <s-text>Framework: </s-text>
//           <s-link href="https://reactrouter.com/" target="_blank">
//             React Router
//           </s-link>
//         </s-paragraph>
//         <s-paragraph>
//           <s-text>Interface: </s-text>
//           <s-link
//             href="https://shopify.dev/docs/api/app-home/using-polaris-components"
//             target="_blank"
//           >
//             Polaris web components
//           </s-link>
//         </s-paragraph>
//         <s-paragraph>
//           <s-text>API: </s-text>
//           <s-link
//             href="https://shopify.dev/docs/api/admin-graphql"
//             target="_blank"
//           >
//             GraphQL
//           </s-link>
//         </s-paragraph>
//         <s-paragraph>
//           <s-text>Database: </s-text>
//           <s-link href="https://www.prisma.io/" target="_blank">
//             Prisma
//           </s-link>
//         </s-paragraph>
//       </s-section>

//       <s-section slot="aside" heading="Next steps">
//         <s-unordered-list>
//           <s-list-item>
//             Build an{" "}
//             <s-link
//               href="https://shopify.dev/docs/apps/getting-started/build-app-example"
//               target="_blank"
//             >
//               example app
//             </s-link>
//           </s-list-item>
//           <s-list-item>
//             Explore Shopify&apos;s API with{" "}
//             <s-link
//               href="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
//               target="_blank"
//             >
//               GraphiQL
//             </s-link>
//           </s-list-item>
//         </s-unordered-list>
//       </s-section>
//     </s-page>
//   );
// }

// export const headers = (headersArgs) => {
//   return boundary.headers(headersArgs);
// };
