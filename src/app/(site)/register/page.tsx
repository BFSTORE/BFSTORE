import { getRecaptchaSiteKey } from "@/lib/recaptcha";
import RegisterForm from "./RegisterForm";

export const metadata = { title: "Daftar" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  return <RegisterForm siteKey={await getRecaptchaSiteKey()} />;
}
