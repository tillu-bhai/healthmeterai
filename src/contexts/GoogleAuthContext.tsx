import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface GoogleAuthContextType {
  user: GoogleUser | null;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1042740307142-95cptcq3kga26su5si94015h39q6f2gg.apps.googleusercontent.com";
const STORAGE_KEY = "google_user";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}

function decodeJwtPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Handle Google credential response
  const handleCredentialResponse = useCallback((response: any) => {
    const payload = decodeJwtPayload(response.credential);
    if (payload) {
      const googleUser: GoogleUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
      setUser(googleUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
    }
  }, []);

  // Load Google Identity script
  useEffect(() => {
    if (window.google) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Don't remove script on cleanup as it might be needed
    };
  }, []);

  // Initialize Google Identity after script loads
  useEffect(() => {
    if (!scriptLoaded || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
    });
  }, [scriptLoaded, handleCredentialResponse]);

  const signIn = useCallback(() => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  }, []);

  const signOut = useCallback(() => {
    if (user && window.google) {
      window.google.accounts.id.revoke(user.email, () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      });
    } else {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  return (
    <GoogleAuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </GoogleAuthContext.Provider>
  );
}

export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error("useGoogleAuth must be used within a GoogleAuthProvider");
  }
  return context;
}

// Component to render Google Sign-In button
export function GoogleSignInButton({ className }: { className?: string }) {
  const { isLoading } = useGoogleAuth();

  useEffect(() => {
    if (!window.google) return;

    const buttonElement = document.getElementById("google-signin-button");
    if (buttonElement) {
      window.google.accounts.id.renderButton(buttonElement, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "signin_with",
        shape: "rectangular",
      });
    }
  }, [isLoading]);

  return (
    <div
      id="google-signin-button"
      className={className}
      style={{ minHeight: "44px" }}
    />
  );
}
