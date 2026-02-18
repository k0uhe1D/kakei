import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously as firebaseSignInAnonymously,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  linkWithCredential,
  linkWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../config/firebase";

const AuthContext = createContext(null);

const MAGIC_LINK_EMAIL_KEY = "kakei_magic_link_email";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [magicLinkCompleting, setMagicLinkCompleting] = useState(false);

  // Handle magic link redirect on page load
  const completeMagicLinkIfNeeded = useCallback(async () => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return false;

    setMagicLinkCompleting(true);
    try {
      let email = window.localStorage.getItem(MAGIC_LINK_EMAIL_KEY);
      if (!email) {
        email = window.prompt("確認のためメールアドレスを入力してください");
      }
      if (!email) {
        setMagicLinkCompleting(false);
        return false;
      }

      // If currently anonymous, link instead of creating new account
      if (auth.currentUser?.isAnonymous) {
        const credential = EmailAuthProvider.credentialWithLink(email, window.location.href);
        await linkWithCredential(auth.currentUser, credential);
      } else {
        await signInWithEmailLink(auth, email, window.location.href);
      }

      window.localStorage.removeItem(MAGIC_LINK_EMAIL_KEY);
      // Clean URL
      window.history.replaceState(null, "", window.location.pathname);
      return true;
    } catch (err) {
      console.error("Magic link sign-in failed:", err);
      return false;
    } finally {
      setMagicLinkCompleting(false);
    }
  }, []);

  useEffect(() => {
    completeMagicLinkIfNeeded();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, [completeMagicLinkIfNeeded]);

  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signUp = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const signInWithGoogle = async () => {
    // If anonymous, link Google account
    if (auth.currentUser?.isAnonymous) {
      return linkWithPopup(auth.currentUser, new GoogleAuthProvider());
    }
    return signInWithPopup(auth, new GoogleAuthProvider());
  };

  const signInAsGuest = () => firebaseSignInAnonymously(auth);

  const sendMagicLink = async (email) => {
    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem(MAGIC_LINK_EMAIL_KEY, email);
  };

  const linkEmailPassword = async (email, password) => {
    if (!auth.currentUser?.isAnonymous) throw new Error("Not anonymous");
    const credential = EmailAuthProvider.credential(email, password);
    return linkWithCredential(auth.currentUser, credential);
  };

  const signOut = () => firebaseSignOut(auth);

  const isAnonymous = user?.isAnonymous ?? false;

  return (
    <AuthContext.Provider value={{
      user, loading, magicLinkCompleting, isAnonymous,
      signIn, signUp, signInWithGoogle, signInAsGuest,
      sendMagicLink, linkEmailPassword, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
