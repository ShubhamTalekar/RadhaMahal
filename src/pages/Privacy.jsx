import React from 'react';
import SEO from '../components/SEO';

export default function Privacy() {
    return (
        <main className="min-h-screen bg-surface py-24 px-8">
            <SEO 
                title="Privacy Policy - Radha Mahal"
                description="Read the privacy policy for Radha Mahal."
            />
            <div className="max-w-3xl mx-auto">
                <div className="mb-16">
                    <span className="text-secondary tracking-[0.3em] uppercase text-xs font-bold block mb-4">Legal</span>
                    <h1 className="font-headline text-5xl text-on-surface mb-6">Privacy Policy</h1>
                    <p className="text-on-surface-variant font-light text-sm">Last updated: March 2026</p>
                </div>

                <div className="space-y-8 text-on-surface-variant font-light leading-relaxed prose prose-invert prose-headings:text-secondary prose-a:text-secondary max-w-none">
                    <p>At Radha Mahal, we are committed to protecting your privacy. This privacy policy explains how your personal information is collected, used, and disclosed by Radha Mahal.</p>

                    <h2 className="text-2xl font-headline text-secondary mt-12 mb-4">1. Information We Collect</h2>
                    <p>We collect information regarding your contact details (Name, Email, Delivery Address, Phone Number), shopping history, and preferences when you register, make a purchase, or interact with our customer service. Payment details are never stored by us and are directly processed by PCI-compliant payment gateways.</p>

                    <h2 className="text-2xl font-headline text-secondary mt-12 mb-4">2. How We Use Your Information</h2>
                    <p>The information we collect from you may be used to personalize your experience, improve our website, improve customer service, process bespoke tailoring orders securely, and administer contests, promotions or surveys.</p>

                    <h2 className="text-2xl font-headline text-secondary mt-12 mb-4">3. Data Security and Confidentiality</h2>
                    <p>We implement a variety of premium security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal data. We use industry-standard encryption protocols.</p>

                    <h2 className="text-2xl font-headline text-secondary mt-12 mb-4">4. Third-Party Sharing</h2>
                    <p>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties (like our elite delivery partners and secure payment gateways) who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.</p>

                    <h2 className="text-2xl font-headline text-secondary mt-12 mb-4">5. Cookies and Tracking</h2>
                    <p>We use cookies to understand and save your preferences for future visits, keep track of advertisements, and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.</p>
                </div>
            </div>
        </main>
    );
}
