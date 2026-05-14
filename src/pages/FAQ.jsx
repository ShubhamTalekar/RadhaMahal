import React, { useState } from 'react';
import { CONTACT_EMAIL } from '../constants';


const faqs = [
    {
        category: "Shipping & Returns",
        questions: [
            {
                q: "Do you ship internationally?",
                a: "Yes, we offer worldwide shipping. International orders typically arrive within 7–15 business days, while domestic deliveries within India usually take 5–7 business days."
            },
            {
                q: "What is your return policy?",
                a: "We do not accept returns unless there is a verified size-related issue with the product received."
            },
            {
                q: "Can I exchange for a different color?",
                a: "We currently offer exchanges only for size-related concerns and not for color variations. Exchange requests must be initiated within 7 days of delivery and should include a clear 360° video proof of the product."
            }
        ]
    },
    {
        category: "Product & Care",
        questions: [
            {
                q: "How should I care for my silk garments?",
                a: "We strongly recommend dry cleaning only. To preserve the richness of the fabric and zari work, store the garment in a soft cotton cloth or muslin bag that allows the fabric to breathe."
            },
            {
                q: "Are the colors exact to what I see on screen?",
                a: "We make every effort to display product colors as accurately as possible. However, slight variations may occur due to lighting conditions, photography, and individual screen settings. Pure silk fabrics may also reflect light differently from various angles."
            }
        ]
    },
    {
        category: "Orders & Customization",
        questions: [
            {
                q: "Do you offer blouse stitching?",
                a: "Yes, we provide bespoke blouse stitching services for an additional charge. You may select and submit your measurement profile during checkout."
            },
            {
                q: "Can I cancel my order?",
                a: "Once an order has been placed, it cannot be cancelled."
            }
        ]
    }
];


export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(`0-0`);

    const toggleFaq = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <main className="min-h-screen bg-surface py-24 px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-secondary tracking-[0.3em] uppercase text-xs font-bold block mb-4">We're here to help</span>
                    <h1 className="font-headline text-5xl text-on-surface mb-6">Frequently Asked Questions</h1>
                    <p className="text-on-surface-variant font-light text-lg max-w-xl mx-auto leading-relaxed">Everything you need to know about our products, shipping, and bespoke services.</p>
                </div>

                <div className="space-y-12">
                    {faqs.map((group, gIdx) => (
                        <div key={gIdx}>
                            <h2 className="text-xl font-notoSerif text-secondary mb-6 border-b border-secondary/20 pb-2">{group.category}</h2>
                            <div className="space-y-4">
                                {group.questions.map((item, qIdx) => {
                                    const idx = `${gIdx}-${qIdx}`;
                                    const isOpen = openIndex === idx;
                                    return (
                                        <div key={idx} className="border border-secondary/10 rounded-lg overflow-hidden transition-all duration-300">
                                            <button
                                                onClick={() => toggleFaq(idx)}
                                                className={`w-full text-left px-6 py-4 flex justify-between items-center bg-surface hover:bg-secondary/5 transition-colors ${isOpen ? 'bg-secondary/5' : ''}`}
                                            >
                                                <span className="font-medium text-on-surface pr-4">{item.q}</span>
                                                <span className={`material-symbols-outlined text-secondary transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                            </button>
                                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="p-6 pt-2 text-on-surface-variant font-light leading-relaxed border-t border-secondary/5">
                                                    {item.a}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-8 border border-secondary/20 rounded-xl text-center bg-secondary/5">
                    <h3 className="font-headline text-2xl text-on-surface mb-3">Still have questions?</h3>
                    <p className="text-on-surface-variant font-light mb-6">Our bespoke concierges are available to assist you.</p>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block bg-secondary text-on-secondary px-8 py-3 rounded-full font-label tracking-widest uppercase text-xs font-bold hover:shadow-lg transition-shadow">Contact Us</a>
                </div>
            </div>
        </main>
    );
}
