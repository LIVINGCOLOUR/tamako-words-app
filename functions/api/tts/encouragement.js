const MODEL_ID = "eleven_multilingual_v2";
const VOICE_SETTINGS = Object.freeze({
  stability: 0.35,
  similarity_boost: 0.75,
  style: 0.35,
  use_speaker_boost: true,
});

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

function messageIndex(type, text) {
  const messages = ALLOWED_MESSAGES[type];
  return Array.isArray(messages) ? messages.indexOf(text) : -1;
}

function logTts(event, data) {
  console.info("[tamako-tts]", event, data);
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function onRequestPost({ request, env = {} }) {
  const requestId = crypto.randomUUID();
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    logTts("invalid_json", { requestId });
    return jsonResponse(request, 400, { error: "invalid_json" });
  }

  const type = typeof payload.type === "string" ? payload.type : "";
  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  const index = messageIndex(type, text);
  const allowed = index >= 0;
  logTts("request", { requestId, type, allowed, messageIndex: allowed ? index + 1 : null });
  if (!isAllowedMessage(type, text)) {
    return jsonResponse(request, 400, { error: "unsupported_encouragement" });
  }

  const apiKey = typeof env.ELEVENLABS_API_KEY === "string" ? env.ELEVENLABS_API_KEY.trim() : "";
  const voiceId = typeof env.ELEVENLABS_VOICE_ID === "string" ? env.ELEVENLABS_VOICE_ID.trim() : "";
  if (!apiKey || !voiceId) {
    logTts("config_missing", { requestId, hasApiKey: !!apiKey, hasVoiceId: !!voiceId });
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
        voice_settings: VOICE_SETTINGS,
      }),
    });
  } catch (error) {
    logTts("elevenlabs_request_error", { requestId, errorName: error && error.name ? error.name : "Error" });
    return jsonResponse(request, 502, { error: "tts_request_failed" });
  }

  const contentType = ttsResponse.headers.get("content-type") || "";
  logTts("elevenlabs_response", { requestId, status: ttsResponse.status, contentType });
  if (!ttsResponse.ok) {
    return jsonResponse(request, 502, { error: "tts_failed" });
  }

  if (!contentType.includes("audio/")) {
    return jsonResponse(request, 502, { error: "tts_bad_content_type" });
  }

  const audio = await ttsResponse.arrayBuffer();
  if (!audio.byteLength) {
    logTts("empty_audio", { requestId, contentType });
    return jsonResponse(request, 502, { error: "empty_audio" });
  }
  logTts("audio_ready", { requestId, contentType, byteLength: audio.byteLength });

  return new Response(audio, {
    status: 200,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
