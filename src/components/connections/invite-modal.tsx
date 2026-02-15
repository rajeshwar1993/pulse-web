'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ConnectionService } from '@/lib/services/connection-service';
import type { InviteCode } from '@/lib/types/connection';

interface InviteModalProps {
  onClose: () => void;
}

export function InviteModal({ onClose }: InviteModalProps) {
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateCode();
  }, []);

  const generateCode = async () => {
    setIsLoading(true);
    try {
      const code = await ConnectionService.generateInviteCode();
      setInviteCode(code);
    } catch (error) {
      console.error('Failed to generate invite code:', error);
      alert('Failed to generate invite code');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteCode) return;

    const inviteUrl = `pulse://invite?code=${inviteCode.code}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInvite = async () => {
    if (!inviteCode) return;

    const inviteUrl = `pulse://invite?code=${inviteCode.code}`;
    const shareText = `Join me on Pulse! Use code: ${inviteCode.code}\nOr click: ${inviteUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Pulse',
          text: shareText,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback to copy
      await copyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Invite Connection
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-300"></div>
          </div>
        ) : inviteCode ? (
          <>
            {/* QR Code */}
            <div className="bg-slate-50 rounded-lg p-8 mb-6 flex justify-center">
              <QRCodeSVG
                value={`pulse://invite?code=${inviteCode.code}`}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Invite Code */}
            <div className="mb-6">
              <label className="block text-sm text-slate-600 mb-2">
                Invite Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteCode.code}
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-50 rounded-lg font-mono text-lg text-center tracking-wider"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-3 bg-slate-200 hover:bg-slate-300 rounded-lg"
                  title="Copy code"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>

            {/* Expiry Info */}
            <p className="text-sm text-slate-500 text-center mb-6">
              Expires in 30 days • One-time use
            </p>

            {/* Share Button */}
            <button
              onClick={shareInvite}
              className="w-full bg-teal-300 text-white py-4 rounded-lg font-semibold hover:bg-teal-400 transition-colors"
            >
              Share Invite
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
