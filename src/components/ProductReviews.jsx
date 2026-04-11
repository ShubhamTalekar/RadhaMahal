import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, CheckCircle, MessageSquare, Send } from 'lucide-react';

export default function ProductReviews({ productId, user }) {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Check if user has purchased this product
    const hasPurchased = user?.orders?.some(order => 
        order.items.some(item => String(item.id) === String(productId) || item.title.includes(productId))
    );

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const BASE = import.meta.env.VITE_API_BASE_URL;
                const response = await fetch(`${BASE}/api/reviews/${productId}`);
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error("Failed to load reviews:", error);
            }
        };
        fetchReviews();
    }, [productId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);
        
        const newReview = {
            id: Date.now(),
            userName: user?.name || 'Guest User',
            rating,
            comment,
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            isVerified: hasPurchased
        };

        const submitReview = async () => {
            try {
                const BASE = import.meta.env.VITE_API_BASE_URL;
                await fetch(`${BASE}/api/reviews/${productId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newReview)
                });
            } catch (error) {
                console.error("Failed to submit review:", error);
            }
        };
        submitReview();

        setTimeout(() => {
            setReviews(prev => [newReview, ...prev]);
            setRating(0);
            setComment('');
            setIsSubmitting(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 800);
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <section id="reviews" className="mt-24 border-t border-outline-variant/10 pt-16 animate-fade-in font-headline">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                <div className="space-y-4">
                    <h2 className="text-4xl font-headline text-secondary italic">Client Narratives</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center text-[#d4af37]">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-[#d4af37]' : 'text-outline-variant'}`} 
                                />
                            ))}
                        </div>
                        <span className="text-2xl font-body text-secondary font-light">{averageRating} / 5.0</span>
                        <span className="text-on-surface-variant text-sm font-light">({reviews.length} Reviews)</span>
                    </div>
                </div>

                {hasPurchased && !showSuccess && (
                    <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 w-full md:max-w-md shadow-sm">
                        <h3 className="text-xl font-headline text-secondary mb-6 italic">Compose Your Review</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-outline font-bold">Your Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star 
                                                className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'fill-[#d4af37] text-[#d4af37]' : 'text-outline-variant'}`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-outline font-bold">Your Experience</label>
                                <textarea
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share the story of your garment..."
                                    className="w-full bg-white border border-outline-variant/20 rounded-2xl p-4 text-sm text-secondary focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all min-h-[120px] resize-none"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || rating === 0}
                                className={`w-full py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${isSubmitting ? 'bg-secondary/50 cursor-not-allowed' : 'bg-secondary text-on-secondary hover:brightness-110 shadow-lg shadow-secondary/20'}`}
                            >
                                {isSubmitting ? <span className="animate-spin text-xl">◌</span> : <><Send className="w-4 h-4" /> Publish Review</>}
                            </button>
                        </form>
                    </div>
                )}

                {showSuccess && (
                    <div className="bg-green-50 border border-green-200 p-8 rounded-3xl w-full md:max-w-md flex flex-col items-center text-center animate-fade-in">
                        <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                        <h3 className="text-lg font-bold text-green-800 uppercase tracking-widest mb-2">Review Published</h3>
                        <p className="text-green-700 text-sm italic">Thank you for sharing your experience with the Radha Mahal community.</p>
                    </div>
                )}

                {!hasPurchased && (
                    <div className="bg-surface-container-high/50 p-6 rounded-2xl border border-dashed border-outline-variant/30 max-w-sm">
                        <p className="text-sm text-on-surface-variant italic flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-secondary/40" />
                            Sharing your experience is exclusive to verified purchasers of this masterpiece.
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="p-8 rounded-[2rem] bg-white border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-secondary/5 flex items-center justify-center text-secondary">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-headline text-lg text-secondary group-hover:text-primary transition-colors">{review.userName}</h4>
                                        <div className="flex items-center gap-2">
                                            {review.isVerified && (
                                                <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                    <CheckCircle className="w-2.5 h-2.5" /> Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end text-[#d4af37] mb-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-[#d4af37]' : 'text-outline-variant'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-outline-variant flex items-center gap-1 justify-end">
                                        <Calendar className="w-3 h-3" /> {review.date}
                                    </span>
                                </div>
                            </div>
                            <p className="text-on-surface-variant leading-relaxed italic font-light font-body" >
                                "{review.comment}"
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 py-20 text-center border-2 border-dashed border-outline-variant/10 rounded-[3rem]">
                        <MessageSquare className="w-12 h-12 text-outline-variant/20 mx-auto mb-4" />
                        <p className="text-on-surface-variant italic">Be the first to narrate your experience with this creation.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
