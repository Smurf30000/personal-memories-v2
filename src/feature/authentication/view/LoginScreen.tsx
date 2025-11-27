import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { login, loginWithGoogle, resetPassword } from '../controller/useAuth';
import { toast } from 'sonner';
import { useAuthContext } from '../model/AuthContext';

/**
 * Login screen component
 */
export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (error: any) {
      const message = error?.message || 'Invalid email or password';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Successfully logged in with Google!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await resetPassword(email);
      toast.success('Password reset email sent! Check your inbox.');
      setResetMode(false);
    } catch (error: any) {
      const message = error?.message || 'Failed to send password reset email';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="space-y-1 relative">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="absolute left-0 top-0 mt-1 ml-1 text-muted-foreground"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <CardTitle className="text-2xl font-bold text-center">
            {resetMode ? 'Reset Password' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center">
            {resetMode
              ? 'Enter your email to receive a password reset link'
              : 'Sign in to your memories account'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={resetMode ? handlePasswordReset : handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage(null);
                }}
                required
              />
            </div>
            {!resetMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  required
                />
                {errorMessage && (
                  <p className="text-sm text-destructive mt-1" role="alert">
                    {errorMessage}
                  </p>
                )}
              </div>
            )}
            {resetMode && errorMessage && (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? (resetMode ? 'Sending...' : 'Signing in...')
                : (resetMode ? 'Send Reset Link' : 'Sign In')}
            </Button>
            {!resetMode && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                Sign in with Google
              </Button>
            )}
            <button
              type="button"
              onClick={() => {
                setResetMode(!resetMode);
                setErrorMessage(null);
              }}
              className="text-sm text-primary hover:underline"
            >
              {resetMode ? 'Back to sign in' : 'Forgot password?'}
            </button>
            {!resetMode && (
              <p className="text-sm text-muted-foreground text-center">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
