import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
    return (
        <main className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4 text-center">
            <SEO title="Page Not Found | Radha Mahal" />
            <span 
                className="material-symbols-outlined text-[120px] text-primary/20 mb-6" 
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
            >
                search_off
            </span>
            <h1 className="font-headline text-5xl text-primary mb-4">Page Not Found</h1>
            <p className="font-body text-on-surface-variant max-w-md mb-10 text-lg">
                We couldn't find the page you're looking for. It might have been moved or doesn't exist anymore.
            </p>
            <Link 
                to="/" 
                className="px-8 py-4 bg-secondary text-on-secondary rounded-full font-bold uppercase tracking-widest text-sm hover:brightness-110 shadow-lg transition-all"
            >
                Return to Home
            </Link>
        </main>
    );
}
