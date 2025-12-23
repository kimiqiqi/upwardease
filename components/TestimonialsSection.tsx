import React, { useState, useEffect } from "react";
import { Quote, User } from "lucide-react";
import { REVIEWS } from "../constants";

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const review = REVIEWS[currentIndex];

  return (
    <section className="py-12">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
           Our students love us <span className="text-3xl">😍</span>
        </h2>
      </div>

      <div className="max-w-4xl mx-auto px-4">
         <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-[0px_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 relative transition-all duration-500">
             <Quote className="text-eggplant/10 dark:text-white/10 w-24 h-24 absolute top-4 left-4 -z-0" fill="currentColor" />
             
             <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
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
                   <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full ${review.color} flex items-center justify-center border-4 border-white dark:border-slate-600 shadow-lg`}>
                      <User size={64} className="text-slate-700 opacity-50" />
                   </div>
                </div>
             </div>

             {/* Indicators */}
             <div className="flex justify-center gap-2 mt-8">
               {REVIEWS.map((_, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setCurrentIndex(idx)}
                   className={`w-3 h-3 rounded-full transition-colors ${idx === currentIndex ? "bg-eggplant dark:bg-teal-400" : "bg-slate-200 dark:bg-slate-600"}`}
                 />
               ))}
             </div>
         </div>
      </div>
    </section>
  );
};