import { getRecaptchaSiteKey } from "@/lib/recaptcha";
import ForgotForm from "./ForgotForm";

export const metadata = { title: "Lupa Kata Sandi" };
export const dynamic = "force-dynamic";

export default async function LupaPasswordPage() {
  return <ForgotForm siteKey={await getRecaptchaSiteKey()} />;
}
