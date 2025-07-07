import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen w-full bg-neutral-100 py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              This Privacy Policy explains how we collect, use, process, and protect your personal data in accordance with the General Data Protection Regulation (GDPR) and Irish Data Protection Law. This policy applies to all users of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Data Controller Information</h2>
            <p>
              We are [Your Company Name], registered in Ireland. For any privacy-related queries, you can contact our Data Protection Officer at:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Email: dpo@example.com</li>
              <li>Address: [Your Irish Business Address]</li>
              <li>Phone: [Your Contact Number]</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Personal Data We Collect</h2>
            <p>We collect and process the following personal data:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Identity Data (name, username)</li>
              <li>Contact Data (email address)</li>
              <li>Technical Data (IP address, browser type, device information)</li>
              <li>Usage Data (how you use our website)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Legal Basis for Processing</h2>
            <p>We process your personal data under the following legal bases:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Consent: When you explicitly agree to the processing of your personal data</li>
              <li>Contract: When processing is necessary for the performance of a contract with you</li>
              <li>Legal Obligation: When processing is necessary for compliance with legal obligations</li>
              <li>Legitimate Interests: When processing is necessary for our legitimate interests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights Under GDPR</h2>
            <p>Under GDPR, you have the following rights:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate personal data</li>
              <li>Right to erasure (&apos;right to be forgotten&apos;)</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p>
              We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. International Transfers</h2>
            <p>
              When we transfer your personal data outside the European Economic Area (EEA), we ensure similar protection and appropriate safeguards through the use of standard contractual clauses approved by the European Commission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top of this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Email: privacy@example.com</li>
              <li>Phone: [Your Contact Number]</li>
              <li>Post: [Your Irish Business Address]</li>
            </ul>
            <p className="mt-4">
              You have the right to make a complaint at any time to the Data Protection Commission (DPC), the Irish supervisory authority for data protection issues (www.dataprotection.ie).
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
} 