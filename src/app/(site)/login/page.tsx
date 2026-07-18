import { getRecaptchaConfig } from "@/lib/recaptcha";
import LoginForm from "./LoginForm";

export const metadata = { title: "Masuk" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  return <LoginForm rc={await getRecaptchaConfig()} />;
}
