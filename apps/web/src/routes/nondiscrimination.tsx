import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/nondiscrimination")({
  component: NondiscriminationPage,
});

function NondiscriminationPage() {
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
          Nondiscrimination Policy
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Our Commitment
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Spotfinder is committed to fostering an inclusive community where
              everyone feels welcome. We prohibit discrimination based on race,
              color, religion, sex, sexual orientation, gender identity,
              national origin, age, disability, marital status, or any other
              protected characteristic.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Host Responsibilities
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Hosts agree to treat all guests equally, regardless of:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Race, ethnicity, or national origin</li>
              <li>Religion or religious beliefs</li>
              <li>Sex, gender identity, or sexual orientation</li>
              <li>Age or disability status</li>
              <li>Marital or family status</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Hosts may not decline a booking based on any of these
              characteristics or impose different terms or conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Guest Responsibilities
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Guests are expected to treat hosts and other community members
              with respect and dignity, regardless of their background or
              identity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Reporting Discrimination
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you experience or witness discrimination on our platform,
              please report it immediately. We take all reports seriously and
              will investigate promptly. Reports can be made through:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Our in-app reporting feature</li>
              <li>
                Email:{" "}
                <a
                  className="text-red-600 hover:underline"
                  href="mailto:discrimination@spotfinder.com"
                >
                  discrimination@spotfinder.com
                </a>
              </li>
              <li>Our support center</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Enforcement
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Violations of this policy may result in immediate account
              suspension or termination. We reserve the right to remove listings
              or users who violate our nondiscrimination policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Legal Compliance
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This policy complies with applicable local, state, and federal
              laws regarding nondiscrimination. In jurisdictions where
              additional protections exist, we will comply with those
              requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about this policy, please contact us at{" "}
              <a
                className="text-red-600 hover:underline"
                href="mailto:discrimination@spotfinder.com"
              >
                discrimination@spotfinder.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
