import { Redis } from "@upstash/redis";

// รองรับชื่อ env ทั้งแบบ Vercel Marketplace (KV_*) และแบบ Upstash ตรง (UPSTASH_*)
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;

function parse(v) {
  if (typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const trip = String(req.query.trip || "default");
  if (!ID_RE.test(trip)) return res.status(400).json({ error: "trip id ไม่ถูกต้อง" });
  const key = `votes:${trip}`;

  try {
    if (req.method === "GET") {
      const all = (await redis.hgetall(key)) || {};
      const votes = Object.values(all).map(parse).filter(Boolean);
      return res.status(200).json({ votes });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const name = String(body.name || "").trim().slice(0, 30);
      const picks = Array.isArray(body.picks) ? [...new Set(body.picks)] : [];

      if (!name) return res.status(400).json({ error: "ใส่ชื่อเล่นก่อนส่งโหวต" });
      if (picks.length > 20 || !picks.every((p) => typeof p === "string" && ID_RE.test(p))) {
        return res.status(400).json({ error: "ตัวเลือกไม่ถูกต้อง" });
      }

      const field = name.toLowerCase();
      if (picks.length === 0) {
        await redis.hdel(key, field);
      } else {
        await redis.hset(key, { [field]: JSON.stringify({ name, picks, at: Date.now() }) });
      }
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "เชื่อมต่อฐานข้อมูลไม่ได้ เช็คการตั้งค่า Upstash ใน Vercel" });
  }
}
