import React from "react";
import { FadeIn } from "../components/FadeIn";
import { Scale, ShieldAlert, AlertTriangle, Users, FileText, ArrowLeft } from "lucide-react";
import { LogoIcon } from "../components/Logo";
import { TabType } from "../types";

export const TermsView = ({ navigate, previousTab }: { navigate: (tab: TabType) => void, previousTab?: TabType | "gallery" }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <FadeIn direction="down" className="text-center mb-12 relative">
        <button 
          onClick={() => navigate(previousTab || "home")}
          className="absolute left-0 top-0 flex items-center gap-2 text-slate-500 hover:text-eggplant dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-bold hidden sm:inline">Back</span>
        </button>
        <LogoIcon className="w-16 h-16 mb-6 mx-auto" />
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Last Updated: March 2026
        </p>
      </FadeIn>

      <div className="space-y-12">
        {/* Section 1: Acceptance & Nature of Platform */}
        <FadeIn delay={100}>
          <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-accent-orange w-6 h-6" />
              <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">1. Medical Disclaimer & Acceptance</h2>
            </div>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                By accessing or using UpwardEase, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.
              </p>
              <p className="font-bold text-eggplant dark:text-teal-300 bg-eggplant/5 dark:bg-teal-900/20 p-4 rounded-xl border border-eggplant/10 dark:border-teal-800">
                CRITICAL NOTICE: UpwardEase is a peer-to-peer support and story-sharing platform. It is NOT a substitute for professional medical advice, diagnosis, or psychiatric treatment. None of the content on this site should be treated as medical instruction. If you are in crisis, please dial 988 or contact your local emergency services immediately.
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Section 2: Normal Users (Uploaders & Viewers) */}
        <FadeIn delay={200}>
          <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-accent-green w-6 h-6" />
              <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">2. User Conduct & Content Guidelines</h2>
            </div>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                As a user (viewer or video uploader) of UpwardEase, you agree to adhere to the following strict guidelines:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Zero Tolerance for Bullying:</strong> Harassment, hate speech, discrimination, and bullying will result in an immediate and permanent ban.</li>
                <li><strong>No Harmful Content:</strong> You may not upload content that promotes, encourages, or provides instructions on self-harm, violence, or illegal acts.</li>
                <li><strong>Content Ownership & License:</strong> You retain ownership of the videos you upload. However, by uploading, you grant UpwardEase a worldwide, royalty-free license to host, display, and distribute your content within the platform.</li>
                <li><strong>Privacy:</strong> Do not share the private information (doxxing) of yourself or others.</li>
              </ul>
            </div>
          </section>
        </FadeIn>

        {/* Section 3: Volunteer Admins */}
        <FadeIn delay={300}>
          <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="text-eggplant dark:text-teal-400 w-6 h-6" />
              <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">3. Volunteer Moderator (Admin) Terms</h2>
            </div>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Users granted "Admin" or "Moderator" status are volunteers trusted to keep the community safe. If you are an Admin, you are strictly bound by the following:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Confidentiality:</strong> You will have access to pending videos and user reports. You must NEVER download, share, or distribute user content outside of the UpwardEase platform.</li>
                <li><strong>Objective Moderation:</strong> You must enforce the community guidelines impartially, without personal bias or discrimination.</li>
                <li><strong>No Abuse of Power:</strong> Using admin privileges to harass users, unfairly target specific individuals, or manipulate platform content will result in immediate revocation of privileges and a permanent ban.</li>
                <li><strong>Mandatory Reporting:</strong> If a video indicates an immediate, credible threat to life, admins must follow the internal escalation protocol to notify appropriate authorities.</li>
              </ul>
            </div>
          </section>
        </FadeIn>

        {/* Section 4: Moderation & Termination */}
        <FadeIn delay={400}>
          <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-slate-500 w-6 h-6" />
              <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">4. Moderation Rights & Termination</h2>
            </div>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                UpwardEase reserves the right, at our sole discretion, to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Review, reject, or remove any content submitted to the platform without prior notice.</li>
                <li>Suspend or terminate the account of any user or admin who violates these Terms of Service.</li>
                <li>Modify or discontinue the platform (or any part thereof) with or without notice.</li>
              </ul>
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
};
