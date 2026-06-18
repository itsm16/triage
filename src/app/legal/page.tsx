import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export default function LegalPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-20">

      <section id="privacy" className="mb-20 scroll-mt-24">
        <h2 className="mb-6 text-3xl font-semibold">
          Privacy Policy
        </h2>

        <Accordion type="single" collapsible>
          <AccordionItem value="information">
            <AccordionTrigger>
              Information We Collect
            </AccordionTrigger>
            <AccordionContent>
              We collect account information such as your name and email
              address. If you connect Gmail or Google Calendar, we process
              the information you explicitly authorize.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="usage">
            <AccordionTrigger>
              How We Use Information
            </AccordionTrigger>
            <AccordionContent>
              Information is used to provide email management, calendar
              integrations, AI summaries, drafting assistance, search,
              and context management features.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ai">
            <AccordionTrigger>
              AI Processing
            </AccordionTrigger>
            <AccordionContent>
              Authorized data may be processed by AI models to generate
              summaries, drafts, search results, and contextual insights.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="google">
            <AccordionTrigger>
              Google Workspace API Data
            </AccordionTrigger>
            <AccordionContent>
              Google Workspace API data is only accessed after explicit
              authorization and is used solely to provide requested
              functionality. Triage does not use Google Workspace API
              data to develop, improve, or train generalized AI or
              machine learning models.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sharing">
            <AccordionTrigger>
              Data Sharing
            </AccordionTrigger>
            <AccordionContent>
              We do not sell personal information. Data is shared only
              with providers necessary to operate the service.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="deletion">
            <AccordionTrigger>
              Data Retention & Deletion
            </AccordionTrigger>
            <AccordionContent>
              Users may disconnect integrations or request account
              deletion. Associated stored data will be removed in
              accordance with our retention practices.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section id="terms" className="scroll-mt-24">
        <h2 className="mb-6 text-3xl font-semibold">
          Terms of Service
        </h2>

        <Accordion type="single" collapsible>
          <AccordionItem value="acceptance">
            <AccordionTrigger>
              Acceptance of Terms
            </AccordionTrigger>
            <AccordionContent>
              By using Triage, you agree to these Terms of Service.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="accounts">
            <AccordionTrigger>
              Accounts
            </AccordionTrigger>
            <AccordionContent>
              You are responsible for maintaining the security of your
              account and connected services.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="responsibility">
            <AccordionTrigger>
              User Responsibilities
            </AccordionTrigger>
            <AccordionContent>
              Users are responsible for reviewing and approving
              AI-generated content before sending or publishing it.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="third-party">
            <AccordionTrigger>
              Third-Party Services
            </AccordionTrigger>
            <AccordionContent>
              Triage integrates with Google and other third-party
              providers whose terms may also apply.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="acceptable-use">
            <AccordionTrigger>
              Acceptable Use
            </AccordionTrigger>
            <AccordionContent>
              You may not use the service for unlawful activities,
              abuse, spam, or security violations.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="availability">
            <AccordionTrigger>
              Service Availability
            </AccordionTrigger>
            <AccordionContent>
              The service may be modified, updated, suspended, or
              discontinued at any time.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="liability">
            <AccordionTrigger>
              Limitation of Liability
            </AccordionTrigger>
            <AccordionContent>
              The service is provided &quot;as is&quot; without warranties of any
              kind.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}