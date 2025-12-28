import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'flight_booking_welcome_seen';

const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, signInWithGoogle, signInWithApple } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    if (currentUser) {
      return;
    }

    // Check if modal has been shown before
    const hasSeenWelcome = localStorage.getItem(STORAGE_KEY);

    // Check if it's desktop (screen width >= 1024px)
    const isDesktop = window.innerWidth >= 1024;

    // Show modal only on first visit and on desktop
    if (!hasSeenWelcome && isDesktop) {
      // Delay showing modal by 2 seconds for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const handleClose = () => {
    setIsOpen(false);
    // Mark as seen so it doesn't show again
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      handleClose();
      navigate('/');
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithApple();
      handleClose();
      navigate('/');
    } catch (error) {
      console.error('Apple sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = () => {
    handleClose();
    navigate('/register');
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-xl shadow-2xl max-w-[440px] w-full mx-4 animate-slideUp">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <MdClose className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="px-7 py-6">
          {/* Header */}
          <div className="mb-5">
            <h2 className="text-[28px] leading-tight font-bold text-gray-900">
              Hey, friend.
            </h2>
            <h3 className="text-[28px] leading-tight font-bold text-gray-900 mb-3">
              Nice seeing you again<span className="text-orange-500">.</span>
            </h3>
            <p className="text-gray-700 text-[13px] leading-relaxed">
              Sign up to get some great benefits you're missing out on right now:
            </p>
          </div>

          {/* Benefits List */}
          <ul className="space-y-1.5 mb-5 text-[13px] text-gray-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-gray-600 mt-0.5">•</span>
              <span>Cheaper prices with member-only discounts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600 mt-0.5">•</span>
              <span>Fast and easy booking with saved details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600 mt-0.5">•</span>
              <span>Free trip planning, synced to all your devices</span>
            </li>
          </ul>

          {/* Sign Up Buttons */}
          <div className="space-y-3">
            {/* Google and Apple Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-gray-800 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FcGoogle className="w-5 h-5" />
                <span>{loading ? 'Loading...' : 'Google'}</span>
              </button>
              <button
                onClick={handleAppleSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-gray-800 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaApple className="w-5 h-5" />
                <span>{loading ? 'Loading...' : 'Apple'}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-xs text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Email Sign Up */}
            <button
              onClick={handleEmailSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-900 bg-white rounded-md hover:bg-gray-50 transition-colors font-medium text-gray-900 text-[14px]"
            >
              <FaEnvelope className="w-4 h-4" />
              <span>Continue with email</span>
            </button>
          </div>

          {/* Terms */}
          <p className="mt-5 text-[11px] text-gray-500 text-center leading-relaxed">
            By adding your email you accept our{' '}
            <a href="/terms" className="text-blue-600 hover:underline" onClick={handleClose}>
              Terms of Use
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline" onClick={handleClose}>
              Privacy Policy
            </a>
            .
          </p>

          {/* Skip Option */}
          <button
            onClick={handleClose}
            className="mt-3 w-full text-[13px] text-gray-600 hover:text-gray-900 font-medium py-1"
          >
            Maybe later
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WelcomeModal;
