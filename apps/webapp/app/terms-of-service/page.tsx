import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen w-full bg-neutral-100 py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website and services. By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
            <p>In these Terms:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>&quot;Service&quot; refers to our website and all services provided</li>
              <li>&quot;User&quot;, &quot;you&quot;, and &quot;your&quot; refers to individuals accessing our Service</li>
              <li>&quot;We&quot;, &quot;us&quot;, and &quot;our&quot; refers to [Your Company Name]</li>
              <li>&quot;Content&quot; refers to text, images, videos, software, and other materials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Registration and Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your account credentials and for any activities under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Protection and Privacy</h2>
            <p>
              Our processing of personal data is governed by our Privacy Policy and complies with:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>The General Data Protection Regulation (GDPR)</li>
              <li>The Data Protection Act 2018</li>
              <li>Irish Data Protection Law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property Rights</h2>
            <p>
              The Service and its original content, features, and functionality are owned by [Your Company Name] and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. User Content</h2>
            <p>
              By submitting content to our Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute it in any media format.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Transmit any harmful or malicious code</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with the proper working of the Service</li>
              <li>Attempt to bypass any security measures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Ireland. Any disputes relating to these Terms shall be subject to the exclusive jurisdiction of the courts of Ireland.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Email: legal@example.com</li>
              <li>Phone: [Your Contact Number]</li>
              <li>Address: [Your Irish Business Address]</li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  )
} 