import React, { useState } from "react";
import { Mail, Phone, AlertTriangle, HeartHandshake, ShieldAlert, Send, CheckCircle2 } from "lucide-react";
import { FadeIn } from "../components/FadeIn";
import { UserType, ContactMessageType } from "../types";

export const ContactView = ({ 
  user, 
  setContactMessages 
}: { 
  user: UserType, 
  setContactMessages: React.Dispatch<React.SetStateAction<ContactMessageType[]>> 
}) => {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newMessage: ContactMessageType = {
        id: `msg-${Date.now()}`,
        name,
        email,
        subject,
        message,
        status: "unread",
        createdAt: new Date().toISOString(),
        userId: user?.id
      };
      
      setContactMessages(prev => [newMessage, ...prev]);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form
      setSubject("");
      setMessage("");
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
       <FadeIn direction="down" className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">Get in Touch & Support</h2>
          <p className="text-slate-600 dark:text-slate-300">We're here to help, but please remember we are a peer-sharing platform, not a medical service.</p>
       </FadeIn>

       <div className="grid md:grid-cols-2 gap-6 mb-12">
          <FadeIn delay={100} className="h-full">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                    <Mail size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-2xl text-slate-900 dark:text-white mb-2">Email Us Directly</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">For general inquiries, feedback, and platform support, you can email us anytime.</p>
                    <a href="mailto:upwardease.contact@gmail.com" className="text-eggplant dark:text-teal-400 font-bold hover:underline text-lg">upwardease.contact@gmail.com</a>
                </div>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-6">Send a Message</h3>
                
                {isSuccess ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center min-h-[250px]">
                        <CheckCircle2 className="text-green-500 mb-4" size={48} />
                        <h4 className="font-bold text-green-900 dark:text-green-300 text-lg mb-2">Message Sent!</h4>
                        <p className="text-green-700 dark:text-green-400 text-sm">Thank you for reaching out. We'll get back to you soon.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-eggplant outline-none transition-all"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-eggplant outline-none transition-all"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                            <input 
                                type="text" 
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-eggplant outline-none transition-all"
                                placeholder="What is this regarding?"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                            <textarea 
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-eggplant outline-none transition-all min-h-[120px] resize-y"
                                placeholder="How can we help you?"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || !name || !email || !subject || !message}
                            className="w-full bg-eggplant text-white font-bold py-3 rounded-xl hover:bg-eggplant/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><Send size={18} /> Send Message</>
                            )}
                        </button>
                    </form>
                )}
            </div>
          </FadeIn>
       </div>

       <FadeIn delay={200}>
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                  <ShieldAlert className="text-red-600 dark:text-red-400" size={28} />
                  <h3 className="text-2xl font-serif font-bold text-red-900 dark:text-red-300">Crisis Resources</h3>
              </div>
              <p className="text-red-800 dark:text-red-200 mb-6 font-medium">
                  If you or someone you know is in immediate danger or experiencing a mental health crisis, please reach out to professional help immediately. UpwardEase is not a substitute for professional medical advice, diagnosis, or treatment.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/20">
                      <div className="flex items-center gap-3 mb-2">
                          <Phone className="text-red-500" size={20} />
                          <h4 className="font-bold text-slate-900 dark:text-white">Suicide & Crisis Lifeline</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Available 24/7, free and confidential support.</p>
                      <a href="tel:988" className="inline-block bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Dial 988</a>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/20">
                      <div className="flex items-center gap-3 mb-2">
                          <HeartHandshake className="text-red-500" size={20} />
                          <h4 className="font-bold text-slate-900 dark:text-white">Crisis Text Line</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Text HOME to connect with a volunteer Crisis Counselor.</p>
                      <a href="sms:741741" className="inline-block bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Text 741741</a>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/20 sm:col-span-2">
                      <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="text-red-500" size={20} />
                          <h4 className="font-bold text-slate-900 dark:text-white">The Trevor Project</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Information & support to LGBTQ young people 24/7, all year round.</p>
                      <div className="flex gap-3">
                          <a href="tel:8664887386" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Call 866-488-7386</a>
                          <a href="sms:678678" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Text START to 678-678</a>
                      </div>
                  </div>
              </div>
          </div>
       </FadeIn>
       
       <FadeIn delay={300}>
           <div className="text-center text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
               <p><strong>Medical Disclaimer:</strong> The content on UpwardEase is provided for educational and peer-support purposes only. It is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
           </div>
       </FadeIn>
    </div>
  );
};