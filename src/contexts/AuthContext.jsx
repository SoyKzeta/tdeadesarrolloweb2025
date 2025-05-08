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

// El hook useAuth se ha movido a ./useAuth.js
// export const useAuth = () => {
//   return useContext(AuthContext);
// };

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Registro con email y contraseña
  const signup = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  };

  // Inicio de sesión con email y contraseña
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  };

  // Inicio de sesión con Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Añadir configuraciones adicionales para mejorar compatibilidad
    provider.setCustomParameters({
      prompt: 'select_account',
      // Solución para problemas de COOP
      login_hint: '',
      // Habilitar acceso sin obstáculos
      access_type: 'offline'
    });
    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error de autenticación con Google:", error);
      throw error;
    }
  };

  // Inicio de sesión con Facebook
  const loginWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    // Añadir configuraciones adicionales para mejorar compatibilidad
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

  // Inicio de sesión con Microsoft
  const loginWithMicrosoft = async () => {
    const provider = new OAuthProvider('microsoft.com');
    // Añadir configuraciones adicionales para mejorar compatibilidad
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

  // Cerrar sesión
  const logout = () => {
    return signOut(auth);
  };

  // Restablecer contraseña
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Verificar si el usuario es administrador
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