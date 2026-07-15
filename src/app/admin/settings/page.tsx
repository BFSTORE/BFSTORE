import { getSettings } from "@/lib/settings";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return <SettingsClient initial={settings} />;
}
