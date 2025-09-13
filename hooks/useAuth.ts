
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuth: Initializing auth state');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('useAuth: Error getting initial session:', error);
      } else {
        console.log('useAuth: Initial session:', session?.user?.email || 'No session');
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state changed:', event, session?.user?.email || 'No user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      console.log('useAuth: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    console.log('useAuth: Attempting signup for:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        console.error('useAuth: Signup error:', error);
        throw error;
      }

      console.log('useAuth: Signup successful, user:', data.user?.email);

      // Create profile if user was created
      if (data.user && !data.user.email_confirmed_at) {
        console.log('useAuth: Creating profile for new user');
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            first_name: firstName,
            last_name: lastName,
          });

        if (profileError) {
          console.error('useAuth: Profile creation error:', profileError);
          // Don't throw here as the user was created successfully
        } else {
          console.log('useAuth: Profile created successfully');
        }
      }

      return data;
    } catch (error) {
      console.error('useAuth: Signup failed:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('useAuth: Attempting signin for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('useAuth: Signin error:', error);
        throw error;
      }

      console.log('useAuth: Signin successful for:', data.user?.email);
      return data;
    } catch (error) {
      console.error('useAuth: Signin failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('useAuth: Attempting signout');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('useAuth: Signout error:', error);
        throw error;
      }
      console.log('useAuth: Signout successful');
    } catch (error) {
      console.error('useAuth: Signout failed:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    console.log('useAuth: Attempting password reset for:', email);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://natively.dev/email-confirmed',
      });

      if (error) {
        console.error('useAuth: Password reset error:', error);
        throw error;
      }
      console.log('useAuth: Password reset email sent');
    } catch (error) {
      console.error('useAuth: Password reset failed:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
}
