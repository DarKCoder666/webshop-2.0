'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/auth-store';
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { debugCookies, checkCorsAndCookieCompatibility } from '@/lib/cookie-utils';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    login: '',
    password: '',
  });
  
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/builder');
    }
  }, [isAuthenticated, router]);

  // Debug cookies and CORS on component mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Login page debugging:');
      debugCookies();
      checkCorsAndCookieCompatibility();
    }
  }, []);

  // Clear error when credentials change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [credentials.login, credentials.password, clearError, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.login || !credentials.password) {
      return;
    }

    console.log('🚀 Starting login process...');
    debugCookies(); // Check cookies before login
    
    const success = await login(credentials);
    
    if (success) {
      console.log('✅ Login successful!');
      debugCookies(); // Check cookies after login
      
      // Small delay to ensure cookies are processed
      setTimeout(() => {
        console.log('🔄 Redirecting to builder...');
        router.replace('/builder');
      }, 500);
    } else {
      console.log('❌ Login failed');
      debugCookies(); // Check what cookies we have after failed login
    }
  };

  const handleChange = (field: 'login' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-8 lg:px-12">
          <div className="grid min-h-[calc(100vh-6rem)] items-center gap-12 md:grid-cols-2">
            {/* Left side - Hero content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <AnimatedGroup preset="blur-slide" as="h1" className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  Admin Access
                </AnimatedGroup>
                <AnimatedGroup preset="blur-slide" as="h2" className="text-primary text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                  Builder Dashboard
                </AnimatedGroup>
              </div>

              <AnimatedGroup preset="blur" as="p" className="text-base leading-7 text-muted-foreground md:text-lg">
                Sign in to access the website builder and manage your content, layouts, and settings.
              </AnimatedGroup>
            </div>

            {/* Right side - Login form */}
            <div className="relative">
              <AnimatedGroup preset="zoom" as="div" className="relative mx-auto w-full max-w-md">
                <div className="absolute -inset-2 -z-10 rounded-[28px] bg-gradient-to-b from-primary/20 via-card to-card blur-2xl" />
                <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-foreground">Sign In</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Enter your admin credentials
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                        {error}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="login" className="block text-sm font-medium text-foreground mb-2">
                          Username
                        </label>
                        <Input
                          id="login"
                          type="text"
                          value={credentials.login}
                          onChange={handleChange('login')}
                          placeholder="Enter your username"
                          required
                          disabled={isLoading}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                          Password
                        </label>
                        <Input
                          id="password"
                          type="password"
                          value={credentials.password}
                          onChange={handleChange('password')}
                          placeholder="Enter your password"
                          required
                          disabled={isLoading}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-lg text-base font-semibold"
                      disabled={isLoading || !credentials.login || !credentials.password}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </div>
      </section>

      {/* Background image for aesthetic purposes */}
      <div className="fixed inset-0 -z-20 opacity-5">
        <Image
          src="/random2.jpeg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
