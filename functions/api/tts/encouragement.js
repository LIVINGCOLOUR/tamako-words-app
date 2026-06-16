const MODEL_ID = "eleven_multilingual_v2";

const ALLOWED_MESSAGES = Object.freeze({
  finish: Object.freeze([
    "きょうもできたね",
    "よくがんばったね",
    "さいごまでできたね",
    "またやろうね",
    "いいちょうしだね",
    "すごいね",
    "えらかったね",
    "ひとつずつできてるよ",
    "つづけていてすごいね",
    "きょうもありがとう",
  ]),
  reviewComplete: Object.freeze([
    "ふくしゅうできたね",
    "よくおぼえていたね",
    "もういちどできてすごいね",
    "だいじょうぶ、できてるよ",
    "またいっしょにやろうね",
  ]),
});

function corsHeaders(request) {
  const headers = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  const origin = request.headers.get("Origin");
  if (origin && origin === new URL(request.url).origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function jsonResponse(request, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function isAllowedMessage(type, text) {
  const messages = ALLOWED_MESSAGES[type];
  return Array.isArray(messages) && messages.includes(text);
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function onRequestPost({ request, env = {} }) {
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonResponse(request, 400, { error: "invalid_json" });
  }

  const type = typeof payload.type === "string" ? payload.type : "";
  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (!isAllowedMessage(type, text)) {
    return jsonResponse(request, 400, { error: "unsupported_encouragement" });
  }

  const apiKey = typeof env.ELEVENLABS_API_KEY === "string" ? env.ELEVENLABS_API_KEY.trim() : "";
  const voiceId = typeof env.ELEVENLABS_VOICE_ID === "string" ? env.ELEVENLABS_VOICE_ID.trim() : "";
  if (!apiKey || !voiceId) {
    return jsonResponse(request, 503, { error: "tts_not_configured" });
  }

  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;
  let ttsResponse;
  try {
    ttsResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
      }),
    });
  } catch (error) {
    return jsonResponse(request, 502, { error: "tts_request_failed" });
  }

  if (!ttsResponse.ok) {
    return jsonResponse(request, 502, { error: "tts_failed" });
  }

  const audio = await ttsResponse.arrayBuffer();
  if (!audio.byteLength) {
    return jsonResponse(request, 502, { error: "empty_audio" });
  }

  return new Response(audio, {
    status: 200,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
