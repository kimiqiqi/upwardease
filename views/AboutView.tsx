import React from "react";
import { FadeIn } from "../components/FadeIn";
import { Shield, Heart, Users, Video, Upload, MessageCircle } from "lucide-react";

export const AboutView = () => {
  return (
    <div className="space-y-24 py-12">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto">
        <FadeIn direction="down">
          <h1 className="font-serif text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Our Mission & How We Help
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            UpwardEase is dedicated to creating a safe, supportive digital space where students can share their experiences, find balance, and realize they are never alone in their struggles.
          </p>
        </FadeIn>
      </div>

      {/* Mission Section */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          {
            icon: <Shield className="w-10 h-10 text-eggplant dark:text-teal-300" />,
            title: "Safe Environment",
            desc: "Every video is reviewed to ensure our community remains a positive, troll-free zone for vulnerable sharing."
          },
          {
            icon: <Users className="w-10 h-10 text-eggplant dark:text-teal-300" />,
            title: "Peer Connection",
            desc: "We believe the best advice often comes from those who are walking the exact same path as you right now."
          },
          {
            icon: <Heart className="w-10 h-10 text-eggplant dark:text-teal-300" />,
            title: "Mental Wellness",
            desc: "Our ultimate goal is to reduce student anxiety and promote healthy coping mechanisms through shared stories."
          }
        ].map((item, idx) => (
          <FadeIn key={idx} delay={idx * 150}>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 h-full text-center">
              <div className="w-20 h-20 bg-cream dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-4">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* How the System Works - Alternating Layout */}
      <div className="max-w-6xl mx-auto space-y-24">
        <div className="text-center mb-16">
          <FadeIn>
            <h2 className="font-serif text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How the System Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              A simple, secure process designed to amplify student voices and foster genuine connections.
            </p>
          </FadeIn>
        </div>

        {/* Step 1 */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 order-2 md:order-1">
            <FadeIn direction="right">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-accent-green text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
                <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Record Your Story</h3>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Whether you've found a great way to manage exam stress, or you just want to vent about a difficult week, your voice matters. Use our simple upload tool to share a short video. You can choose to show your face or keep it anonymous—whatever makes you comfortable.
              </p>
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-3"><Video className="w-5 h-5 text-accent-green" /> Share study tips or personal experiences</li>
                <li className="flex items-center gap-3"><Video className="w-5 h-5 text-accent-green" /> Keep it real and authentic</li>
                <li className="flex items-center gap-3"><Video className="w-5 h-5 text-accent-green" /> Option to remain anonymous</li>
              </ul>
            </FadeIn>
          </div>
          <div className="flex-1 order-1 md:order-2 w-full">
            <FadeIn direction="left">
              <img 
                src="https://picsum.photos/seed/record/800/600" 
                alt="Student recording a video" 
                className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3]"
                referrerPolicy="no-referrer"
              />
            </FadeIn>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 w-full">
            <FadeIn direction="right">
              <img 
                src="https://picsum.photos/seed/review/800/600" 
                alt="Admin reviewing content" 
                className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3]"
                referrerPolicy="no-referrer"
              />
            </FadeIn>
          </div>
          <div className="flex-1">
            <FadeIn direction="left">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-accent-orange text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
                <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Safe Review Process</h3>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Safety is our top priority. Before any video goes live on the gallery, it passes through our administrative review system. This ensures that all content aligns with our community guidelines, preventing bullying, inappropriate content, or harmful advice.
              </p>
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-3"><Upload className="w-5 h-5 text-accent-orange" /> Human-led moderation</li>
                <li className="flex items-center gap-3"><Upload className="w-5 h-5 text-accent-orange" /> Strict anti-bullying policies</li>
                <li className="flex items-center gap-3"><Upload className="w-5 h-5 text-accent-orange" /> Constructive environment guaranteed</li>
              </ul>
            </FadeIn>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 order-2 md:order-1">
            <FadeIn direction="right">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-eggplant text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
                <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Connect & Support</h3>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Once approved, your video joins our gallery where other students can watch, learn, and find comfort. Viewers can star videos they find helpful and leave supportive comments, creating a positive feedback loop of peer encouragement.
              </p>
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-3"><MessageCircle className="w-5 h-5 text-eggplant dark:text-teal-300" /> Discover relatable stories</li>
                <li className="flex items-center gap-3"><MessageCircle className="w-5 h-5 text-eggplant dark:text-teal-300" /> Build a supportive network</li>
                <li className="flex items-center gap-3"><MessageCircle className="w-5 h-5 text-eggplant dark:text-teal-300" /> Realize you are not alone</li>
              </ul>
            </FadeIn>
          </div>
          <div className="flex-1 order-1 md:order-2 w-full">
            <FadeIn direction="left">
              <img 
                src="https://picsum.photos/seed/connect/800/600" 
                alt="Students connecting online" 
                className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3]"
                referrerPolicy="no-referrer"
              />
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
};
