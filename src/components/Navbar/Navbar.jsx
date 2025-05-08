import { useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Offcanvas, Button, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logos/logo.png';
import { useAuth } from '../../contexts/useAuth.js';
import { useCurrency } from '../../contexts/useCurrency.js';
import SearchBar from '../SearchBar';
import { useCart } from '../../contexts/useCart.js';

const Navbar = () => {
  const [show, setShow] = useState(false);
  const location = useLocation();
  const { currentUser, logout, isAdmin } = useAuth();
  const { currency, changeCurrency } = useCurrency();
  const { cartCount } = useCart();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  
  const currencies = [
    { code: 'COP', name: 'Peso Colombiano (COP)' },
    { code: 'USD', name: 'Dólar Estadounidense (USD)' },
    { code: 'EUR', name: 'Euro (EUR)' },
    { code: 'MXN', name: 'Peso Mexicano (MXN)' },
    { code: 'ARS', name: 'Peso Argentino (ARS)' },
    { code: 'CLP', name: 'Peso Chileno (CLP)' },
    { code: 'PEN', name: 'Sol Peruano (PEN)' },
    { code: 'BRL', name: 'Real Brasileño (BRL)' }
  ];

  return (
    <>
      
      <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="d-none d-lg-block">
        <Container>
          <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img
              src={logo}
              alt="Game Shop Logo"
              height="80"
              className="d-inline-block"
            />
          </BootstrapNavbar.Brand>
          
          
          <SearchBar />
          
          <Nav className="ms-auto">
            
            <Dropdown align="end" className="me-3">
              <Dropdown.Toggle variant="outline-info" id="dropdown-currency" size="sm">
                <i className="fas fa-money-bill-wave me-1"></i> {currency}
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-dark">
                <Dropdown.Header>Seleccionar moneda</Dropdown.Header>
                {currencies.map(curr => (
                  <Dropdown.Item 
                    key={curr.code}
                    active={currency === curr.code}
                    onClick={() => changeCurrency(curr.code)}
                  >
                    {curr.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            
            <Nav.Link as={Link} to="/cart" className="me-3 cart-link">
              <i className="fas fa-shopping-cart"></i>
              <span className="cart-count">{cartCount}</span>
            </Nav.Link>
            
            
            {isAdmin() && (
              <Nav.Link as={Link} to="/admin" className="me-3">
                <i className="fas fa-cog"></i>
              </Nav.Link>
            )}
            
            {currentUser ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-warning" id="dropdown-user" className="user-dropdown">
                  <i className="fas fa-user-circle me-2"></i>
                  {currentUser.email.split('@')[0]}
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-dark">
                  <Dropdown.Item as={Link} to="/profile">Mi Perfil</Dropdown.Item>
                  
                  
                  {isAdmin() ? (
                    <Dropdown.Item as={Link} to="/admin">Administrar</Dropdown.Item>
                  ) : (
                    <>
                      <Dropdown.Item as={Link} to="/orders">Mis Pedidos</Dropdown.Item>
                    </>
                  )}
                  
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Cerrar Sesión</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button variant="outline-warning" as={Link} to="/login" className="login-button">
                Iniciar Sesión
              </Button>
            )}
          </Nav>
        </Container>
      </BootstrapNavbar>

      
      <Nav className="category-nav d-none d-lg-flex">
        <Container>
          <div className="d-flex">
            <Nav.Link as={Link} to="/ps5" active={isActive('/ps5')}>
              PlayStation 5
            </Nav.Link>
            <Nav.Link as={Link} to="/ps4" active={isActive('/ps4')}>
              PlayStation 4
            </Nav.Link>
            <Nav.Link as={Link} to="/switch" active={isActive('/switch')}>
              Nintendo Switch
            </Nav.Link>
            <Nav.Link as={Link} to="/pc" active={isActive('/pc')}>
              PC Gaming
            </Nav.Link>
            <Nav.Link as={Link} to="/xbox" active={isActive('/xbox')}>
              Xbox
            </Nav.Link>
            <Nav.Link as={Link} to="/accessories" active={isActive('/accessories')}>
              Accesorios
            </Nav.Link>
            <Nav.Link as={Link} to="/gift-cards" active={isActive('/gift-cards')}>
              Tarjetas Regalo
            </Nav.Link>
            <Nav.Link as={Link} to="/deals" active={isActive('/deals')} className="text-danger">
              Ofertas
            </Nav.Link>
          </div>
        </Container>
      </Nav>

      
      <BootstrapNavbar bg="dark" variant="dark" className="d-lg-none">
        <Container>
          <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img
              src={logo}
              alt="Game Shop Logo"
              height="60"
              className="d-inline-block"
            />
          </BootstrapNavbar.Brand>
          <Nav className="ms-auto me-2">
            
            <Dropdown align="end" className="me-2">
              <Dropdown.Toggle variant="outline-info" id="dropdown-currency-mobile" size="sm">
                {currency}
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-dark">
                {currencies.map(curr => (
                  <Dropdown.Item 
                    key={curr.code}
                    active={currency === curr.code}
                    onClick={() => changeCurrency(curr.code)}
                  >
                    {curr.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Link as={Link} to="/cart" className="cart-link">
              <i className="fas fa-shopping-cart"></i>
              <span className="cart-count">{cartCount}</span>
            </Nav.Link>
          </Nav>
          <button
            className="navbar-toggler"
            type="button"
            onClick={handleShow}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </Container>
      </BootstrapNavbar>

      
      <div className="mobile-search-container d-lg-none">
        <Container className="py-2">
          <SearchBar />
        </Container>
      </div>

      
      <Offcanvas show={show} onHide={handleClose} placement="end" className="bg-dark">
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="text-white">
            <img
              src={logo}
              alt="Game Shop Logo"
              height="55"
              className="d-inline-block me-2"
            />
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            
            <div className="mb-3">
              <h6 className="text-warning mb-2">Moneda</h6>
              <Form.Select 
                size="sm" 
                value={currency} 
                onChange={(e) => changeCurrency(e.target.value)}
                className="bg-dark text-white"
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name}
                  </option>
                ))}
              </Form.Select>
            </div>

            {currentUser ? (
              <>
                <div className="user-info mb-3 p-2 border-bottom border-warning">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-user-circle me-2 text-warning" style={{ fontSize: '2rem' }}></i>
                    <div>
                      <div className="text-white">{currentUser.email.split('@')[0]}</div>
                      <small className="text-muted">{currentUser.email}</small>
                    </div>
                  </div>
                </div>
                <Nav.Link as={Link} to="/profile" className="text-white" onClick={handleClose}>
                  <i className="fas fa-user me-2"></i> Mi Perfil
                </Nav.Link>

                
                {isAdmin() ? (
                  <Nav.Link as={Link} to="/admin" className="text-white" onClick={handleClose}>
                    <i className="fas fa-cog me-2"></i> Administrar
                  </Nav.Link>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/orders" className="text-white" onClick={handleClose}>
                      <i className="fas fa-box me-2"></i> Mis Pedidos
                    </Nav.Link>
                  </>
                )}
                <Nav.Link onClick={handleLogout} className="text-white">
                  <i className="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                </Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/login" className="text-white d-flex align-items-center" onClick={handleClose}>
                <i className="fas fa-sign-in-alt me-2"></i> Iniciar Sesión
              </Nav.Link>
            )}

            <div className="border-top border-secondary my-3"></div>

            
            <h6 className="text-warning mb-3 mt-2">Plataformas</h6>
            <Nav.Link as={Link} to="/ps5" className="text-white" onClick={handleClose}>
              PlayStation 5
            </Nav.Link>
            <Nav.Link as={Link} to="/ps4" className="text-white" onClick={handleClose}>
              PlayStation 4
            </Nav.Link>
            <Nav.Link as={Link} to="/switch" className="text-white" onClick={handleClose}>
              Nintendo Switch
            </Nav.Link>
            <Nav.Link as={Link} to="/pc" className="text-white" onClick={handleClose}>
              PC Gaming
            </Nav.Link>
            <Nav.Link as={Link} to="/xbox" className="text-white" onClick={handleClose}>
              Xbox
            </Nav.Link>

            
            <div className="border-top border-secondary my-3"></div>
            <h6 className="text-warning mb-3">Categorías</h6>
            <Nav.Link as={Link} to="/accessories" className="text-white" onClick={handleClose}>
              Accesorios
            </Nav.Link>
            <Nav.Link as={Link} to="/gift-cards" className="text-white" onClick={handleClose}>
              Tarjetas de Regalo
            </Nav.Link>
            <Nav.Link as={Link} to="/deals" className="text-danger" onClick={handleClose}>
              <i className="fas fa-tag me-2"></i> Ofertas
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Navbar; 