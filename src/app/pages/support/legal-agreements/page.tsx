"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink, Search, X } from "lucide-react";
import { useState, useMemo } from "react";

type Block =
  | { type: "para"; text: string }
  | { type: "subheading"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "labeled"; items: { label: string; text: string }[] }
  | { type: "warning"; text: string }
  | { type: "note"; text: string }
  | { type: "contact"; lines: string[] };

type Policy = {
  num: string;
  title: string;
  description: string;
  linkedPage?: string;
  blocks: Block[];
};

function extractText(policy: Policy): string {
  const parts: string[] = [policy.title, policy.description];
  for (const block of policy.blocks) {
    if (block.type === "para" || block.type === "subheading" || block.type === "warning" || block.type === "note") {
      parts.push(block.text);
    } else if (block.type === "bullets") {
      parts.push(...block.items);
    } else if (block.type === "labeled") {
      block.items.forEach((i) => parts.push(i.label, i.text));
    } else if (block.type === "contact") {
      parts.push(...block.lines);
    }
  }
  return parts.join(" ").toLowerCase();
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-[#FF008C]/20 text-[#FF008C] rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const policies: Policy[] = [
  {
    num: "01",
    title: "Terms & Conditions of Use",
    description:
      "The rules governing your access to and use of the AJ Empire Platform, including Orders, payments, your rights and obligations, intellectual property, and dispute resolution.",
    linkedPage: "/pages/support/terms-conditions",
    blocks: [
      { type: "subheading", text: "Acceptance" },
      { type: "para", text: 'These Terms constitute a legally binding agreement between you and AJ EMPIRE THE NAILS BOSS ENTERPRISE (RC 7304363), governing your access to and use of ajempire.shop. By visiting the Platform, registering an Account, or placing an Order, you accept these Terms in full.' },
      { type: "subheading", text: "Eligibility" },
      { type: "para", text: "You must be at least eighteen (18) years of age and possess the legal capacity to enter into binding contracts under Nigerian law." },
      { type: "subheading", text: "Payment Methods" },
      { type: "bullets", items: ["Debit and credit cards (Verve, Visa, Mastercard) via Paystack and Flutterwave;", "Bank transfer;", "USSD payments;", "Pay-on-Delivery (POD) in select locations;"] },
      { type: "subheading", text: "Dispute Resolution" },
      { type: "labeled", items: [
        { label: "1. Direct Negotiation", text: "Contact us at ajempirenaija@gmail.com. We aim to resolve within 14 Business Days." },
        { label: "2. Mediation", text: "Through an accredited mediation centre in Nigeria." },
        { label: "3. FCCPC Complaint", text: "File with the Federal Competition and Consumer Protection Commission." },
        { label: "4. Litigation", text: "Courts of the Federal Republic of Nigeria, venue in Delta State." },
      ]},
      { type: "subheading", text: "Governing Law" },
      { type: "para", text: "These Terms are governed by the laws of the Federal Republic of Nigeria." },
    ],
  },
  {
    num: "02",
    title: "Privacy Policy",
    description:
      "How AJ Empire collects, uses, stores and protects your personal data in compliance with the Nigeria Data Protection Act 2023 (NDPA) and GDPR standards.",
    linkedPage: "/pages/support/privacy-policy",
    blocks: [
      { type: "subheading", text: "Data We Collect" },
      { type: "labeled", items: [
        { label: "Identity Data", text: "Full name, gender, date of birth (optional), profile picture." },
        { label: "Contact Data", text: "Delivery and billing addresses, phone number(s), email address." },
        { label: "Financial Data", text: "Payment method details (transaction tokens and last four digits of cards only)." },
        { label: "Technical Data", text: "IP address, browser type, device identifiers, pages visited." },
      ]},
      { type: "subheading", text: "Your Rights (NDPA Section 34)" },
      { type: "bullets", items: [
        "Right to information, access, rectification, erasure, restriction, and portability.",
        "Right to withdraw consent at any time.",
        "Right to lodge a complaint with the NDPC at ndpc.gov.ng.",
      ]},
      { type: "subheading", text: "Data Retention" },
      { type: "labeled", items: [
        { label: "Account data", text: "Up to 6 years after closure." },
        { label: "Order and financial records", text: "At least 6 years from transaction date." },
        { label: "Marketing data", text: "Until you withdraw consent or 2 years of inactivity." },
      ]},
      { type: "subheading", text: "Data Security" },
      { type: "bullets", items: [
        "SSL/TLS encryption in transit (HTTPS);",
        "Encryption at rest for sensitive databases;",
        "PCI-DSS compliance for payment processing;",
        "Regular security audits and penetration tests.",
      ]},
      { type: "warning", text: "We do not sell your personal data to third parties." },
    ],
  },
  {
    num: "03",
    title: "Return, Refund & Replacement Policy",
    description:
      "Your rights to return Products and receive replacements or refunds, including timelines, eligibility, and the step-by-step return process.",
    blocks: [
      {
        type: "warning",
        text: "Nothing in this Policy excludes your statutory rights under the FCCPA 2018, particularly Section 122 (right to return goods) and Section 129 (which renders blanket no-refund clauses null and void in Nigeria).",
      },
      { type: "subheading", text: "How to Start a Return" },
      { type: "bullets", items: [
        "Sign in to your Account on ajempire.shop.",
        "Go to Order History.",
        "Click on the specific Order you wish to return.",
        "Scroll to the bottom of the Order page.",
        'Click the "Return" button.',
        "Complete the return request form (reason, photos, preferred resolution) and submit.",
      ]},
      { type: "subheading", text: "Eligibility for Returns" },
      { type: "bullets", items: [
        "Package received in a damaged condition;",
        "Product is defective or does not function as described;",
        "Wrong item was delivered;",
        "Product is materially different from its Platform description;",
        "Any situation where you have statutory rights under the FCCPA.",
      ]},
      { type: "para", text: "Time window: Return requests must be submitted within 24 hours of delivery. The 24-hour limit does not apply to defective or unsafe Products — your FCCPA Section 122 rights apply for a reasonable period from when you discover the defect." },
      { type: "subheading", text: "Non-Returnable Items" },
      { type: "bullets", items: [
        "Opened nail polish bottles, gel polishes, cuticle oils;",
        "Used nail kits, files, buffers, applicators;",
        "Cosmetic products where the hygiene seal has been broken;",
        "Personalised or custom-made Products;",
        "Gift cards, vouchers and digital downloads;",
        "Products damaged by misuse or unauthorised modification;",
        "Final-sale or clearance items.",
      ]},
      { type: "subheading", text: "Refund Timelines" },
      { type: "labeled", items: [
        { label: "Card / gateway refunds", text: "7–14 Business Days." },
        { label: "Bank transfer refunds", text: "3–7 Business Days after approval." },
        { label: "Pay-on-Delivery Orders", text: "5–10 Business Days via bank transfer to your NUBAN." },
        { label: "Store credit", text: "Immediately upon approval." },
      ]},
      { type: "subheading", text: "Shipping Costs for Returns" },
      { type: "labeled", items: [
        { label: "Our fault (defective, wrong item, damaged)", text: "AJ Empire bears the return-shipping cost." },
        { label: "Change of mind", text: "Customer bears the return-shipping cost." },
      ]},
      { type: "subheading", text: "Order Cancellation" },
      { type: "labeled", items: [
        { label: "Before dispatch", text: "Full refund available at any time." },
        { label: "After dispatch", text: "Please refuse delivery at the door; standard return process then applies." },
      ]},
      { type: "contact", lines: ["Email: ajempirenaija@gmail.com", 'Subject: "Return Request — Order #[your order number]"'] },
    ],
  },
  {
    num: "04",
    title: "Shipping & Delivery Policy",
    description:
      "How and when we deliver across Nigeria's 36 states and FCT, our logistics partners, tracking, failed deliveries, and our expanding cross-border African delivery service.",
    blocks: [
      { type: "subheading", text: "Delivery Coverage" },
      { type: "para", text: "We deliver to all 36 States and the FCT. Cross-border delivery is being progressively rolled out across Africa — anticipated markets include Ghana, Kenya, South Africa, Egypt, Cote d'Ivoire, Senegal, Rwanda and Uganda." },
      { type: "subheading", text: "Order Processing Time" },
      { type: "para", text: "Orders are confirmed and prepared for dispatch within 24 hours of payment confirmation. Orders placed on weekends or Nigerian public holidays are processed the next Business Day." },
      { type: "subheading", text: "Delivery Timeframes" },
      { type: "labeled", items: [
        { label: "Within Nigeria", text: "2–3 Business Working Days from dispatch." },
        { label: "Cross-border Africa (where launched)", text: "7–14 Business Days from dispatch, subject to customs clearance." },
        { label: "Express / same-day", text: "Available in select cities; shown at checkout." },
      ]},
      { type: "subheading", text: "Delivery Partners" },
      { type: "para", text: "GIG Logistics, DHL, Red Star Express, and trusted local dispatch riders." },
      { type: "subheading", text: "Shipping Fees" },
      { type: "para", text: "Calculated at checkout based on delivery location, weight and dimensions, selected speed, and any active free-shipping promotions." },
      { type: "subheading", text: "Failed Deliveries" },
      { type: "para", text: "If a delivery attempt is unsuccessful, our courier will attempt re-delivery once at no extra cost, then contact you to arrange an alternative. If no contact is made within 5 Business Days, the package is returned to AJ Empire and you may be liable for re-delivery fees." },
      { type: "subheading", text: "Risk of Loss & Title" },
      { type: "para", text: "Title and risk of loss pass to you upon physical delivery to the address you specified." },
      { type: "subheading", text: "Customs, Duties & Taxes (Cross-Border)" },
      { type: "para", text: "Customs duties, import VAT and similar charges for cross-border deliveries are the responsibility of the recipient unless expressly stated otherwise at checkout." },
      { type: "contact", lines: ["Email: ajempirenaija@gmail.com", 'Subject: "Delivery Enquiry — Order #[your order number]"'] },
    ],
  },
  {
    num: "05",
    title: "Cookie Policy",
    description:
      "What cookies and tracking technologies we use on the Platform, why we use them, and how you can manage your preferences.",
    blocks: [
      { type: "subheading", text: "What Are Cookies?" },
      { type: "para", text: 'Cookies are small text files placed on your device when you visit a website. References to "cookies" in this Policy include similar technologies such as web beacons, pixels, local storage and SDKs.' },
      { type: "subheading", text: "Types of Cookies We Use" },
      { type: "labeled", items: [
        { label: "Strictly Necessary", text: "Enable core Platform functionality (login session, cart, checkout, security). Always active. Duration: Session – 30 days." },
        { label: "Performance / Analytics", text: "Help us understand how visitors interact with the Platform (e.g., Google Analytics). Duration: Up to 2 years." },
        { label: "Functional", text: "Remember your choices (language, currency, region). Duration: 30 days – 1 year." },
        { label: "Targeting / Advertising", text: "Deliver relevant ads and measure campaign effectiveness (e.g., Meta Pixel, Google Ads). Duration: Up to 13 months." },
      ]},
      { type: "subheading", text: "Your Consent & Choices" },
      { type: "para", text: 'When you first visit the Platform, a cookie consent banner is displayed. Strictly Necessary cookies operate by default. All other categories are activated only with your explicit consent. You may change preferences at any time via the "Cookie Preferences" link in the footer.' },
      { type: "subheading", text: "Managing Cookies in Your Browser" },
      { type: "para", text: "You can control or delete cookies through your browser settings (Google Chrome, Mozilla Firefox, Safari, Microsoft Edge). Blocking cookies may affect Platform functionality." },
    ],
  },
  {
    num: "06",
    title: "Acceptable Use Policy (AUP)",
    description:
      "The conduct expected of all Platform users and the activities that are strictly prohibited, including fraud, impersonation, scraping, and misuse of promotions.",
    blocks: [
      { type: "para", text: "You must use the Platform lawfully, in good faith, and with respect for AJ Empire, other users, and third parties. The Platform is provided for legitimate e-commerce purposes only." },
      { type: "subheading", text: "Prohibited Conduct" },
      { type: "bullets", items: [
        "Use the Platform for any unlawful, fraudulent, deceptive or malicious purpose;",
        "Place fake or fraudulent Orders, including chargeback abuse;",
        "Create multiple Accounts to exploit promotions, vouchers, or loyalty programmes;",
        "Post false, misleading or fake reviews, ratings or testimonials;",
        "Harass, threaten, abuse, intimidate or defame any user, AJ Empire staff, or third party;",
        "Infringe the intellectual property, privacy or other rights of any person;",
        "Upload, transmit or distribute viruses, trojans, ransomware or any malicious code;",
        "Use any robot, spider, scraper, bot or unauthorised API to harvest data from the Platform;",
        "Commercially resell Products acquired via consumer promotions or loyalty programmes;",
        "Impersonate any person or entity, or misrepresent your identity, age or affiliation;",
        "Engage in hate speech, discrimination, incitement to violence, or obscene content;",
        "Spam, phish, or otherwise abuse our communication channels;",
        "Circumvent any technical, security or content-control measures;",
        "Engage in money laundering, terrorism financing, or any financial crime;",
        "List, sell or distribute counterfeit, stolen, unlicensed or unregistered Products;",
        "Attempt to gain unauthorised access to any part of the Platform or other users' Accounts;",
        "Reverse-engineer, decompile or disassemble any part of the Platform's software;",
        "Collect or store personal data about other users without their explicit consent.",
      ]},
      { type: "subheading", text: "Consequences of Violation" },
      { type: "bullets", items: [
        "Warning and required corrective action;",
        "Removal of offending content;",
        "Suspension or termination of your Account;",
        "Cancellation of pending Orders and forfeiture of promotional benefits;",
        "Civil action for damages or injunctive relief;",
        "Referral to NPF, EFCC, FCCPC, NDPC, or NAFDAC as appropriate.",
      ]},
      { type: "subheading", text: "Reporting Violations" },
      { type: "contact", lines: ["Email: ajempirenaija@gmail.com", 'Subject: "AUP Violation Report"', "Include: URLs, screenshots, and Account references where possible."] },
    ],
  },
  {
    num: "07",
    title: "Disclaimer",
    description:
      "Important notices about product information accuracy, NAFDAC compliance, allergen warnings, and the limits of AJ Empire's liability.",
    blocks: [
      { type: "subheading", text: "General Information Disclaimer" },
      { type: "para", text: 'All Content on the Platform is provided on an "as is" and "as available" basis. While we make reasonable efforts to ensure accuracy, AJ Empire makes no warranties of any kind, express or implied, regarding the completeness, accuracy, reliability, suitability or availability of the Platform or Content.' },
      { type: "subheading", text: "Product Information Disclaimer" },
      { type: "bullets", items: [
        "Colours and finishes may appear differently on screen due to monitor calibration and lighting.",
        "Weights, sizes and dimensions are approximate.",
        "Individual results from nail and cosmetic Products vary based on skin type and application.",
        "Some Products may contain ingredients that cause allergic reactions — review ingredient lists carefully before use.",
      ]},
      { type: "subheading", text: "NAFDAC Compliance Note" },
      { type: "para", text: "Many cosmetic Products in Nigeria are subject to NAFDAC registration and labelling requirements. Responsibility rests primarily with manufacturers and importers. AJ Empire sources Products from established, reputable suppliers and takes reasonable care in its procurement practices." },
      { type: "warning", text: "If you have a known skin condition, allergy or sensitivity, consult a qualified medical or cosmetic professional before using any Product purchased from the Platform." },
    ],
  },
];

function PolicyCard({ policy, query }: { policy: Policy; query: string }) {
  const [open, setOpen] = useState(false);

  const isMatch = useMemo(() => {
    if (!query.trim()) return false;
    return extractText(policy).includes(query.toLowerCase());
  }, [policy, query]);

  const isOpen = open || isMatch;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${isMatch && query ? "border-[#FF008C]/40" : "border-gray-100"}`}>
      <div className="flex items-start gap-4 p-6">
        <span className="bg-[#FF008C] text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mt-0.5">
          {policy.num}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#292929] text-base lg:text-lg leading-snug">
            {query ? highlight(policy.title, query) : policy.title}
          </h3>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
            {query ? highlight(policy.description, query) : policy.description}
          </p>
          <div className="mt-3 flex items-center gap-4">
            {policy.linkedPage && (
              <Link
                href={policy.linkedPage}
                className="inline-flex items-center gap-1.5 text-[#FF008C] text-sm font-medium hover:underline"
              >
                View Full Policy <ExternalLink size={13} />
              </Link>
            )}
            <button
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#FF008C] transition-colors"
            >
              {isOpen ? "Collapse" : "Expand"}
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-100 px-6 pb-6 pt-4 space-y-4 text-sm text-gray-600 leading-relaxed">
          {policy.blocks.map((block, i) => {
            if (block.type === "subheading") {
              return (
                <p key={i} className="font-semibold text-[#292929] pt-2">
                  {query ? highlight(block.text, query) : block.text}
                </p>
              );
            }
            if (block.type === "para") {
              return (
                <p key={i}>{query ? highlight(block.text, query) : block.text}</p>
              );
            }
            if (block.type === "bullets") {
              return (
                <ul key={i} className="space-y-1.5">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="text-[#FF008C] shrink-0 mt-0.5">•</span>
                      <span>{query ? highlight(item, query) : item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            if (block.type === "labeled") {
              return (
                <ul key={i} className="space-y-2">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="text-[#FF008C] shrink-0 mt-0.5">•</span>
                      <span>
                        <span className="font-semibold text-[#292929]">
                          {query ? highlight(item.label, query) : item.label}:{" "}
                        </span>
                        {query ? highlight(item.text, query) : item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              );
            }
            if (block.type === "warning") {
              return (
                <div key={i} className="bg-[#FFF0F8] border-l-4 border-[#FF008C] rounded-r-xl p-4">
                  <p className="text-[#292929] font-medium text-sm">
                    {query ? highlight(block.text, query) : block.text}
                  </p>
                </div>
              );
            }
            if (block.type === "note") {
              return (
                <p key={i} className="text-gray-400 text-xs">
                  {query ? highlight(block.text, query) : block.text}
                </p>
              );
            }
            if (block.type === "contact") {
              return (
                <div key={i} className="bg-[#FFF0F8] border border-[#FF008C]/20 rounded-xl p-4 space-y-1">
                  {block.lines.map((line, j) => (
                    <p key={j} className="text-gray-600 text-sm">
                      {line.startsWith("Email:") ? (
                        <>
                          Email:{" "}
                          <a
                            href="mailto:ajempirenaija@gmail.com"
                            className="text-[#FF008C] underline"
                          >
                            ajempirenaija@gmail.com
                          </a>
                        </>
                      ) : (
                        query ? highlight(line, query) : line
                      )}
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

export default function LegalAgreementsPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return policies;
    const q = search.toLowerCase();
    return policies.filter((p) => extractText(p).includes(q));
  }, [search]);

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
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Legal Agreements</h1>
          <p className="text-white/80 mt-2 text-sm">
            Effective Date: 1 July 2026 &nbsp;|&nbsp; Version 1.0 &nbsp;|&nbsp; AJ Empire The Nails Boss Enterprise
          </p>

          {/* Search bar inside hero */}
          <div className="relative mt-6">
            <Search className="absolute left-4 top-3.5 text-white/60" size={17} />
            <input
              type="text"
              placeholder="Search policies, rights, refunds, shipping..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/30 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-3 text-white/70 hover:text-white"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Intro card */}
      <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
            This is the consolidated Legal Policies &amp; Terms package governing your access to and use of the
            AJ Empire Platform. Together these seven (7) instruments form a binding agreement between you
            and AJ EMPIRE THE NAILS BOSS ENTERPRISE (RC 7304363).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["CAMA 2020", "FCCPA 2018", "NDPA 2023", "Cybercrimes Act 2015", "NAFDAC Guidelines", "CBN Consumer Protection"].map((tag) => (
              <span key={tag} className="bg-[#FFF0F8] text-[#FF008C] text-xs font-medium px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Policy list */}
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No results found for &ldquo;{search}&rdquo;</p>
            <button onClick={() => setSearch("")} className="mt-3 text-[#FF008C] text-sm hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          filtered.map((policy) => (
            <PolicyCard key={policy.num} policy={policy} query={search} />
          ))
        )}

        {/* Company details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <p className="font-semibold text-[#292929] mb-3">AJ Empire The Nails Boss Enterprise</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>RC No. 7304363 &mdash; Corporate Affairs Commission, Federal Republic of Nigeria</p>
            <p>Nut Road, after the first MTN Mast, Abraka, Delta State, Nigeria</p>
            <p>
              Email:{" "}
              <a href="mailto:ajempirenaija@gmail.com" className="text-[#FF008C] underline">
                ajempirenaija@gmail.com
              </a>
            </p>
            <p>Website: <span className="text-[#FF008C]">ajempire.shop</span></p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-6">
          &copy; {new Date().getFullYear()} AJ Empire The Nails Boss Enterprise. All rights reserved.
        </p>
      </div>
    </div>
  );
}
