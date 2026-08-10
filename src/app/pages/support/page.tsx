"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import Link from "next/link";

const faqData = [
  {
    category: "Orders",
    questions: [
      {
        question: "How do I place an order?",
        answer:
          "Browse the shop or tap Categories to find what you want. Tap the item, then add it to your cart. When you’re ready, open your cart and tap checkout. Enter your delivery address, choose how you want to pay, and confirm. You’ll get a message confirming your order. It’s that simple. ",
      },
      {
        question: "Can I track my order?",
        answer:
          "Yes. Go to your Profile and tap “All Orders” to see everything you’ve bought. You can also tap Processing, Shipped, or Delivered to see the stage your order is at. Once we send your order out, we’ll send you a tracking link by email or SMS so you can follow it till it reaches you.",
      },
    ],
  },
  {
    category: "Payments",
    questions: [
      {
        question: "What payment methods are supported?",
        answer:
          "We accept payment through Paystack, which is safe and secure. You can pay with your debit or credit card, by bank transfer, straight from your bank, or with USSD on your phone. All prices are in Naira. We do not accept payment on delivery.",
      },
      {
        question: "Why was my payment declined?",
        answer:
          "A payment can fail for a few normal reasons: not enough money in the account, a wrong card detail, your bank blocking the payment, or a weak network. It’s usually nothing to worry about. Check your details and try again, or use another method like bank transfer or USSD. If money left your account but your order didn’t confirm, contact us and we’ll sort it out.",
      },
    ],
  },
  {
    category: "Refunds",
    questions: [
      {
        question: "How do refunds work?",
        answer:
          "If something is wrong with your order — it came damaged, faulty, or we sent the wrong item — you can ask for a refund or replacement. Once we receive the item back and check it, we send your money back the same way you paid. Card and transfer refunds usually take a few working days. Bank delays can sometimes make it take a little longer.",
      },
      {
        question: "What is the Return & Refund Policy?",
        answer:
          "You have 24 hours after delivery to report a problem and ask to return an item. Use the “Returns” button in your Profile to start. The item should be unused and in its original pack. If the fault is ours, we cover the return delivery cost and give you a replacement or refund. Some items can’t be returned once opened, like nail polish, used kits, and sealed cosmetics, for hygiene reasons — unless they came to you damaged. Tap to read the full policy.",
      },
    ],
  },
  {
    category: "COOKIES & TRACKING",
    questions: [
      {
        question: "Do you use cookies? ",
        answer:
          "Yes. Cookies are small files that help our website remember you — like keeping items in your cart and helping the site load faster. Some cookies help us see what people like so we can improve. You can control or turn off cookies in your browser settings anytime. Tap to read the full policy.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        question: "How does shipping work?",
        answer:
          "We deliver to all 36 states and Abuja. After you pay, we prepare your order within 24 hours. Delivery inside Nigeria usually takes 2 to 3 working days, depending on where you are. Your delivery fee is shown at checkout before you pay. Once we send it out, you get a tracking link to follow your package.",
      },
    ],
  },
  {
    category: "Account & Security",
    questions: [
      {
        question: "How is my account protected?",
        answer:
          "Your account is protected with encryption, so your details stay private. Your password is stored in a scrambled way that even we cannot read. Please keep your password to yourself and never share it. If you ever notice something strange on your account, tell us at once and we’ll help you secure it.",
      },
    ],
  },

  {
    category: "Community & Usage Policies",
    questions: [
      {
        question: "What are the Community Standards?",
        answer:
          "We want everyone to be honest and respectful. Don’t post fake reviews, don’t harass other people, and don’t use bad or offensive language. Treat other shoppers and our staff well. Anyone who abuses the platform may have their account removed.",
      },
      {
        question: "What is the Acceptable Use Policy?",
        answer:
          "This is simply the list of things you must not do on our platform. Don’t use it for fraud or anything illegal, don’t open many accounts to cheat promotions, don’t try to hack or damage the site, and don’t sell fake products. Use the platform honestly and you’re fine.",
      },
    ],
  },
  {
    category: "Legal & Privacy",
    questions: [
      {
        question: "What is the Privacy Policy?",
        answer:
          "This explains how we handle your personal information. We collect only what we need to serve you — like your name, address, and order details — and we keep it safe. We don’t sell your data to anyone. You can ask to see your data or have it deleted at any time.",
      },
      {
        question: "What are the Terms & Conditions?",
        answer:
          "The Terms & Conditions outline the rules governing your use of Aj‑Empire services.",
      },
      {
        question: "What Legal Agreements apply?",
        answer:
          "These are all our official policies put together — our Terms, Privacy Policy, Refund Policy, Shipping Policy, and more. They also explain what to do if there’s a disagreement and how we follow Nigerian consumer law. Tap to view them all.",
      },
    ],
  },
];

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToSection = (category: string) => {
    const element = sectionRefs.current[category];
    if (element) {
      const yOffset = -80; // adjust for fixed header
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) return faqData;

    return faqData
      .map((section) => ({
        ...section,
        questions: section.questions.filter((q) =>
          q.question.toLowerCase().includes(search.toLowerCase()),
        ),
      }))
      .filter((section) => section.questions.length > 0);
  }, [search]);

  // const scrollToSection = (category: any) => {
  //     const element = sectionRefs.current[category];
  //     if (element) {
  //         const yOffset = -80; // adjust this according to your header height
  //         const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

  //         window.scrollTo({
  //             top: y,
  //             behavior: "smooth"
  //         });
  //     }
  // };

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 lg:px-16 py-12 font-poppins">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#292929]">
            Aj‑Empire Support Center
          </h1>
          <p className="text-gray-500 mt-3 text-sm lg:text-base">
            Find answers, learn how the platform works, or reach out to us.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search for help..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF008C] text-sm"
          />
        </div>

        {/* FAQ Sections */}
        <div className="space-y-10">
          {filteredData.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              ref={(el) => {
                sectionRefs.current[section.category] = el;
              }}
            >
              <h2 className="text-xl font-semibold text-[#FF008C] mb-4">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.questions.map((item, index) => {
                  const id = `${sectionIndex}-${index}`;
                  const isOpen = activeIndex === id;

                  return (
                    <div
                      key={id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <button
                        onClick={() => setActiveIndex(isOpen ? null : id)}
                        className="w-full text-left px-6 py-4 flex justify-between items-center"
                      >
                        <span className="text-sm lg:text-base font-medium text-[#292929]">
                          {item.question}
                        </span>
                        <span className="text-[#FF008C] text-lg">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-6 pb-4 text-gray-600 text-sm"
                          >
                            {item.answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {/* Legal & Policy Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-[#292929] mb-6 text-center">
            Legal & Policies
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <h3 className="font-semibold text-[#292929] mb-2">
                Privacy Policy
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Understand how Aj‑Empire collects, stores, and protects your
                personal data in compliance with applicable regulations.
              </p>
              <Link
                href="/pages/support/privacy-policy"
                className="text-[#FF008C] text-sm font-medium hover:underline"
              >
                Read Privacy Policy →
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <h3 className="font-semibold text-[#292929] mb-2">
                Terms & Conditions
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Review the rules and guidelines governing the use of Aj‑Empire
                services, purchases, and platform access.
              </p>
              <Link
                href="/pages/support/terms-conditions"
                className="text-[#FF008C] text-sm font-medium hover:underline"
              >
                Read Terms &amp; Conditions →
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <h3 className="font-semibold text-[#292929] mb-2">
                Legal Agreements
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Access information about dispute resolution, compliance
                standards, refund obligations, and platform policies.
              </p>
              <Link
                href="/pages/support/legal-agreements"
                className="text-[#FF008C] text-sm font-medium hover:underline"
              >
                View Legal Agreements →
              </Link>
            </div>
          </div>

          {/* Additional Policy Links */}
          <div className="mt-10 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-[#292929] mb-4">
              Additional Policies & Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <button
                onClick={() => scrollToSection("Refunds")}
                className="text-left hover:text-[#FF008C]"
              >
                • Return & Refund Policy
              </button>
              <button
                onClick={() => scrollToSection("Shipping & Delivery")}
                className="text-left hover:text-[#FF008C]"
              >
                • Shipping & Delivery Policy
              </button>
              <button
                onClick={() => scrollToSection("Account & Security")}
                className="text-left hover:text-[#FF008C]"
              >
                • Account & Security Policy
              </button>
              <button
                onClick={() => scrollToSection("Community & Usage Policies")}
                className="text-left hover:text-[#FF008C]"
              >
                • Community Standards
              </button>
              <button
                onClick={() => scrollToSection("Legal & Privacy")}
                className="text-left hover:text-[#FF008C]"
              >
                • Privacy Policy / Terms & Legal
              </button>
            </div>
          </div>
        </div>

        {/* Contact Support Card */}
        <div className="mt-16 bg-[#FF008C] text-white rounded-2xl p-8 text-center shadow-lg">
          <h3 className="text-xl font-semibold mb-3">Still need help?</h3>
          <p className="text-sm opacity-90 mb-6">
            Our support team is here to assist you with orders, payments,
            refunds, legal questions, and more.
          </p>
          <button
            onClick={() => (window as any).Tawk_API?.maximize?.()}
            className="bg-white text-[#FF008C] px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition"
          >
            Start Live Chat
          </button>
        </div>
      </div>
    </div>
  );
}
