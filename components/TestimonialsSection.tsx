import React, { useState, useEffect, useCallback } from "react";
import { Quote, User, ChevronLeft, ChevronRight } from "lucide-react";
import { REVIEWS } from "../constants";

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to handle automatic switching
  const nextReview = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
  }, []);

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  useEffect(() => {
    const interval = setInterval(nextReview, 6000);
    return () => clearInterval(interval);
  }, [nextReview, currentIndex]); // Dependency on currentIndex resets timer on manual interaction

  const review = REVIEWS[currentIndex];

  return (
    <section className="py-12 relative group">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
           Our students love us <span className="text-3xl">😍</span>
        </h2>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative">
         {/* Manual Controls - Visible on Hover or Mobile */}
         <button 
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous testimonial"
         >
            <ChevronLeft size={24} />
         </button>
         
         <button 
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next testimonial"
         >
            <ChevronRight size={24} />
         </button>

         <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-[0px_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 relative overflow-hidden min-h-[300px] flex items-center">
             <Quote className="text-eggplant/10 dark:text-white/10 w-24 h-24 absolute top-4 left-4 -z-0" fill="currentColor" />
             
             {/* Animated Content Container */}
             <div key={currentIndex} className="w-full flex flex-col md:flex-row gap-8 items-center relative z-10 animate-fade-in-up">
                <div className="flex-1 space-y-6">
                   <p className="text-xl md:text-2xl font-serif text-slate-700 dark:text-slate-200 italic leading-relaxed">
                     "{review.text}"
                   </p>
                   <div>
                      <p className="font-bold text-eggplant dark:text-white text-lg">- {review.author}</p>
                      <p className="text-slate-500 text-sm uppercase tracking-wide">{review.role}</p>
                   </div>
                </div>
                
                <div className="flex-shrink-0">
                   <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full ${review.color} flex items-center justify-center border-4 border-white dark:border-slate-600 shadow-lg transform rotate-3`}>
                      <User size={64} className="text-slate-700 opacity-50" />
                   </div>
                </div>
             </div>
         </div>

         {/* Indicators */}
         <div className="flex justify-center gap-2 mt-8">
           {REVIEWS.map((_, idx) => (
             <button 
               key={idx}
               onClick={() => setCurrentIndex(idx)}
               className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-eggplant dark:bg-teal-400 w-8" : "bg-slate-200 dark:bg-slate-600 hover:bg-slate-300"}`}
               aria-label={`Go to testimonial ${idx + 1}`}
             />
           ))}
         </div>
      </div>
    </section>
  );
};