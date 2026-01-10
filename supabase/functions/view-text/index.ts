import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response("Missing id parameter", { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("text_messages")
      .select("content, created_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return new Response("Message not found", { status: 404, headers: corsHeaders });
    }

    const date = new Date(data.created_at).toLocaleString();
    
    // Return HTML page that displays the text content nicely
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shared Message</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-width: 800px;
      width: 100%;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 24px 32px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.8;
    }
    .content {
      padding: 32px;
    }
    .message {
      font-size: 18px;
      line-height: 1.8;
      color: #333;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .footer {
      border-top: 1px solid #eee;
      padding: 16px 32px;
      text-align: center;
      color: #888;
      font-size: 12px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📄 Shared Message</h1>
      <p>Created: ${date}</p>
    </div>
    <div class="content">
      <div class="message">${escapeHtml(data.content)}</div>
    </div>
    <div class="footer">
      Shared via QR Share
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: new Headers({
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      }),
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal server error", { status: 500, headers: corsHeaders });
  }
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
}
