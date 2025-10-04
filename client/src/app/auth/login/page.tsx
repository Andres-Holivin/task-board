"use client";
import { LoginForm } from '@/components/auth/login-form';
import { AuthErrorAlert } from '@/components/auth/auth-error-alert';
import { Card } from '@/components/ui/card';
import { useAuthActions } from '@/hooks/use-auth';

export default function LoginPage() {
  useAuthActions({ enable: false });
  return (
      <div className="flex h-full items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md space-y-6 p-8">
          <AuthErrorAlert />
          <LoginForm />
        </Card>
      </div>
  );
}