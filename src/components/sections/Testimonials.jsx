import React, { useState, useEffect } from 'react';
import SliderImport from 'react-slick';
const Slider = SliderImport.default || SliderImport;
import { Star, Quote } from 'lucide-react';
import { api } from '../../lib/apiClient';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const testimonials = [
    {
        name: 'Sandhya M',
        rating: 5,
        text: "The saree I purchased for my sister's wedding was absolutely stunning! The quality and craftsmanship exceeded my expectations. Radha Mahal has become my go-to for all ethnic wear.",
        isHardcoded: true,
    },
    {
        name: 'Eshika M',
        rating: 5,
        text: 'I wore a Radha Mahal lehenga to my wedding and felt like a queen! The attention to detail and the beautiful embroidery made my special day even more memorable. Thank you, Neha!',
        isHardcoded: true,
    },
    {
        name: 'Akshata S',
        rating: 5,
        text: "The anarkali I bought is simply gorgeous! It fits perfectly and the fabric is so comfortable. I've received countless compliments every time I wear it. Highly recommend Radha Mahal!",
        isHardcoded: true,
    },
];

export function Testimonials() {
    const [dynamicTestimonials, setDynamicTestimonials] = useState(testimonials);

    useEffect(() => {
        const fetchTopReviews = async () => {
            try {
                const reviews = await api.get('/api/v1/reviews');
                if (Array.isArray(reviews) && reviews.length > 0) {
                    const topReviews = reviews
                        .filter(review => review.rating >= 4)
                        .map(review => ({
                            name: review.userName || 'Verified Patron',
                            location: 'Authentic Review',
                            rating: review.rating,
                            text: review.comment,
                            image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=256&h=256&q=80',
                        }));
                    if (topReviews.length > 0) {
                        setDynamicTestimonials([...topReviews, ...testimonials].slice(0, 10));
                    }
                }
            } catch (e) {
                console.error('Failed to fetch reviews for testimonials', e);
            }
        };
        fetchTopReviews();
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: false,
        dotsClass: 'slick-dots !bottom-[-50px]',
        customPaging: () => (
            <button className="w-3 h-3 rounded-full bg-[#d4af37] opacity-30 hover:opacity-100 transition-opacity duration-300" />
        ),
    };

    return (
        <section className="py-20 bg-primary relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <span className="text-[#d4af37] tracking-widest mb-2 block">TESTIMONIALS</span>
                    <h2 className="text-4xl md:text-5xl text-[#fdfbf7]">Customer Love</h2>
                </div>

                <div className="max-w-4xl mx-auto pb-16">
                    <Slider {...settings}>
                        {dynamicTestimonials.map((testimonial, index) => (
                            <div key={index} className="px-4 py-8 h-full">
                                <div className="bg-[#fdfbf7] rounded-2xl p-8 md:p-12 shadow-xl border-2 border-[#d4af37]/30 h-[450px] flex flex-col">
                                    <Quote className="w-12 h-12 text-[#d4af37] mb-6 shrink-0" />

                                    <div className="flex gap-1 mb-6 shrink-0">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-[#d4af37] text-[#d4af37]" />
                                        ))}
                                    </div>

                                    <p className="text-lg md:text-xl text-primary mb-8 leading-relaxed italic grow">
                                        "{testimonial.text}"
                                    </p>

                                    <div className="flex items-center gap-4 mt-auto shrink-0 border-t border-[#d4af37]/20 pt-6">
                                        {!testimonial.isHardcoded && testimonial.image && (
                                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#d4af37]">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="text-lg text-primary font-headline font-bold">
                                                {testimonial.name}
                                            </h4>
                                            {!testimonial.isHardcoded && testimonial.location && (
                                                <p className="text-[#6d5c7d] text-sm font-body">
                                                    {testimonial.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
}
