export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1A1816] p-8">
      <div className="max-w-2xl mx-auto text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-4">
        <h1 className="text-xl font-heading font-semibold text-[var(--color-text-primary)] mb-6">Privacy Policy</h1>
        <p>Last updated: July 21, 2026</p>
        <p>Lightmeter ("we", "our", or "us") operates the website and services at lightmeter.tech. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.</p>
        <h2 className="text-base font-heading font-semibold text-[var(--color-text-primary)] mt-6">Information We Collect</h2>
        <p>We collect information you provide directly: name, email address, and photography business details when you create an account. When you connect Gmail, we access email subject lines and body text to provide AI reply drafting services. We do not store your emails permanently on our servers.</p>
        <h2 className="text-base font-heading font-semibold text-[var(--color-text-primary)] mt-6">How We Use Information</h2>
        <p>We use your information to provide and improve our AI-powered CRM services, process payments via Stripe, and communicate with you about your account.</p>
        <h2 className="text-base font-heading font-semibold text-[var(--color-text-primary)] mt-6">Data Security</h2>
        <p>We use industry-standard encryption and secure infrastructure. Payment processing is handled by Stripe. Email data is processed in transit and not permanently stored.</p>
        <h2 className="text-base font-heading font-semibold text-[var(--color-text-primary)] mt-6">Contact</h2>
        <p>For questions about this policy, contact us at jiayongchun001@gmail.com.</p>
      </div>
    </div>
  );
}
