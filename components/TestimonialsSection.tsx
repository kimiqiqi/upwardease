import React, { useState, useEffect, useCallback } from "react";
import { Quote, User, ChevronLeft, ChevronRight } from "lucide-react";
import { REVIEWS } from "../constants";

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Function to handle automatic switching
  const nextReview = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
      setIsFading(false);
    }, 300);
  }, []);

  const prevReview = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
      setIsFading(false);
    }, 300);
  };

  const goToReview = (idx: number) => {
    if (idx === currentIndex) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setIsFading(false);
    }, 300);
  };

  useEffect(() => {
    const interval = setInterval(nextReview, 6000);
    return () => clearInterval(interval);
  }, [nextReview, currentIndex]); // Dependency on currentIndex resets timer on manual interaction

  const review = REVIEWS[currentIndex];

  return (
    <section className="py-12 relative group">
      <div className="text-center mb-12">
        <div className="inline-block bg-eggplant/10 dark:bg-teal-900/30 text-eggplant dark:text-teal-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
          Community Stories
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
           Our students love us <span className="text-3xl md:text-4xl">😍</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
          Hear directly from students who have found support, shared their struggles, and discovered new ways to cope through UpwardEase.
        </p>
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

         <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-[0px_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 relative overflow-hidden min-h-[350px] flex items-center">
             <Quote className="text-eggplant/5 dark:text-white/5 w-40 h-40 absolute -top-4 -left-4 -z-0" fill="currentColor" />
             
             {/* Animated Content Container */}
             <div className={`w-full flex flex-col md:flex-row gap-8 items-center relative z-10 transition-all duration-300 transform ${isFading ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
                <div className="flex-1 space-y-6 text-center md:text-left">
                   <p className="text-xl md:text-2xl font-serif text-slate-700 dark:text-slate-200 italic leading-relaxed">
                     "{review.text}"
                   </p>
                   <div className="flex flex-col md:flex-row items-center md:items-start gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="md:hidden">
                        {/* Mobile Avatar */}
                        {review.avatar ? (
                          <img src={review.avatar} alt={review.author} referrerPolicy="no-referrer" className={`w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-md ${review.color}`} />
                        ) : (
                          <div className={`w-16 h-16 rounded-full ${review.color} flex items-center justify-center border-2 border-white dark:border-slate-600 shadow-md`}>
                            <User size={24} className="text-slate-700 opacity-50" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-eggplant dark:text-white text-lg">{review.author}</p>
                        <p className="text-slate-500 text-sm uppercase tracking-wide font-semibold">{review.role}</p>
                      </div>
                   </div>
                </div>
                
                <div className="flex-shrink-0 hidden md:block">
                   {review.avatar ? (
                     <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full ${review.color} p-2 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500`}>
                       <img src={review.avatar} alt={review.author} referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-700" />
                     </div>
                   ) : (
                     <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full ${review.color} flex items-center justify-center border-4 border-white dark:border-slate-600 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500`}>
                        <User size={64} className="text-slate-700 opacity-50" />
                     </div>
                   )}
                </div>
             </div>
         </div>

         {/* Indicators */}
         <div className="flex justify-center gap-3 mt-8">
           {REVIEWS.map((_, idx) => (
             <button 
               key={idx}
               onClick={() => goToReview(idx)}
               className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-eggplant dark:bg-teal-400 w-8" : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 w-2.5"}`}
               aria-label={`Go to testimonial ${idx + 1}`}
             />
           ))}
         </div>
      </div>
    </section>
  );
};