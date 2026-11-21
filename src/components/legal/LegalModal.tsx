import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Shield, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'terms' ? 'Terms of Service' : 'Privacy Policy & Data Protection'}
      size="lg"
    >
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-h-[60vh] overflow-y-auto pr-2">
        {type === 'terms' ? (
          <>
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-xl text-primary font-bold">
              <FileText className="w-5 h-5 flex-shrink-0" />
              <span>FINORA User Agreement & Financial Service Terms</span>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Acceptance of Terms</h4>
            <p>
              By creating an account or accessing the FINORA Smart Personal Finance platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, do not use the application.
            </p>

            <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Account Responsibility & Security</h4>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials, password, and active sessions. You are entirely responsible for all activities that occur under your user identity.
            </p>

            <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Financial Data & Non-Advisory Nature</h4>
            <p>
              FINORA provides tools for personal expense tracking, budgeting, and financial analytics. FINORA does not provide certified financial, investment, legal, or tax advice. Calculations, exchange rates, and metrics are informational.
            </p>

            <h4 className="font-bold text-slate-900 dark:text-white text-sm">4. Multi-Tenant User Isolation</h4>
            <p>
              All user records are isolated through strict PostgreSQL Row Level Security (RLS). Any attempt to probe, bypass, access or tamper with data belonging to other accounts is strictly prohibited and subject to immediate termination.
            </p>

            <h4 className="font-bold text-slate-900 dark:text-white text-sm">5. Termination & Data Deletion</h4>
            <p>
              You may terminate your account at any time through Settings &gt; Danger Zone &gt; Delete Account. Upon deletion, all your personal records, wallets, transactions, and attachments will be permanently removed.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span>Highest Standard Data Privacy & Zero-Knowledge Security</span>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Data Ownership & Sovereignty</h4>
            <p>
              Your personal financial records (income, expenses, budgets, savings goals, receipts) belong entirely to you. FINORA does not sell, lease, monetize, or disclose your financial records to third-party advertisers or external brokers.
            </p>

            <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. How Your Data Is Protected (RLS & Encryption)</h4>
            <p>
              Every financial record is tied to your cryptographic UUID. Access policies are enforced directly at the PostgreSQL database level using Row Level Security (RLS). Storage attachments (receipts) reside in private user-isolated buckets protected by signed expiration tokens.
            </p>

            <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. GDPR & CCPA Compliance Rights</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Right to Access:</strong> View all your stored data anytime through your dashboard.</li>
              <li><strong>Right to Portability:</strong> Export your complete financial history anytime in JSON or CSV.</li>
              <li><strong>Right to Erasure (Be Forgotten):</strong> Request instant permanent deletion of your account and records from Settings.</li>
            </ul>

            <h4 className="font-bold text-slate-900 dark:text-white text-sm">4. Cookies and Local Sessions</h4>
            <p>
              We only use essential session tokens required to authenticate and keep you securely logged into your account.
            </p>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="primary" className="gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>I Understand & Agree</span>
        </Button>
      </div>
    </Modal>
  );
};
