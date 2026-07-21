import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const params = await searchParams;
  return <LoginForm serverError={params.error || ""} serverInfo={params.info || ""} />;
}
