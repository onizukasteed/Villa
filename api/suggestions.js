import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;
const MAX_ITEMS = 100;

function parse(v) {
  if (typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const trip = String(req.query.trip || "default");
  if (!ID_RE.test(trip)) return res.status(400).json({ error: "trip id ไม่ถูกต้อง" });
  const key = `suggestions:${trip}`;

  try {
    if (req.method === "GET") {
      const items = ((await redis.lrange(key, 0, -1)) || []).map(parse).filter(Boolean);
      return res.status(200).json({ suggestions: items });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const name = String(body.name || "").trim().slice(0, 30);
      const text = String(body.text || "").trim().slice(0, 500);
      const note = String(body.note || "").trim().slice(0, 300);

      if (!name) return res.status(400).json({ error: "ใส่ชื่อเล่นก่อนส่ง" });
      if (!text) return res.status(400).json({ error: "ใส่ชื่อบ้านหรือลิงก์ก่อนส่ง" });
      if ((await redis.llen(key)) >= MAX_ITEMS) {
        return res.status(400).json({ error: "รายการแนะนำเต็มแล้ว" });
      }

      await redis.rpush(key, JSON.stringify({ name, text, note, at: Date.now() }));
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "เชื่อมต่อฐานข้อมูลไม่ได้ เช็คการตั้งค่า Upstash ใน Vercel" });
  }
}
