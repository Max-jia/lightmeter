import { SignupForm } from "./signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; plan?: string }>;
}) {
  const params = await searchParams;
  return (
    <SignupForm
      serverError={params.error || ""}
      selectedPlan={(params.plan as "standard" | "pro") || "standard"}
    />
  );
}
