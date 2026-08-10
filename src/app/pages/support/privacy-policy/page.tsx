"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Bullet = { label?: string; text: string };

type Section = {
  id: string;
  title: string;
  intro?: string;
  bullets?: Bullet[];
  outro?: string;
  note?: string;
  boldNote?: string;
  contact?: { name: string; email: string; emailNote?: string; address?: string };
};

const sections: Section[] = [
  {
    id: "2.1",
    title: "Introduction & Scope",
    intro:
      'This Privacy Policy explains how AJ Empire The Nails Boss Enterprise ("AJ Empire", "we", "us", "our") collects, uses, discloses, stores, and protects the personal data of our customers, website visitors, account holders, and other individuals ("you", "your") who interact with us via the Platform at ajempire.shop and any related channels (email, social media, phone, in-store events). This Policy is issued in accordance with the Nigeria Data Protection Act, 2023 (NDPA), the Nigeria Data Protection Regulation (NDPR) 2019 and subsequent guidance notes from the Nigeria Data Protection Commission (NDPC), as well as international best practice including the General Data Protection Regulation (GDPR) standards where applicable to cross-border processing.',
  },
  {
    id: "2.2",
    title: "Data Controller Identity",
    intro:
      "AJ Empire The Nails Boss Enterprise (RC 7304363), of Nut Road, after the first MTN Mast, Abraka, Delta State, Nigeria, is the Data Controller for the purposes of the NDPA in respect of personal data collected through the Platform.",
    contact: {
      name: "Data Protection Officer (DPO)",
      email: "ajempirenaija@gmail.com",
      emailNote: 'Subject line: "Data Protection Enquiry"',
    },
  },
  {
    id: "2.3",
    title: "Personal Data We Collect",
    intro: "We collect the following categories of personal data:",
    bullets: [
      { label: "Identity Data", text: "Full name, gender, date of birth (optional), profile picture." },
      { label: "Contact Data", text: "Delivery and billing addresses, phone number(s), email address." },
      { label: "Financial Data", text: "Payment method details (handled by PCI-DSS compliant gateways; we receive only transaction tokens and last four digits of cards), bank reference for refunds." },
      { label: "Transactional Data", text: "Orders placed, products purchased, refunds processed, complaints filed, communications with customer service." },
      { label: "Technical Data", text: "IP address, browser type and version, device identifiers, operating system, time zone, referrer URL, pages visited." },
      { label: "Profile Data", text: "Username, password (hashed), preferences, wishlist, saved addresses." },
      { label: "Marketing & Communications Data", text: "Your preferences in receiving marketing from us and our partners, and your communication preferences." },
      { label: "Usage Data", text: "Information about how you use our Platform, including click-stream data and product interactions." },
      { label: "Sensitive Data", text: 'We do not intentionally collect "sensitive personal data" as defined under NDPA. Where a customer voluntarily discloses skin sensitivities or allergies in connection with a cosmetic Order, such data is processed strictly for fulfilling that Order with explicit consent.' },
    ],
  },
  {
    id: "2.4",
    title: "How We Collect Data",
    intro: "We collect personal data through:",
    bullets: [
      { label: "Direct interactions", text: "when you create an Account, place an Order, subscribe to our newsletter, contact customer service, leave a review, or participate in promotions;" },
      { label: "Automated technologies", text: "cookies, web beacons, server logs and similar technologies (see Cookie Policy);" },
      { label: "Third parties", text: "payment processors, logistics partners, identity-verification providers, social media platforms (where you log in using social credentials), analytics providers, and publicly available sources." },
    ],
  },
  {
    id: "2.5",
    title: "Lawful Bases for Processing (NDPA Section 25)",
    intro: "We process personal data only where one or more of the following lawful bases applies:",
    bullets: [
      { label: "Consent", text: "where you have given clear, specific, informed and freely given consent (e.g., marketing emails);" },
      { label: "Contract Performance", text: "where processing is necessary to perform a contract with you (e.g., fulfilling an Order);" },
      { label: "Legal Obligation", text: "where processing is required to comply with Nigerian law (e.g., tax records under FIRS, anti-money-laundering checks);" },
      { label: "Legitimate Interests", text: "where processing is necessary for our legitimate business interests (e.g., fraud prevention, network security, internal analytics), and not overridden by your rights;" },
      { label: "Vital Interests", text: "in rare cases, to protect a person's life;" },
      { label: "Public Interest", text: "where required for the performance of a task in the public interest." },
    ],
  },
  {
    id: "2.6",
    title: "Purposes of Processing",
    bullets: [
      { text: "to register and manage your Account;" },
      { text: "to process Orders, payments, deliveries, returns and refunds;" },
      { text: "to provide customer service and respond to enquiries;" },
      { text: "to personalise your shopping experience and recommend Products;" },
      { text: "to send transactional communications (Order confirmation, dispatch alerts);" },
      { text: "to send marketing communications where you have consented or where permitted by legitimate interest under Nigerian law;" },
      { text: "to detect, prevent and address fraud, abuse, security incidents and other harmful activity;" },
      { text: "to conduct analytics, research and business development;" },
      { text: "to comply with legal obligations and respond to lawful requests from public authorities;" },
      { text: "to enforce our Terms and other policies." },
    ],
  },
  {
    id: "2.7",
    title: "Cookies & Tracking Technologies",
    intro:
      "We and our partners use cookies and similar technologies as described in our Cookie Policy. By using the Platform, you consent to such use, subject to your right to withdraw consent at any time via your browser settings or our cookie banner.",
  },
  {
    id: "2.8",
    title: "Data Sharing & Disclosure",
    intro: "We share personal data only with the following categories of recipients, and only to the extent strictly necessary:",
    bullets: [
      { label: "Payment processors", text: "Paystack, Flutterwave, banks and card networks (Verve, Visa, Mastercard);" },
      { label: "Logistics & delivery partners", text: "GIG Logistics, DHL, Red Star Express, local dispatch riders;" },
      { label: "Technology service providers", text: "hosting (cloud infrastructure), email delivery, SMS gateways, analytics (e.g., Google Analytics), customer support tools;" },
      { label: "Professional advisers", text: "lawyers, accountants, auditors, under strict confidentiality;" },
      { label: "Regulators and law enforcement", text: "where compelled by valid Nigerian legal process (e.g., FCCPC, EFCC, NPF, NDPC, courts);" },
      { label: "Successor entities", text: "in the event of a merger, acquisition, restructuring, or sale of business assets (subject to NDPA safeguards);" },
      { label: "Affiliates", text: "companies within the AJ Empire group, present or future." },
    ],
    boldNote: "We do not sell your personal data to third parties.",
  },
  {
    id: "2.9",
    title: "International Data Transfers",
    intro:
      "Some of our service providers may process personal data outside Nigeria. Such transfers occur only where (i) the receiving jurisdiction provides an adequate level of protection as recognised by the NDPC; (ii) appropriate safeguards such as standard contractual clauses or binding corporate rules are in place; or (iii) you have given your explicit consent after being informed of the possible risks (NDPA Section 41). As AJ Empire expands across Africa, cross-border transfers within AfCFTA member states will be governed by the AfCFTA Digital Trade Protocol and equivalent regional safeguards.",
  },
  {
    id: "2.10",
    title: "Data Retention",
    intro: "We retain personal data only for as long as necessary to fulfil the purposes for which it was collected, including any legal, accounting or reporting requirements. Indicative retention periods:",
    bullets: [
      { label: "Account data", text: "for the duration of your Account, and up to six (6) years after closure to satisfy tax and CAMA record-keeping obligations;" },
      { label: "Order and financial records", text: "at least six (6) years from the date of transaction;" },
      { label: "Marketing data", text: "until you withdraw consent or after two (2) years of inactivity, whichever is earlier;" },
      { label: "Customer service correspondence", text: "up to three (3) years;" },
      { label: "Technical logs", text: "up to twelve (12) months, except where required for security investigations." },
    ],
    outro: "At the end of the retention period, personal data is securely deleted or anonymised.",
  },
  {
    id: "2.11",
    title: "Data Security",
    intro: "We implement appropriate technical and organisational measures to protect personal data, including:",
    bullets: [
      { text: "SSL/TLS encryption in transit (HTTPS across the Platform);" },
      { text: "encryption at rest for sensitive databases;" },
      { text: "role-based access controls and least-privilege principles;" },
      { text: "PCI-DSS compliance for payment processing (via our gateways);" },
      { text: "regular security audits, vulnerability scans and penetration tests;" },
      { text: "staff training on data protection and confidentiality;" },
      { text: "secure password storage using industry-standard hashing." },
    ],
    note: "While we take reasonable measures, no system is completely secure. You are responsible for safeguarding your Account credentials.",
  },
  {
    id: "2.12",
    title: "Your Rights as a Data Subject (NDPA Section 34)",
    intro: "You have the following rights regarding your personal data:",
    bullets: [
      { label: "Right to information", text: "to be informed about how your data is processed;" },
      { label: "Right of access", text: "to obtain a copy of your personal data we hold;" },
      { label: "Right to rectification", text: "to correct inaccurate or incomplete data;" },
      { label: 'Right to erasure ("right to be forgotten")', text: "to request deletion, subject to legal retention obligations;" },
      { label: "Right to restriction", text: "to limit processing in certain circumstances;" },
      { label: "Right to data portability", text: "to receive your data in a structured, commonly used, machine-readable format;" },
      { label: "Right to object", text: "to processing based on legitimate interests or direct marketing;" },
      { label: "Right to withdraw consent", text: "at any time, without affecting prior lawful processing;" },
      { label: "Right not to be subject to a decision", text: "based solely on automated processing that significantly affects you;" },
      { label: "Right to lodge a complaint", text: "with the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng." },
    ],
    outro: "To exercise any right, contact our DPO at ajempirenaija@gmail.com. We will respond within thirty (30) days, in line with NDPA timelines.",
  },
  {
    id: "2.13",
    title: "Children's Privacy",
    intro:
      "The Platform is not directed at, and we do not knowingly collect personal data from, children under eighteen (18) years of age. Where data of a minor must be processed, we require verifiable consent from a parent or legal guardian, in line with NDPA Section 31. If you believe we have collected data from a minor inadvertently, please contact us immediately for deletion.",
  },
  {
    id: "2.14",
    title: "Marketing Communications & Opt-Out",
    intro: "We may send you marketing communications about new Products, promotions and brand news where you have opted in (or where permitted by law). You can opt out at any time by:",
    bullets: [
      { text: 'clicking the "unsubscribe" link in any marketing email;' },
      { text: "updating your communication preferences in your Account; or" },
      { text: 'emailing ajempirenaija@gmail.com with the subject "Unsubscribe".' },
    ],
    note: "Even after opting out of marketing, we may still send essential transactional communications (Order updates, security alerts).",
  },
  {
    id: "2.15",
    title: "Automated Decision-Making & Profiling",
    intro:
      "We may use limited automated decision-making for fraud detection and personalised product recommendations. These do not produce legal effects on you. You may request human review of any automated decision affecting you by contacting our DPO.",
  },
  {
    id: "2.16",
    title: "Data Breach Notification",
    intro: "In the event of a personal data breach likely to result in risk to your rights and freedoms, we will:",
    bullets: [
      { text: "notify the Nigeria Data Protection Commission (NDPC) within 72 hours of becoming aware, as required by NDPA;" },
      { text: "notify affected data subjects without undue delay where the breach is likely to result in high risk;" },
      { text: "provide clear information about the nature of the breach, likely consequences, and measures taken or proposed." },
    ],
  },
  {
    id: "2.17",
    title: "Changes to this Privacy Policy",
    intro:
      "We may update this Privacy Policy from time to time. Material changes will be notified by email or by prominent notice on the Platform at least seven (7) days before they take effect.",
  },
  {
    id: "2.18",
    title: "Contact",
    contact: {
      name: "AJ Empire The Nails Boss Enterprise — Data Protection Office",
      email: "ajempirenaija@gmail.com",
      emailNote: '(Subject: "Data Protection Enquiry")',
      address: "Nut Road, after the first MTN Mast, Abraka, Delta State, Nigeria",
    },
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-[family-name:var(--font-poppins)]">
      {/* Hero Banner */}
      <div className="bg-[#FF008C] px-4 lg:px-16 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/pages/support"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Support
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="text-white/80 mt-2 text-sm">
            Effective Date: 1 July 2026 &nbsp;|&nbsp; Last Updated: 1 July 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12 space-y-6">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8"
          >
            {/* Section header */}
            <div className="flex items-start gap-3 mb-4">
              <span className="bg-[#FF008C] text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                {section.id}
              </span>
              <h2 className="text-base lg:text-lg font-semibold text-[#292929] leading-snug">
                {section.title}
              </h2>
            </div>

            <div className="text-sm lg:text-base text-gray-600 leading-relaxed space-y-3 lg:pl-10">
              {/* Intro paragraph */}
              {section.intro && <p>{section.intro}</p>}

              {/* Bullet list */}
              {section.bullets && (
                <ul className="space-y-2">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#FF008C] mt-1 shrink-0">•</span>
                      <span>
                        {b.label && (
                          <span className="font-semibold text-[#292929]">
                            {b.label}:{" "}
                          </span>
                        )}
                        {b.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Outro paragraph */}
              {section.outro && <p>{section.outro}</p>}

              {/* Bold note */}
              {section.boldNote && (
                <p className="font-semibold text-[#292929]">{section.boldNote}</p>
              )}

              {/* Muted note */}
              {section.note && (
                <p className="text-gray-400 text-xs">{section.note}</p>
              )}

              {/* Contact box */}
              {section.contact && (
                <div className="bg-[#FFF0F8] border border-[#FF008C]/20 rounded-xl p-4 space-y-1.5">
                  <p className="font-semibold text-[#292929]">{section.contact.name}</p>
                  <p>
                    Email:{" "}
                    <a
                      href={`mailto:${section.contact.email}`}
                      className="text-[#FF008C] underline"
                    >
                      {section.contact.email}
                    </a>
                    {section.contact.emailNote && (
                      <span className="text-gray-400 text-xs ml-1">
                        {section.contact.emailNote}
                      </span>
                    )}
                  </p>
                  {section.contact.address && (
                    <p className="text-gray-600">{section.contact.address}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        <p className="text-center text-xs text-gray-400 pb-6">
          &copy; {new Date().getFullYear()} AJ Empire The Nails Boss Enterprise. All rights reserved.
        </p>
      </div>
    </div>
  );
}
