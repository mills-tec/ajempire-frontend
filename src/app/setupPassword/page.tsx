'use client'

import { updateAdminSecuritySettings } from '@/lib/adminapi';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

const SetupPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
    }
  }, [token]);

  const passwordRegex = /^.{6,}$/; // Min 6 characters
  const isValidPassword = passwordRegex.test(password);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invitation token is missing or invalid. Please check your link.');
      return;
    }

    if (!isValidPassword) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Ensure the token is set in localStorage before calling the API
      localStorage.setItem('adminToken', token);

      // cast to any because AdminSecuritySettings type may differ across backend API defs
      const response = await updateAdminSecuritySettings({
        password,
        confirmPassword
      } as any);

      // API returns status: true or success: true or a message containing successfully
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (response.success || response.message?.includes('successfully') || (response as any).status === true) {
        toast.success('Password updated successfully! You can now log in.');
        // Clean up the temporary token
        localStorage.removeItem('adminToken');
        // Redirect to login
        router.push('/admin-login');
      } else {
        toast.error(response.error || 'Failed to update password. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Password setup error:', error);
      toast.error((error instanceof Error ? error.message : null) || 'An error occurred during password setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-poppins">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Image
          src="/Asset 36 1.png"
          alt="AJ Empire Logo"
          width={80}
          height={67}
          className="object-contain mb-6"
          priority
        />
        <h2 className="text-center text-3xl font-extrabold text-brand_gray_dark">
          Setup Admin Password
        </h2>
        <p className="mt-2 text-center text-sm text-[#8B8D97]">
          {email ? `Setting up account for ${email}` : 'Complete your registration by setting up your password.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-2xl sm:px-10 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand_gray_dark mb-2">
                New Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#6E7079]" aria-hidden="true" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-[#EFF1F9]/50 focus:outline-none focus:ring-2 focus:ring-brand_pink focus:bg-white transition-all text-sm"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-brand_gray hover:text-brand_pink transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-brand_gray hover:text-brand_pink transition-colors" />
                  )}
                </button>
              </div>
              {password && !isValidPassword && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Password must be at least 6 characters long.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand_gray_dark mb-2">
                Confirm Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#6E7079]" aria-hidden="true" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-[#EFF1F9]/50 focus:outline-none focus:ring-2 focus:ring-brand_pink focus:bg-white transition-all text-sm"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-brand_gray hover:text-brand_pink transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-brand_gray hover:text-brand_pink transition-colors" />
                  )}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Passwords do not match.
                </p>
              )}
              {confirmPassword && passwordsMatch && isValidPassword && (
                <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Passwords match!
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !isValidPassword || !passwordsMatch}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-b from-primaryhover to-brand_solid_gradient hover:from-brand_solid_gradient hover:to-primaryhover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand_pink disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Setting up password...
                  </div>
                ) : (
                  'Setup Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand_pink"></div>
      </div>
    }>
      <SetupPasswordContent />
    </Suspense>
  );
}
