// app/api/n8n/trigger/route.ts

import { NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Path unik dari N8N (tanpa -test)
const N8N_WEBHOOK_PATH = "/webhook/auraragsuii";

export async function POST(request: NextRequest) {
  try {
    const webhookBaseUrl = process.env.N8N_WEBHOOK_BASE_URL;

    if (!webhookBaseUrl) {
      return NextResponse.json(
        { error: "N8N_WEBHOOK_BASE_URL is not configured in .env.local" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const webhookUrl = `${webhookBaseUrl}${N8N_WEBHOOK_PATH}`;
    console.log(`📤 Forwarding POST request to: ${webhookUrl}`);
    console.log(`📦 Request body:`, JSON.stringify(body).substring(0, 200));

    // Timeout 60 detik untuk mencegah hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    let response: Response;
    try {
      response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        console.error("⏱️ Request timeout after 60 seconds");
        return NextResponse.json(
          { error: "Request timeout. N8N workflow took too long to respond." },
          { status: 504 }
        );
      }
      throw fetchError;
    }

    console.log(`N8N response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No response body from N8N");
      console.error(`N8N Webhook error (${response.status}):`, errorText);

      return NextResponse.json(
        {
          error: errorText,
          n8nError: true,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // ⬇️ Handle berbagai format response N8N
    // PENTING: Body hanya bisa dibaca sekali, jadi kita baca sebagai text dulu
    const contentType = response.headers.get("content-type") || "";
    let parsed: any = null;
    let rawText = "";

    try {
      // Baca sebagai text dulu (bisa handle semua format)
      rawText = await response.text();
      console.log("N8N raw response (first 500 chars):", rawText.substring(0, 500));
      
      // Coba parse sebagai JSON jika mungkin
      if (rawText.trim()) {
        try {
          parsed = JSON.parse(rawText);
          console.log("N8N JSON response structure:", JSON.stringify(parsed).substring(0, 500));
        } catch (parseError) {
          // Bukan JSON, biarkan sebagai text
          console.log("N8N response is plain text, not JSON");
        }
      }
    } catch (readError) {
      console.error("Error reading response body:", readError);
      rawText = "Unable to read response body";
    }

    // Extract text dari berbagai format N8N response
    let extractedText = "";
    
    if (parsed) {
      // Format 1: Array of items (format standar n8n)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstItem = parsed[0];
        // Cek berbagai kemungkinan field
        extractedText = 
          firstItem.json?.output ||
          firstItem.json?.text ||
          firstItem.json?.message ||
          firstItem.json?.response ||
          firstItem.json?.data ||
          firstItem.output ||
          firstItem.text ||
          firstItem.message ||
          firstItem.response ||
          firstItem.data ||
          JSON.stringify(firstItem);
      }
      // Format 2: Object dengan field langsung
      else if (typeof parsed === "object") {
        extractedText = 
          parsed.output ||
          parsed.text ||
          parsed.message ||
          parsed.response ||
          parsed.data ||
          parsed.result ||
          (parsed.json && (parsed.json.output || parsed.json.text || parsed.json.message)) ||
          JSON.stringify(parsed);
      }
      // Format 3: String langsung
      else if (typeof parsed === "string") {
        extractedText = parsed;
      }
    } else if (rawText) {
      extractedText = rawText;
    }

    // Fallback jika masih kosong
    if (!extractedText && parsed) {
      extractedText = JSON.stringify(parsed);
    }

    // Jika masih kosong, gunakan raw text atau fallback message
    if (!extractedText || extractedText.trim() === "") {
      if (rawText && rawText.trim()) {
        extractedText = rawText;
      } else {
        extractedText = "N8N mengembalikan response kosong. Cek workflow N8N.";
        console.warn("⚠️ N8N returned empty response");
      }
    }

    console.log("✅ Extracted text from N8N:", extractedText.substring(0, 200));

    // Return dengan format yang konsisten
    return NextResponse.json({
      success: true,
      data: {
        text: extractedText,
        raw: parsed || rawText,
      },
    });

  } catch (error) {
    console.error("❌ Error triggering N8N webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Berikan error message yang lebih informatif
    let userFriendlyError = "Internal server error during forward process";
    if (errorMessage.includes("Body has already been read")) {
      userFriendlyError = "Error membaca response dari N8N. Response mungkin kosong atau tidak valid.";
    } else if (errorMessage.includes("timeout")) {
      userFriendlyError = "Request ke N8N timeout. Workflow mungkin terlalu lama.";
    }
    
    return NextResponse.json(
      {
        error: userFriendlyError,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
