import React from 'react';

export default function Terms() {
    return (
        <main className="min-h-screen bg-surface py-24 px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-16">
                    <span className="text-secondary tracking-[0.3em] uppercase text-xs font-bold block mb-4">Legal</span>
                    <h1 className="font-headline text-5xl text-on-surface mb-6">Terms of Service</h1>
                    <p className="text-on-surface-variant font-light text-sm">Last updated: March 2026</p>
                </div>

                <div className="space-y-8 text-on-surface-variant font-light leading-relaxed prose prose-invert prose-headings:text-secondary prose-a:text-secondary max-w-none">
                    <h2 className="text-2xl font-headline text-secondary mt-12 mb-4">1. Acceptance of Terms</h2>
                    <p>By accessing and placing an order with Radha Mahal, you confirm that you are in agreement with and bound by the terms of service contained in the Terms & Conditions outlined below. These terms apply to the entire website and any email or other type of communication between you and Radha Mahal.</p>

                    <h2 className="text-2xl font-headline text-secondary mt-12 mb-4">2. Products & Authenticity</h2>
                    <p>We guarantee that all our ethnic wear is 100% authentic, hand-loomed, and crafted by master artisans. Due to the handwoven nature of our products, slight irregularities in weave, color, and motif are not defects, but the hallmark of true craftsmanship.</p>

                    <h2 className="text-2xl font-headline text-secondary mt-12 mb-4">3. Pricing and Payments</h2>
                    <p>All prices are subject to change without notice. We reserve the right to modify or discontinue any product at any time. We accept all major credit cards, UPI, Wallets, and Net Banking. Your payment information is processed securely through fully encrypted gateways.</p>

                    <h2 className="text-2xl font-headline text-secondary mt-12 mb-4">4. Shipping & Delivery</h2>
                    <p>We provide global shipping. Estimated delivery times are indicative. Radha Mahal is not responsible for any delays caused by customs clearance or logistical challenges beyond our control. International customers are responsible for any applicable import duties and natural taxes.</p>

                    <h2 className="text-2xl font-headline text-secondary mt-12 mb-4">5. Intellectual Property</h2>
                    <p>The entire content included in this site, including but not limited to styling, text, graphics, photography, and code is copyrighted as a collective work under global copyright laws, and is the property of Radha Mahal Couture. Permission is granted to electronically copy and print hard copy portions of this site for the sole purpose of placing an order.</p>

                </div>
            </div>
        </main>
    );
}
