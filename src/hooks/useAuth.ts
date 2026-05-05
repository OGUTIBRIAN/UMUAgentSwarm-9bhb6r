import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface StaffUser {
  id: string;
  email: string;
  username: string;
  campusId: string | null;
  campusName: string | null;
  role: string;
}

interface AuthContextType {
  user: StaffUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

function mapUser(supabaseUser: User, profile: { campus_id: string | null; role: string; username: string | null }): StaffUser {
  const CAMPUS_NAMES: Record<string, string> = {
    nkozi: 'Nkozi Main Campus',
    lubaga: 'Lubaga Campus',
    nsambya: 'Nsambya Campus',
    fortportal: 'Fort Portal Campus',
    masaka: 'Masaka Campus',
    ngetta: 'Ngetta Campus',
    mbale: 'Mbale Campus',
  };
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    username: profile.username || supabaseUser.user_metadata?.username || supabaseUser.email!.split('@')[0],
    campusId: profile.campus_id,
    campusName: profile.campus_id ? CAMPUS_NAMES[profile.campus_id] ?? profile.campus_id : null,
    role: profile.role || 'staff',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (supabaseUser: User) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('campus_id, role, username')
      .eq('id', supabaseUser.id)
      .single();
    return data ?? { campus_id: null, role: 'staff', username: null };
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (mounted && session?.user) {
        const profile = await fetchProfile(session.user);
        if (mounted) setUser(mapUser(session.user, profile));
      }
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(mapUser(session.user, profile));
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(mapUser(session.user, profile));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
