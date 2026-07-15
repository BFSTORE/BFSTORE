import { db } from "./db";

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.setting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function saveSettings(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
}
