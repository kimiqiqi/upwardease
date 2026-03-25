import React from "react";
import { Target, Star, Heart, Sparkles } from "lucide-react";

export const MissionSection = ({ navigate }: { navigate?: (tab: any) => void }) => {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-16 border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden relative">
      <div className="flex flex-col md:flex-row items-center gap-12">
         {/* Illustration Mockup */}
         <div className="flex-1 relative w-full flex justify-center">
            <div className="w-80 h-80 bg-cream dark:bg-slate-700 rounded-full flex items-center justify-center relative">
               <div className="absolute inset-0 border-2 border-dashed border-eggplant/20 dark:border-teal-400/20 rounded-full animate-spin-slow" />
               <div className="flex flex-col gap-4">
                  <div className="bg-accent-green p-4 rounded-xl text-white transform -translate-x-8 hover:scale-110 transition-transform shadow-lg">
                     <Target size={32} />
                  </div>
                  <div className="bg-accent-orange p-4 rounded-xl text-white transform translate-x-8 hover:scale-110 transition-transform shadow-lg">
                     <Star size={32} />
                  </div>
                  <div className="bg-eggplant p-4 rounded-xl text-white transform -translate-x-4 hover:scale-110 transition-transform shadow-lg">
                     <Heart size={32} />
                  </div>
               </div>
               <div className="absolute top-0 -right-4">
                  <Sparkles className="text-yellow-400 w-8 h-8 animate-pulse" fill="currentColor" />
               </div>
            </div>
         </div>

         <div className="flex-1 space-y-6">
            <h2 className="font-serif text-3xl font-bold text-slate-800 dark:text-white">Our Mission</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
               We are a nonprofit on a mission to create a safe digital environment where students can vent about academic pressure and share strategies for success. 
               We bridge the gap between stress and support so that all students have an equal opportunity to achieve mental well-being and academic upward mobility.
            </p>
            <button 
               onClick={() => navigate && navigate("about")}
               className="text-eggplant dark:text-teal-400 font-bold border-b-2 border-eggplant dark:border-teal-400 hover:opacity-80 transition-opacity uppercase text-sm tracking-wider pb-1"
            >
               Explore Our Mission
            </button>
         </div>
      </div>
    </section>
  );
};