import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { hasPin, verifyPin, savePin } from '@/lib/storage';

interface AuthState {
  isAuthenticated: boolean;
  pinExists: boolean;
  isLoading: boolean;
  authenticate: (pin: string) => Promise<boolean>;
  createPin: (pin: string) => Promise<void>;
  lock: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const LOCK_TIMEOUT_MS = 30_000; // 30 seconds

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinExists, setPinExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const backgroundTimeRef = useRef<number | null>(null);

  useEffect(() => {
    hasPin().then((exists) => {
      setPinExists(exists);
      setIsLoading(false);
    });
  }, []);

  // Auto-lock on background after LOCK_TIMEOUT_MS
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        backgroundTimeRef.current = Date.now();
      } else if (state === 'active' && backgroundTimeRef.current) {
        const elapsed = Date.now() - backgroundTimeRef.current;
        if (elapsed > LOCK_TIMEOUT_MS) {
          setIsAuthenticated(false);
        }
        backgroundTimeRef.current = null;
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, []);

  const authenticate = useCallback(async (pin: string) => {
    const valid = await verifyPin(pin);
    if (valid) setIsAuthenticated(true);
    return valid;
  }, []);

  const createPin = useCallback(async (pin: string) => {
    await savePin(pin);
    setPinExists(true);
    setIsAuthenticated(true);
  }, []);

  const lock = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        pinExists,
        isLoading,
        authenticate,
        createPin,
        lock,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
