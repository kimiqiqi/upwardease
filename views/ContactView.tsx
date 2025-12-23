import React from "react";
import { Mail, Phone } from "lucide-react";

export const ContactView = () => {
  return (
    <div className="max-w-2xl mx-auto py-12">
       <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">Get in Touch</h2>
          <p className="text-slate-600 dark:text-slate-300">Have questions or need support? We're here to help.</p>
       </div>

       <div className="grid gap-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-6">
             <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Mail size={32} />
             </div>
             <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Email Us</h3>
                <p className="text-slate-500 mb-1">For general inquiries and support</p>
                <a href="mailto:hello@upwardease.org" className="text-eggplant dark:text-teal-400 font-bold hover:underline">hello@upwardease.org</a>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-6">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Phone size={32} />
             </div>
             <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Crisis Helpline</h3>
                <p className="text-slate-500 mb-1">Available 24/7 for urgent support</p>
                <a href="tel:988" className="text-eggplant dark:text-teal-400 font-bold hover:underline">Dial 988</a>
             </div>
          </div>
       </div>
    </div>
  );
};