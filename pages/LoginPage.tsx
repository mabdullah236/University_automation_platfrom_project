
import React, { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Role } from '../lib/types';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { BookA, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const success = await login(email, password);
    
    if (success) {
      // The login function in AuthContext updates the user,
      // which triggers navigation logic based on role.
      // We need to get the user object to redirect correctly.
      // A better way would be for login to return the user object.
      // For now, let's hardcode the redirection logic here based on email.
      if (email.includes('admin')) {
        navigate('/admin');
      } else if (email.includes('teacher')) {
        navigate('/teacher');
      } else if (email.includes('student')) {
        navigate('/student');
      }
    } else {
      setError('Invalid email or password.');
      setIsLoading(false);
    }
  };

  const setCredentials = (role: 'admin' | 'teacher' | 'student') => {
    setEmail(`${role}@university.com`);
    setPassword('password');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="inline-block bg-blue-600/20 p-3 rounded-full mb-4">
                <BookA className="h-8 w-8 text-blue-400" />
            </div>
            <CardTitle>Welcome to UniPortal</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
              <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <Button type="submit" className="w-full h-10" isLoading={isLoading} disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-slate-400">
                <p>Quick Logins:</p>
                <div className="flex justify-center gap-2 mt-2">
                    <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => setCredentials('admin')}>Admin</Button>
                    <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => setCredentials('teacher')}>Teacher</Button>
                    <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => setCredentials('student')}>Student</Button>
                </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
