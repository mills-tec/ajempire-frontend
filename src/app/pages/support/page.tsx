
"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

const faqData = [
    {
        category: "Orders",
        questions: [
            {
                question: "How do I place an order?",
                answer:
                    "Browse products, add items to your cart, proceed to checkout, enter your shipping details, and complete payment securely.",
            },
            {
                question: "Can I track my order?",
                answer:
                    "Yes. Once your order is confirmed, you can track its status from your Orders page inside your account.",
            },
        ],
    },
    {
        category: "Payments",
        questions: [
            {
                question: "What payment methods are supported?",
                answer:
                    "We support secure card payments and other trusted payment gateways integrated into our platform.",
            },
            {
                question: "Why was my payment declined?",
                answer:
                    "Payments may fail due to insufficient funds, incorrect details, or bank restrictions. Please confirm your details or contact your bank.",
            },
        ],
    },
    {
        category: "Refunds",
        questions: [
            {
                question: "How do refunds work?",
                answer:
                    "Refunds are processed once your return is approved. Funds are returned to your original payment method within a few business days.",
            },
            {
                question: "What is the Return & Refund Policy?",
                answer:
                    "You may request a return within the allowed return window. Items must meet eligibility conditions before refunds are processed.",
            },
        ],
    },
    {
        category: "Shipping & Delivery",
        questions: [
            {
                question: "How does shipping work?",
                answer:
                    "Shipping timelines depend on your location and selected delivery method. Estimated delivery time is shown at checkout.",
            },
        ],
    },
    {
        category: "Account & Security",
        questions: [
            {
                question: "How is my account protected?",
                answer:
                    "We use secure authentication systems and encrypted transactions to protect your account and personal information.",
            },
        ],
    },

    {
        category: "Community & Usage Policies",
        questions: [
            {
                question: "What are the Community Standards?",
                answer:
                    "Users must engage respectfully and comply with platform rules to maintain a safe marketplace environment.",
            },
            {
                question: "What is the Acceptable Use Policy?",
                answer:
                    "The platform must not be used for fraudulent, abusive, or illegal activities.",
            },
        ],
    },
    {
        category: "Legal & Privacy",
        questions: [
            {
                question: "What is the Privacy Policy?",
                answer:
                    "Our Privacy Policy explains how we collect, use, and protect your personal information.",
            },
            {
                question: "What are the Terms & Conditions?",
                answer:
                    "The Terms & Conditions outline the rules governing your use of Aj‑Empire services.",
            },
            {
                question: "What Legal Agreements apply?",
                answer:
                    "Legal Agreements include dispute resolution terms, compliance obligations, and user responsibilities.",
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
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };;

    const filteredData = useMemo(() => {
        if (!search.trim()) return faqData;

        return faqData
            .map((section) => ({
                ...section,
                questions: section.questions.filter((q) =>
                    q.question.toLowerCase().includes(search.toLowerCase())
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
                                                onClick={() =>
                                                    setActiveIndex(isOpen ? null : id)
                                                }
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
                            <h3 className="font-semibold text-[#292929] mb-2">Privacy Policy</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Understand how Aj‑Empire collects, stores, and protects your personal data in compliance with applicable regulations.
                            </p>
                            <button className="text-[#FF008C] text-sm font-medium hover:underline">
                                Read Privacy Policy
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                            <h3 className="font-semibold text-[#292929] mb-2">Terms & Conditions</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Review the rules and guidelines governing the use of Aj‑Empire services, purchases, and platform access.
                            </p>
                            <button className="text-[#FF008C] text-sm font-medium hover:underline">
                                Read Terms & Conditions
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                            <h3 className="font-semibold text-[#292929] mb-2">Legal Agreements</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Access information about dispute resolution, compliance standards, refund obligations, and platform policies.
                            </p>
                            <button className="text-[#FF008C] text-sm font-medium hover:underline">
                                View Legal Agreements
                            </button>
                        </div>
                    </div>

                    {/* Additional Policy Links */}
                    <div className="mt-10 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-[#292929] mb-4">
                            Additional Policies & Guidelines
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <button onClick={() => scrollToSection("Refunds")} className="text-left hover:text-[#FF008C]">• Return & Refund Policy</button>
                            <button onClick={() => scrollToSection("Shipping & Delivery")} className="text-left hover:text-[#FF008C]">• Shipping & Delivery Policy</button>
                            <button onClick={() => scrollToSection("Account & Security")} className="text-left hover:text-[#FF008C]">• Account & Security Policy</button>
                            <button onClick={() => scrollToSection("Community & Usage Policies")} className="text-left hover:text-[#FF008C]">• Community Standards</button>
                            <button onClick={() => scrollToSection("Legal & Privacy")} className="text-left hover:text-[#FF008C]">• Privacy Policy / Terms & Legal</button>
                        </div>
                    </div>
                </div>

                {/* Contact Support Card */}
                <div className="mt-16 bg-[#FF008C] text-white rounded-2xl p-8 text-center shadow-lg">
                    <h3 className="text-xl font-semibold mb-3">
                        Still need help?
                    </h3>
                    <p className="text-sm opacity-90 mb-6">
                        Our support team is here to assist you with orders, payments, refunds, legal questions, and more.
                    </p>
                    <button className="bg-white text-[#FF008C] px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition">
                        Start Live Chat (Coming Soon)
                    </button>
                </div>
            </div>
        </div>
    );
}
