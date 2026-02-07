import React from 'react';
import { motion } from 'framer-motion';
import { CONTACT_EMAIL } from '../utils/constants';

interface LegalPageProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white/90 mb-8 transition-colors"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to ECHOES
        </motion.button>

        <motion.article
          id="main-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-invert prose-amber max-w-none"
        >
          <h1 className="font-serif-display text-3xl md:text-4xl mb-2">Privacy Policy</h1>
          <p className="text-white/60 text-sm mb-8">Last updated: January 19, 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">Our Commitment to Your Privacy</h2>
            <p className="text-white/70 leading-relaxed">
              ECHOES is designed with your privacy and emotional safety as our highest priorities.
              We believe that the vulnerable moments you share deserve the utmost protection.
              This policy explains how we handle your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">What We Collect</h2>
            <div className="space-y-4 text-white/70">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="font-medium text-white/90 mb-2">Emotional Content</h3>
                <p className="text-sm">
                  Your written reflections, voice recordings, images, and drawings are processed
                  by AI to generate personalized responses. <strong className="text-amber-300">This content
                  is never stored on our servers.</strong> Processing happens in real-time and data
                  is immediately discarded after your session.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="font-medium text-white/90 mb-2">Local Storage</h3>
                <p className="text-sm">
                  Session history, drafts, and preferences are stored locally on your device using
                  browser localStorage. This data never leaves your device and can be cleared
                  at any time through your browser settings.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="font-medium text-white/90 mb-2">Analytics (Optional)</h3>
                <p className="text-sm">
                  We collect anonymous usage statistics to improve the app experience.
                  No personal content is ever included in analytics. You can opt out in settings.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">Third-Party Services</h2>
            <p className="text-white/70 leading-relaxed">
              ECHOES uses Google&apos;s Gemini AI for content processing. Your inputs are sent to
              Google&apos;s API with the following protections:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 mt-3">
              <li>Requests are processed in real-time and not retained by Google</li>
              <li>No personally identifiable information is attached to requests</li>
              <li>AI safety filters are applied to all interactions</li>
            </ul>
            <p className="text-white/50 text-sm mt-3">
              See <a href="https://ai.google.dev/terms" className="text-amber-400 hover:underline" target="_blank" rel="noopener noreferrer">Google&apos;s AI Terms</a> for more details.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">Your Rights</h2>
            <ul className="list-disc list-inside text-white/70 space-y-2">
              <li><strong>Access:</strong> View all locally stored data in browser DevTools</li>
              <li><strong>Delete:</strong> Clear all data via browser settings or our in-app option</li>
              <li><strong>Portability:</strong> Export your session history as PDF</li>
              <li><strong>Opt-out:</strong> Disable analytics and optional features anytime</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">Data Security</h2>
            <p className="text-white/70 leading-relaxed">
              We implement industry-standard security measures including HTTPS encryption,
              secure API proxying, and input sanitization. Your emotional content deserves
              the same protection as your financial data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">Children&apos;s Privacy</h2>
            <p className="text-white/70 leading-relaxed">
              ECHOES is not intended for users under 13 years of age. We do not knowingly
              collect information from children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">Contact Us</h2>
            <p className="text-white/70">
              Questions about privacy? Reach out at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </motion.article>
      </div>
    </div>
  );
};

export const TermsOfService: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white/90 mb-8 transition-colors"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to ECHOES
        </motion.button>

        <motion.article
          id="main-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-invert prose-amber max-w-none"
        >
          <h1 className="font-serif-display text-3xl md:text-4xl mb-2">Terms of Service</h1>
          <p className="text-white/60 text-sm mb-8">Last updated: January 19, 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">Welcome to ECHOES</h2>
            <p className="text-white/70 leading-relaxed">
              By using ECHOES, you agree to these terms. Please read them carefully.
              ECHOES is an emotional wellness tool designed to help you process and
              transform difficult emotions through AI-guided reflection.
            </p>
          </section>

          <section className="mb-8 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <h2 className="text-xl font-serif-display text-rose-300">⚠️ Important Disclaimer</h2>
            <p className="text-white/80 leading-relaxed">
              <strong>ECHOES is NOT a substitute for professional mental health care.</strong>
              It is a creative wellness tool for emotional processing. If you are experiencing
              a mental health crisis, suicidal thoughts, or need immediate help, please contact:
            </p>
            <ul className="list-none mt-3 space-y-2 text-white/70">
              <li>• <strong>National Suicide Prevention Lifeline:</strong> 988</li>
              <li>• <strong>Crisis Text Line:</strong> Text HOME to 741741</li>
              <li>• <strong>International Association for Suicide Prevention:</strong> <a href="https://www.iasp.info/resources/Crisis_Centres/" className="text-amber-400 hover:underline">Find a crisis center</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">Acceptable Use</h2>
            <p className="text-white/70 leading-relaxed mb-3">
              ECHOES is designed for personal emotional wellness. You agree NOT to:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to harm or exploit the AI system</li>
              <li>Share content that promotes violence or hatred</li>
              <li>Use the service on behalf of others without their consent</li>
              <li>Reverse engineer or attempt to extract the AI models</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">Your Content</h2>
            <p className="text-white/70 leading-relaxed">
              You retain ownership of all content you create with ECHOES. By using the service,
              you grant us a limited license to process your content through AI systems solely
              for the purpose of providing the service. We do not store, share, or use your
              emotional content for any other purpose.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">AI-Generated Content</h2>
            <p className="text-white/70 leading-relaxed">
              The reflections, rituals, and visualizations generated by ECHOES are created by AI
              and should be understood as creative interpretations, not clinical advice.
              AI outputs may occasionally be inaccurate, unexpected, or inappropriate.
              You acknowledge this inherent limitation of AI systems.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">Limitation of Liability</h2>
            <p className="text-white/70 leading-relaxed">
              ECHOES is provided &quot;as is&quot; without warranties of any kind. We are not liable for
              any emotional distress, decisions made, or actions taken based on AI-generated content.
              Use this tool as part of a broader wellness practice, not as your sole support system.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">Changes to Terms</h2>
            <p className="text-white/70 leading-relaxed">
              We may update these terms from time to time. Continued use of ECHOES after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-serif-display text-amber-200/90">Contact</h2>
            <p className="text-white/70">
              Questions about these terms? Contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </motion.article>
      </div>
    </div>
  );
};
