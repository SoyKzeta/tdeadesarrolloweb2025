import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/components.css';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth.js';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CartProvider } from './contexts/CartContext';


import MainLayout from './layouts/MainLayout';


import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Game from './pages/Game';
import Games from './pages/Games';
import CategoryGames from './pages/CategoryGames';
import PlatformGames from './pages/PlatformGames';
import Accessories from './pages/Accessories';
import GiftCards from './pages/GiftCards';
import SearchResults from './pages/SearchResults';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
import Deals from './pages/Deals';
import Profile from './pages/Profile';
import Orders from './pages/Orders';


import PlayStation5 from './pages/platforms/PlayStation5';
import PlayStation4 from './pages/platforms/PlayStation4';
import Nintendo from './pages/platforms/Nintendo';
import PCGaming from './pages/platforms/PCGaming';
import Xbox from './pages/platforms/Xbox';


import GameForm from './pages/admin/GameForm';
import CategoryForm from './pages/admin/CategoryForm';
import PlatformForm from './pages/admin/PlatformForm';
import AccessoryForm from './pages/admin/AccessoryForm';
import GiftCardForm from './pages/admin/GiftCardForm';


import { initializeDatabase } from './firebase/migrations';


const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, isAdmin } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" />;
  }
  
  return children;
};


const DatabaseInitializer = () => {
  useEffect(() => {
    const initDb = async () => {
      try {
        console.log('Inicializando automáticamente la base de datos...');
        await initializeDatabase();
        console.log('Base de datos inicializada correctamente');
        toast.success('Base de datos inicializada correctamente', {
          position: "bottom-right",
          autoClose: 3000
        });
      } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        toast.error('Error al inicializar la base de datos', {
          position: "bottom-right",
          autoClose: 5000
        });
      }
    };
    
    initDb();
  }, []);
  
  return null; 
};

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                
                
                <Route path="games" element={<Games />} />
                <Route path="game/:slug" element={<Game />} />
                <Route path="category/:slug" element={<CategoryGames />} />
                <Route path="platform/:slug" element={<PlatformGames />} />
                
                
                <Route path="ps5" element={<PlayStation5 />} />
                <Route path="ps4" element={<PlayStation4 />} />
                <Route path="switch" element={<Nintendo />} />
                <Route path="pc" element={<PCGaming />} />
                <Route path="xbox" element={<Xbox />} />
                
                
                <Route path="accessories" element={<Accessories />} />
                <Route path="accessory/:slug" element={<Game />} />
                <Route path="gift-cards" element={<GiftCards />} />
                <Route path="gift-card/:id" element={<Game />} />
                
                
                <Route path="deals" element={<Deals />} />
                
                
                <Route path="search" element={<SearchResults />} />
                
                <Route 
                  path="cart" 
                  element={
                    <PrivateRoute>
                      <Cart />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="orders" 
                  element={
                    <PrivateRoute>
                      <Orders />
                    </PrivateRoute>
                  } 
                />
                <Route
                  path="admin"
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <Admin />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="admin/games/new"
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <GameForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin/games/edit/:id"
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <GameForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin/categories/new"
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <CategoryForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin/categories/edit/:id"
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <CategoryForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin/platforms/new"
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <PlatformForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin/platforms/edit/:id"
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <PlatformForm />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="admin/accessories/new"
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <AccessoryForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin/accessories/edit/:id"
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <AccessoryForm />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="admin/gift-cards/new"
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <GiftCardForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin/gift-cards/edit/:id"
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <GiftCardForm />
                    </PrivateRoute>
                  }
                />
              </Route>
            </Routes>
            
            <DatabaseInitializer />
          </Router>
          <ToastContainer />
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
