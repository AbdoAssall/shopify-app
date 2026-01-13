import { authenticate } from "../shopify.server";
import db from "../db.server";
import fs from "fs/promises"; // Import file system module
import path from "path";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  const headers = {
    "Content-Type": "text/css",
    "Access-Control-Allow-Origin": "*", // Allow CORS requests from the storefront
    // Tip: Disable cache during development to see changes immediately. 
    // Change to "public, max-age=3600" in production.
    "Cache-Control": "no-store", 
  };

  // Validate shop parameter
  if (!shop) return new Response("/* No shop provided */", { headers });

  // 1. Database Check (Security Layer)
  // Verify if the shop has an active session (installed app)
  const session = await db.session.findFirst({ where: { shop } });
  
  if (!session) {
    console.log(`[CSS Protection] Access denied for shop: ${shop}`);
    return new Response("/* Access Denied - App not installed */", { headers });
  }

  // 2. Read the actual CSS file from the project directory
  try {
    // Define file path: assumes 'protected.css' is inside 'app/styles/' folder
    const filePath = path.join(process.cwd(), "app", "styles", "protected.css");
    
    // Read file content as UTF-8 string
    const cssContent = await fs.readFile(filePath, "utf-8");

    // 3. Send the content to the browser
    return new Response(cssContent, { headers });

  } catch (error) {
    console.error("Error reading CSS file:", error);
    // Return a 500 error if the file is missing or unreadable
    return new Response("/* Server Error: CSS file not found */", { status: 500, headers });
  }
};