import { createContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase/config';

export const AuthContext = createContext();






export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const signup = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  };

  
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  };

  
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    
    provider.setCustomParameters({
      prompt: 'select_account',
      
      login_hint: '',
      
      access_type: 'offline'
    });
    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error de autenticación con Google:", error);
      throw error;
    }
  };

  
  const loginWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    
    provider.setCustomParameters({
      display: 'popup'
    });
    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error de autenticación con Facebook:", error);
      throw error;
    }
  };

  
  const loginWithMicrosoft = async () => {
    const provider = new OAuthProvider('microsoft.com');
    
    provider.setCustomParameters({
      prompt: 'select_account',
      login_hint: ''
    });
    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error de autenticación con Microsoft:", error);
      throw error;
    }
  };

  
  const logout = () => {
    return signOut(auth);
  };

  
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  
  const isAdmin = () => {
    return currentUser?.email === 'admingameshop@gmail.com';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    loginWithFacebook,
    loginWithMicrosoft,
    logout,
    resetPassword,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 