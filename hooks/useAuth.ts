
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

        // When user confirms email, create/update their profile
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('useAuth: User signed in, checking profile');
          await ensureProfileExists(session.user);
        }
      }
    );

    return () => {
      console.log('useAuth: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const ensureProfileExists = async (user: User) => {
    try {
      console.log('useAuth: Ensuring profile exists for user:', user.email);
      
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('useAuth: Error fetching profile:', fetchError);
        return;
      }

      if (!existingProfile) {
        // Profile doesn't exist, create it
        console.log('useAuth: Creating new profile');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || null,
            last_name: user.user_metadata?.last_name || null,
          });

        if (insertError) {
          console.error('useAuth: Error creating profile:', insertError);
        } else {
          console.log('useAuth: Profile created successfully');
        }
      } else if (!existingProfile.first_name && user.user_metadata?.first_name) {
        // Profile exists but missing name data, update it
        console.log('useAuth: Updating profile with user metadata');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: user.user_metadata.first_name,
            last_name: user.user_metadata.last_name,
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('useAuth: Error updating profile:', updateError);
        } else {
          console.log('useAuth: Profile updated successfully');
        }
      }
    } catch (error) {
      console.error('useAuth: Error in ensureProfileExists:', error);
    }
  };

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
      console.log('useAuth: User metadata:', data.user?.user_metadata);

      // Note: Profile will be created automatically when user confirms email
      // via the onAuthStateChange listener above

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
