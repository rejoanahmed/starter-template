import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          className="text-red-600 hover:underline mb-8 inline-block"
          search={{ redirectUri: "/" }}
          to="/login"
        >
          ← Back to login
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and using Spotfinder, you accept and agree to be
              bound by the terms and provision of this agreement. If you do not
              agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Use License
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily use Spotfinder for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose</li>
              <li>attempt to reverse engineer any software</li>
              <li>remove any copyright or other proprietary notations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. User Accounts
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your
              account and password. You agree to accept responsibility for all
              activities that occur under your account or password.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Prohibited Uses
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may not use Spotfinder:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>In any way that violates any applicable law or regulation</li>
              <li>
                To transmit any material that is defamatory, offensive, or
                otherwise objectionable
              </li>
              <li>To impersonate or attempt to impersonate another user</li>
              <li>
                To engage in any automated use of the system without permission
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In no event shall Spotfinder or its suppliers be liable for any
              damages arising out of the use or inability to use Spotfinder,
              even if Spotfinder has been notified of the possibility of such
              damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us at{" "}
              <a
                className="text-red-600 hover:underline"
                href="mailto:legal@spotfinder.com"
              >
                legal@spotfinder.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
