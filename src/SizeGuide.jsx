import React from 'react';
import { Link } from 'react-router-dom';

export default function SizeGuide() {
    const sizeData = {
        saree: {
            title: "Saree Measurements",
            description: "Our sarees come in a standard length of 5.5 to 6 meters with an unstitched blouse piece of 0.8 to 1 meter.",
            table: [
                ["Part", "Measurement (cm)", "Measurement (in)"],
                ["Length", "550 - 600", "216 - 236"],
                ["Width", "110 - 115", "43 - 45"],
                ["Blouse Length", "80 - 100", "31 - 39"]
            ]
        },
        dresses: {
            title: "Dresses Size Chart",
            table: [
                ["Size", "Bust (in)", "Waist (in)", "Hip (in)"],
                ["XS", "32", "26", "34"],
                ["S", "34", "28", "36"],
                ["M", "36", "30", "38"],
                ["L", "38", "32", "40"],
                ["XL", "40", "34", "42"],
                ["XXL", "42", "36", "44"],
                ["XXXL", "44", "38", "46"]
            ]
        }
    };

    return (
        <div className="bg-[#fdfbf7] min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <header className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl text-primary mb-4 font-display">
                        Size Guide
                    </h1>
                    <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-6"></div>
                    <p className="text-[#6d5c7d] text-lg max-w-2xl mx-auto font-body">
                        Find your perfect fit with our detailed size charts. If you're between sizes or need a custom fit, we recommend choosing the larger size or contacting our bespoke services.
                    </p>
                </header>

                <div className="space-y-20">
                    {Object.entries(sizeData).map(([key, data]) => (
                        <section key={key} className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#d4af37]/10">
                            <h2 className="text-3xl text-primary mb-6 flex items-center gap-4 font-display">
                                <span className="w-2 h-8 bg-[#d4af37] rounded-full"></span>
                                {data.title}
                            </h2>
                            {data.description && (
                                <p className="text-[#6d5c7d] mb-8 italic">{data.description}</p>
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-[#d4af37]/30">
                                            {data.table[0].map((header, i) => (
                                                <th key={i} className="py-4 px-6 text-primary font-bold uppercase tracking-wider text-sm">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#d4af37]/10">
                                        {data.table.slice(1).map((row, i) => (
                                            <tr key={i} className="hover:bg-[#fdfbf7] transition-colors">
                                                {row.map((cell, j) => (
                                                    <td key={j} className="py-5 px-6 text-[#6d5c7d] font-medium">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-20 text-center bg-primary text-[#fdfbf7] p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <h3 className="text-3xl mb-4 relative z-10 font-display">
                        Still Unsure About Your Size?
                    </h3>
                    <p className="text-[#fdfbf7]/80 mb-8 max-w-xl mx-auto relative z-10">
                        Our style experts are here to help you find the perfect fit for your special occasion.
                    </p>
                    <Link 
                        to="/contact" 
                        className="inline-block px-10 py-4 bg-[#d4af37] text-primary hover:bg-[#b8941f] rounded-full transition-all duration-300 font-bold shadow-lg relative z-10"
                    >
                        Talk to an Expert
                    </Link>
                </div>
            </div>
        </div>
    );
}
