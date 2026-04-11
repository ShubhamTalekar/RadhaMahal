import React, { useState } from 'react';

const faqs = [
    {
        category: "Shipping & Returns",
        questions: [
            { q: "Do you ship internationally?", a: "Yes, we ship globally! International shipping generally takes 7-14 business days, while domestic orders (India) arrive in 3-5 business days." },
            { q: "What is your return policy?", a: "We accept returns within 7 days of delivery for unworn, unwashed items in their original condition and packaging. Custom-stitched items are final sale." },
            { q: "Can I exchange for a different color?", a: "We offer exchanges. You can initiate an exchange request through our portal within 7 days of receiving your order." }
        ]
    },
    {
        category: "Product & Care",
        questions: [
            { q: "How should I care for my silk garments?", a: "We highly recommend dry cleaning only. For storage, wrap them in a soft cotton cloth or muslin bag to let the fabric breathe and prevent tarnishing of zari." },
            { q: "Are the colors exact to what I see on screen?", a: "We strive for accuracy, but due to lighting and monitor settings, slight variations in color might occur. Pure silk also reflects light differently based on the angle." }
        ]
    },
    {
        category: "Orders & Customization",
        questions: [
            { q: "Do you offer blouse stitching?", a: "Yes, we offer bespoke blouse stitching services for an additional fee. You can select the measurement profile during checkout." },
            { q: "Can I cancel my order?", a: "Orders can be modified or cancelled within 24 hours of placement. Once processed and shipped, they cannot be cancelled." }
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
