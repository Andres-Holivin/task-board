import { RegisterForm } from '@/components/auth/register-form';
import { AuthErrorAlert } from '@/components/auth/auth-error-alert';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="flex h-full items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md space-y-6 p-8">
          <AuthErrorAlert />
          <RegisterForm />
        </Card>
      </div>
    </ProtectedRoute>
  );
}