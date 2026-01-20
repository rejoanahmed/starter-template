import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/payments-terms")({
  component: PaymentsTermsPage,
});

function PaymentsTermsPage() {
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
          Payments Terms of Service
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Payment Processing
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Spotfinder uses secure third-party payment processors to handle
              all transactions. By making a payment through Spotfinder, you
              agree to the terms and conditions of our payment processors.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Payment Methods
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We accept various payment methods including credit cards, debit
              cards, and digital wallets. All payments must be made in the
              currency specified at the time of booking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Pricing and Fees
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All prices are displayed in the local currency and include
              applicable taxes. Spotfinder may charge service fees for
              processing bookings, which will be clearly displayed before you
              complete your payment.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Refunds and Cancellations
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refund policies vary by property and are set by individual hosts.
              Please review the cancellation policy for each booking before
              confirming your reservation. Refunds, when applicable, will be
              processed to the original payment method within 5-10 business
              days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Currency Conversion
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you pay in a currency different from your payment method's
              currency, your bank may charge currency conversion fees.
              Spotfinder is not responsible for these fees.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Disputes and Chargebacks
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have a dispute regarding a charge, please contact us
              directly before initiating a chargeback. We will work with you to
              resolve any issues. Unauthorized chargebacks may result in account
              suspension.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              For payment-related questions, please contact us at{" "}
              <a
                className="text-red-600 hover:underline"
                href="mailto:payments@spotfinder.com"
              >
                payments@spotfinder.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
