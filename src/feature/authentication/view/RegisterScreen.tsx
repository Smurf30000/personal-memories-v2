import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { signup, loginWithGoogle } from '../controller/useAuth';
import { toast } from 'sonner';
import { useAuthContext } from '../model/AuthContext';

/**
 * Register screen component
 */
export const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await signup(email, password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      const message = error?.message || 'Failed to create account';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Account created successfully with Google!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
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
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Start preserving your memories today
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMessage(null);
                }}
                required
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              Sign up with Google
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
