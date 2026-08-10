"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Bullet = { label?: string; text: string };

type Section = {
  id: string;
  title: string;
  paras?: string[];
  bullets?: Bullet[];
  subParas?: string[];
  note?: string;
  boldNote?: string;
  warningNote?: string;
  contact?: {
    name: string;
    email: string;
    address: string;
    website?: string;
    rc?: string;
  };
};

const sections: Section[] = [
  {
    id: "1.1",
    title: "About These Terms / Acceptance",
    paras: [
      'These Terms and Conditions of Use ("Terms") constitute a legally binding agreement between you ("you", "your", "Customer", or "User") and AJ EMPIRE THE NAILS BOSS ENTERPRISE (RC 7304363) ("AJ Empire", "we", "us", or "our"), governing your access to and use of the website ajempire.shop and all associated mobile applications, sub-domains, services, content and features (collectively, the "Platform" or the "Services").',
      "By visiting the Platform, registering an Account, placing an Order, or otherwise using any of the Services, you accept these Terms in full. If you do not accept any part of these Terms, you must immediately cease use of the Platform.",
    ],
  },
  {
    id: "1.2",
    title: "Definitions",
    paras: ["In these Terms, unless the context otherwise requires:"],
    bullets: [
      { label: '"Account"', text: "means the personal user account created on the Platform by a Customer." },
      { label: '"Buyer" or "Customer"', text: "means any individual or entity who places an Order or registers an Account on the Platform." },
      { label: '"Business Day"', text: "means any day other than a Saturday, Sunday or public holiday in the Federal Republic of Nigeria." },
      { label: '"CAC"', text: "means the Corporate Affairs Commission of Nigeria." },
      { label: '"Content"', text: "means all text, images, video, audio, software code, data, product descriptions and other material made available on the Platform." },
      { label: '"FCCPA"', text: "means the Federal Competition and Consumer Protection Act, 2018." },
      { label: '"FCCPC"', text: "means the Federal Competition and Consumer Protection Commission." },
      { label: '"Force Majeure"', text: "has the meaning given in clause 1.19." },
      { label: '"NDPA"', text: "means the Nigeria Data Protection Act, 2023." },
      { label: '"NDPC"', text: "means the Nigeria Data Protection Commission." },
      { label: '"Order"', text: "means an offer placed by a Customer to purchase a Product through the Platform." },
      { label: '"Platform"', text: "means the website at https://ajempire.shop, related applications, and any other digital touchpoint operated by AJ Empire." },
      { label: '"Product"', text: "means any nail accessory, nail care item, cosmetic product or related merchandise listed for sale on the Platform." },
      { label: '"Services"', text: "means the e-commerce services offered through the Platform." },
    ],
  },
  {
    id: "1.3",
    title: "Eligibility",
    paras: [
      "To use the Platform and create an Account, you must be at least eighteen (18) years of age and possess the legal capacity to enter into binding contracts under Nigerian law (or, where you are accessing the Platform from outside Nigeria, under the law applicable to you). By using the Platform you represent and warrant that you meet these conditions. We may, at our sole discretion, refuse Service to any individual whom we reasonably believe does not meet these requirements.",
      "Minors under 18 may only use the Platform under the direct supervision of a parent or legal guardian who accepts these Terms on their behalf.",
    ],
  },
  {
    id: "1.4",
    title: "Account Registration & Security",
    paras: ["To place Orders, you may be required to register for an Account. You agree to:"],
    bullets: [
      { text: "provide true, accurate, current and complete information during registration;" },
      { text: "keep your registration information up to date;" },
      { text: "maintain the strict confidentiality of your password and any one-time codes;" },
      { text: "be solely responsible for all activity that occurs under your Account;" },
      { text: "immediately notify us at ajempirenaija@gmail.com of any unauthorised access or suspected breach of security." },
    ],
    subParas: [
      "We reserve the right, at any time and without notice, to suspend, restrict or terminate any Account where we reasonably suspect a breach of these Terms, fraudulent activity, or activity that violates applicable law, including the Cybercrimes (Prohibition, Prevention, etc.) Act 2015 (as amended).",
    ],
  },
  {
    id: "1.5",
    title: "User Obligations & Conduct",
    paras: ["You agree to use the Platform lawfully and respectfully, and in particular not to:"],
    bullets: [
      { text: "use the Platform for any unlawful purpose or in furtherance of any criminal activity;" },
      { text: "impersonate any person or entity, or misrepresent your affiliation;" },
      { text: "interfere with, disrupt or compromise the security or integrity of the Platform;" },
      { text: "use any robot, spider, scraper, bot or other automated means to access the Platform without our express written permission;" },
      { text: "upload viruses, worms, malware or any malicious code;" },
      { text: "infringe the intellectual property or other rights of AJ Empire or any third party." },
    ],
    subParas: ["Further restrictions are set out in our Acceptable Use Policy."],
  },
  {
    id: "1.6",
    title: "Product Information, Pricing & Availability",
    paras: [
      "We take reasonable care to ensure that descriptions, images, weights, dimensions and prices of Products displayed on the Platform are accurate. However:",
    ],
    bullets: [
      { text: "colours of cosmetic and nail Products may appear slightly different on your screen due to monitor calibration and lighting;" },
      { text: "all Prices are listed in Nigerian Naira (NGN) unless expressly stated otherwise, and are inclusive of applicable Value Added Tax (VAT) where required;" },
      { text: "we reserve the right to correct typographical, pricing or descriptive errors and to refuse or cancel any Order that has been placed based on incorrect information, even after an Order Confirmation has been issued;" },
      { text: "availability of Products is not guaranteed; stock levels fluctuate and we may discontinue, withdraw, or modify any Product without prior notice." },
    ],
  },
  {
    id: "1.7",
    title: "Order Placement & Acceptance",
    paras: [
      "Placing an Order on the Platform constitutes an offer by you to purchase the relevant Product on these Terms. Our acknowledgment of your Order (whether by email, SMS or in-Platform notification) is not acceptance. A binding contract is only formed when we issue a separate Order Confirmation and the Product is dispatched, or, in the case of pay-on-delivery Orders, when the Order is physically handed over to our dispatch partner for delivery.",
      "We may, at our absolute discretion, refuse to accept any Order, including (without limitation) where:",
    ],
    bullets: [
      { text: "the Product is unavailable;" },
      { text: "there is a pricing or description error;" },
      { text: "we are unable to obtain authorisation for payment;" },
      { text: "we suspect fraud or violation of these Terms;" },
      { text: "delivery to your stated address is impracticable." },
    ],
  },
  {
    id: "1.8",
    title: "Payment Terms",
    paras: ["We accept payment via the following channels (availability may vary by region):"],
    bullets: [
      { text: "Debit and credit cards (Verve, Visa, Mastercard) processed through licensed gateways such as Paystack and Flutterwave;" },
      { text: "Bank transfer to our designated business account;" },
      { text: "USSD payments;" },
      { text: "Pay-on-Delivery (POD) — only available in select locations and for Orders below an internally set Naira threshold;" },
      { text: "Such other payment methods as may be enabled on the Platform from time to time." },
    ],
    subParas: [
      "All card payments are processed by PCI-DSS compliant third-party processors. We do not store full card details on our servers. By submitting payment, you represent that you are duly authorised to use the relevant payment method. Payment processors may impose their own terms; you are responsible for reviewing those terms.",
    ],
  },
  {
    id: "1.9",
    title: "Shipping, Delivery & Risk of Loss",
    paras: [
      "The detailed terms governing shipping, processing times, partners, fees, and risk are set out in our Shipping & Delivery Policy. In summary, deliveries within Nigeria take 2-3 business working days, subject to logistics conditions. Title and risk of loss to a Product pass to you upon physical delivery to the address you specified at checkout.",
    ],
  },
  {
    id: "1.10",
    title: "Returns, Refunds & Replacements",
    paras: [
      "Your rights to return Products and obtain a refund or replacement are governed by our Return, Refund & Replacement Policy and by your statutory rights under Section 122 of the FCCPA 2018. Nothing in these Terms operates to exclude, restrict or modify any non-excludable statutory right.",
    ],
  },
  {
    id: "1.11",
    title: "Promotions, Discounts & Vouchers",
    paras: [
      "From time to time we may run promotions, issue discount codes, vouchers, loyalty rewards, or seasonal offers. Each promotion is subject to its specific terms, including eligibility, validity period, redemption limits and exclusions. Promotions:",
    ],
    bullets: [
      { text: "cannot be combined unless expressly stated;" },
      { text: "are non-transferable and have no cash value;" },
      { text: "may be revoked, modified, or terminated at any time at our discretion (subject to vested rights of eligible customers);" },
      { text: "may not be exploited through fraudulent means, multiple accounts, or commercial resale of promotional Products (see AUP)." },
    ],
  },
  {
    id: "1.12",
    title: "Intellectual Property Rights",
    paras: [
      "The Platform and all Content thereon — including the AJ Empire name, logo, brand identity, signature magenta-to-purple gradient, typography pairing of Poppins and Playfair Display, photographs, product descriptions, graphics, software, and the look-and-feel of the Platform — are owned by or licensed to AJ Empire and are protected by Nigerian and international copyright, trademark, and other intellectual property laws.",
      "You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Platform for personal, non-commercial purposes. You may not reproduce, modify, distribute, publicly perform or display, sell, license, reverse-engineer, or create derivative works from any portion of the Platform without our prior written consent.",
    ],
  },
  {
    id: "1.13",
    title: "User-Generated Content",
    paras: [
      'The Platform may allow you to submit reviews, photographs, comments, ratings and other materials ("User Content"). By submitting User Content, you:',
    ],
    bullets: [
      { text: "represent and warrant that you own or have all necessary rights, including consents of any persons featured;" },
      { text: "grant AJ Empire a perpetual, worldwide, royalty-free, transferable, sub-licensable licence to use, reproduce, adapt, modify, publish, translate, distribute, perform and display such User Content in any media, in connection with our business;" },
      { text: "acknowledge that we may, but are not obliged to, monitor, edit, refuse or remove any User Content at our sole discretion;" },
      { text: "agree not to submit content that is unlawful, defamatory, obscene, infringing, misleading, threatening, or in breach of our AUP." },
    ],
  },
  {
    id: "1.14",
    title: "Prohibited Activities",
    paras: [
      "You agree to comply with our Acceptable Use Policy, which is incorporated into these Terms by reference. Any breach of the AUP is a material breach of these Terms.",
    ],
  },
  {
    id: "1.15",
    title: "Third-Party Links & Services",
    paras: [
      "The Platform may contain links to third-party websites, applications, payment gateways and logistics platforms. We do not control, endorse or assume responsibility for the content, privacy practices or operations of any third party. Your dealings with such third parties are solely between you and them.",
    ],
  },
  {
    id: "1.16",
    title: "Disclaimers & Limitation of Liability",
    paras: [
      'To the maximum extent permitted by law, the Platform and all Services are provided on an "as is" and "as available" basis without warranty of any kind, whether express, implied or statutory. We do not warrant that the Platform will be uninterrupted, error-free, secure, or free from harmful components.',
      "Subject to your non-excludable statutory rights, in no event shall AJ Empire, its directors, employees, agents or affiliates be liable for any indirect, incidental, special, consequential, punitive or exemplary damages — including loss of profits, revenue, data, goodwill, or business opportunity — arising out of or in connection with your use of the Platform, even if advised of the possibility of such damages. Our aggregate liability arising under or in connection with these Terms shall not exceed the total amount paid by you for the specific Order giving rise to the claim.",
    ],
    warningNote:
      "Important Nigerian-law notice: Nothing in this clause limits or excludes any liability that cannot be limited or excluded under the FCCPA 2018, the NDPA 2023, or any other applicable Nigerian legislation.",
  },
  {
    id: "1.17",
    title: "Indemnification",
    paras: [
      "You agree to indemnify, defend and hold harmless AJ Empire and its officers, directors, employees, agents, licensors and affiliates from and against any and all claims, demands, losses, damages, liabilities, costs and expenses (including reasonable legal fees) arising out of or in connection with: (a) your breach of these Terms; (b) your User Content; (c) your violation of any law or third-party right; or (d) your misuse of the Platform.",
    ],
  },
  {
    id: "1.18",
    title: "Termination & Suspension",
    paras: [
      "We may suspend or terminate your Account and your access to the Platform at any time, with or without notice, for any reason including (without limitation) breach of these Terms, fraudulent activity, regulatory request, or where required for security. Termination does not affect any rights or obligations that have accrued prior to termination, nor any clauses that by their nature are intended to survive termination.",
    ],
  },
  {
    id: "1.19",
    title: "Force Majeure",
    paras: [
      "We shall not be liable for any failure or delay in performance caused by events beyond our reasonable control, including but not limited to:",
    ],
    bullets: [
      { text: "acts of God, natural disasters, fire or flood;" },
      { text: "epidemic or pandemic;" },
      { text: "war, terrorism, or civil unrest;" },
      { text: "government action, currency restrictions, or currency devaluation;" },
      { text: "fuel scarcity, strikes or industrial disputes;" },
      { text: "cyber-attacks or failure of utilities or telecommunications infrastructure;" },
      { text: "customs delays and breakdown of transportation systems." },
    ],
  },
  {
    id: "1.20",
    title: "Dispute Resolution",
    paras: ["Any dispute, claim or controversy arising out of or relating to these Terms shall be resolved in the following sequence:"],
    bullets: [
      { label: "1. Direct Negotiation", text: "You shall first contact us at ajempirenaija@gmail.com. We shall use good-faith efforts to resolve the matter within fourteen (14) Business Days." },
      { label: "2. Mediation", text: "If unresolved, the parties shall attempt mediation through an accredited mediation centre in Nigeria." },
      { label: "3. FCCPC Complaint", text: "Consumers retain the right to file a complaint with the Federal Competition and Consumer Protection Commission (FCCPC) and to pursue remedies before the Competition and Consumer Protection Tribunal (CCPT)." },
      { label: "4. Litigation", text: "Failing resolution by the above, disputes shall be referred to the competent courts of the Federal Republic of Nigeria, with venue in Delta State, Nigeria." },
    ],
  },
  {
    id: "1.21",
    title: "Governing Law & Cross-Border Note",
    paras: [
      "These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to conflict-of-laws principles.",
      "Pan-African Expansion: Where you access the Platform from, or are delivered Products in, another African jurisdiction (including but not limited to Ghana, Kenya, South Africa, Egypt, Cote d'Ivoire, Senegal, Rwanda or Uganda), you retain the consumer protection rights afforded to you under the mandatory laws of that jurisdiction, and nothing in these Terms limits those rights. As our presence in those markets develops, and to the extent such instruments apply to us, we will seek to observe applicable cross-border consumer-protection norms, including the principles of the AfCFTA Digital Trade Protocol and equivalent regional instruments where they apply to our activities.",
    ],
  },
  {
    id: "1.22",
    title: "Changes to These Terms",
    paras: [
      'We may revise these Terms from time to time. The "Last Updated" date at the top of each policy reflects the most recent change. Material changes will be communicated by email or by a prominent notice on the Platform at least seven (7) days before they take effect. Your continued use of the Platform after the effective date constitutes acceptance of the revised Terms.',
    ],
  },
  {
    id: "1.23",
    title: "Severability, Waiver, Assignment, Entire Agreement",
    bullets: [
      { label: "Severability", text: "If any provision is held to be unenforceable, the remaining provisions remain in full force." },
      { label: "Waiver", text: "Our failure to enforce any right is not a waiver of that right." },
      { label: "Assignment", text: "You may not assign these Terms without our prior written consent. We may assign these Terms to any affiliate or successor." },
      { label: "Entire Agreement", text: "Together with the other policies in this package, these Terms constitute the entire agreement between you and AJ Empire concerning the Platform." },
    ],
  },
  {
    id: "1.24",
    title: "Contact Information",
    paras: ["If you have any questions regarding these Terms, please contact:"],
    contact: {
      name: "AJ Empire The Nails Boss Enterprise",
      email: "ajempirenaija@gmail.com",
      address: "Nut Road, after the first MTN Mast, Abraka, Delta State, Nigeria",
      website: "https://ajempire.shop",
      rc: "7304363",
    },
  },
];

export default function TermsAndConditionsPage() {
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
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            Terms &amp; Conditions of Use
          </h1>
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
              {/* Intro paragraphs */}
              {section.paras?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}

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

              {/* Sub paragraphs (after bullets) */}
              {section.subParas?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}

              {/* Bold note */}
              {section.boldNote && (
                <p className="font-semibold text-[#292929]">{section.boldNote}</p>
              )}

              {/* Muted note */}
              {section.note && (
                <p className="text-gray-400 text-xs">{section.note}</p>
              )}

              {/* Warning / important notice */}
              {section.warningNote && (
                <div className="bg-[#FFF0F8] border-l-4 border-[#FF008C] rounded-r-xl p-4">
                  <p className="text-sm text-[#292929] font-medium">{section.warningNote}</p>
                </div>
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
                  </p>
                  <p className="text-gray-600">{section.contact.address}</p>
                  {section.contact.website && (
                    <p className="text-gray-600">
                      Website:{" "}
                      <span className="text-[#FF008C]">{section.contact.website}</span>
                    </p>
                  )}
                  {section.contact.rc && (
                    <p className="text-gray-500 text-xs">RC: {section.contact.rc}</p>
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
