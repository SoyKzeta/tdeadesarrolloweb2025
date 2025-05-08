import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getGames, getCategories, getPlatforms } from '../firebase/firestore';
import { useCurrency } from '../contexts/useCurrency.js';
import { useCart } from '../contexts/useCart.js';
import GameModal from '../components/GameModal';


import PlaystationLogo from '../assets/logos/ps4_logo.png';
import PlaystationLogo5 from '../assets/logos/ps5_logo.png';
import XboxLogo from '../assets/logos/xbox_logo.png';
import NintendoLogo from '../assets/logos/switch_logo.png';
import PCLogo from '../assets/logos/pc_gaming.png';
import FondoBienvenido from '../assets/logos/fondo_bienvenido.png';


const platformLogos = {
  'playstation': PlaystationLogo,
  'playstation-4': PlaystationLogo,
  'playstation-5': PlaystationLogo5,
  'ps4': PlaystationLogo,
  'ps5': PlaystationLogo5,
  'xbox': XboxLogo,
  'xbox-one': XboxLogo,
  'xbox-series': XboxLogo,
  'nintendo': NintendoLogo,
  'nintendo-switch': NintendoLogo,
  'switch': NintendoLogo,
  'pc': PCLogo,
  'pc-gaming': PCLogo
};


const getPlatformLogo = (platformSlug) => {
  if (!platformSlug) return null;
  
  
  if (platformSlug === "playstation-5" || platformSlug === "ps5") {
    return PlaystationLogo5;
  }
  
  
  const matchingKey = Object.keys(platformLogos).find(key => 
    platformSlug.toLowerCase().includes(key.toLowerCase())
  );
  
  return matchingKey ? platformLogos[matchingKey] : null;
};

const Home = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [newGames, setNewGames] = useState([]);
  const [discountedGames, setDiscountedGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        
        const [categoriesData, platformsData] = await Promise.all([
          getCategories(),
          getPlatforms()
        ]);
        
        console.log('Home: Categorías cargadas', categoriesData.length);
        setCategories(categoriesData);
        setPlatforms(platformsData);
        
        
        const featuredGamesData = await getGames({ 
          sortBy: 'rating',
          sortDirection: 'desc',
          itemLimit: 6
        });
        setFeaturedGames(featuredGamesData.filter(game => game.is_featured));
        
        
        const newGamesData = await getGames({
          sortBy: 'createdAt',
          sortDirection: 'desc',
          itemLimit: 3
        });
        setNewGames(newGamesData.filter(game => game.is_new));
        
        
        const discountedGamesData = await getGames({
          sortBy: 'discount',
          sortDirection: 'desc',
          itemLimit: 3
        });
        setDiscountedGames(discountedGamesData.filter(game => game.discount > 0));
        
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  
  const formatGamePrice = (price, discount) => {
    if (discount && discount > 0) {
      const discountedPrice = price - (price * (discount / 100));
      return (
        <span>
          <span className="text-decoration-line-through me-2 text-muted">
            {formatPrice(price)}
          </span>
          <span className="text-success fw-bold">
            {formatPrice(discountedPrice)}
          </span>
        </span>
      );
    }
    return <span className="text-success fw-bold">{formatPrice(price)}</span>;
  };

  
  const getPlatformName = (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform ? platform.name : 'Desconocido';
  };

  
  const showGameDetails = (game) => {
    setSelectedGame(game);
    setShowModal(true);
  };

  
  const handleAddToCart = (game, event) => {
    event.stopPropagation(); 
    addToCart(game);
  };

  
  const navigateToCategory = (categorySlug) => {
    navigate(`/category/${categorySlug}`);
  };

  
  const navigateToPlatform = (platformSlug) => {
    navigate(`/platform/${platformSlug}`);
  };

  
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando datos de la tienda...</p>
      </Container>
    );
  }

  
  if (error) {
    return (
      <Container className="text-center py-5">
        <p className="text-danger">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </Container>
    );
  }

  return (
    <>
      
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={12} className="text-center">
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <img
                  src={FondoBienvenido}
                  alt="Bienvenidos a Game Shop"
                  className="img-fluid rounded hero-welcome-image"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      
      <div className="stats-banner py-3">
        <Container>
          <Row className="text-center">
            <Col xs={6} md={3}>
              <div className="stat-item">
                <span className="stat-number">15K+</span>
                <span className="stat-text">Usuarios</span>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-text">Juegos</span>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-text">Marcas</span>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-text">Soporte</span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      
      <Container className="py-5">
        <h2 className="section-title text-center">Categorías</h2>
        <Row className="g-4 mb-5 justify-content-center">
          
          {categories
            .filter((category, index, self) => 
              index === self.findIndex(c => c.slug === category.slug)
            )
            .map(category => (
            <Col key={category.id} xs={6} md={3}>
              <Card 
                className="category-card text-center h-100 cursor-pointer"
                onClick={() => navigateToCategory(category.slug)}
              >
                <Card.Body>
                  <div className="category-icon" style={{ color: category.color }}>
                    <i className={category.icon} style={{ fontSize: '3rem' }}></i>
                  </div>
                  <Card.Title className="mt-3">{category.name}</Card.Title>
                  <Button 
                    variant="outline-warning" 
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      navigateToCategory(category.slug);
                    }}
                  >
                    Ver juegos
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        
        <h2 className="section-title text-center">Plataformas</h2>
        <Row className="g-4 mb-5 justify-content-center">
          {platforms.map(platform => {
            const platformLogo = getPlatformLogo(platform.slug);
            return (
              <Col key={platform.id} xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
                <Card 
                  className="platform-card text-center h-100 w-100 cursor-pointer"
                  style={{ maxWidth: '240px' }}
                  onClick={() => navigateToPlatform(platform.slug)}
                >
                  <Card.Body>
                    {platformLogo ? (
                      <div className="platform-logo-container">
                        <img 
                          src={platformLogo} 
                          alt={platform.name} 
                          className="platform-logo"
                        />
                      </div>
                    ) : (
                      <div className="platform-logo-container" style={{ backgroundColor: platform.color }}></div>
                    )}
                    <Card.Title className="mt-3 h5">{platform.name}</Card.Title>
                    <Button 
                      variant="outline-warning" 
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        navigateToPlatform(platform.slug);
                      }}
                    >
                      Ver juegos
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        
        <h2 className="section-title text-center">Juegos Destacados</h2>
        <Row xs={1} sm={2} md={3} className="g-4 mb-5">
          {featuredGames.map(game => (
            <Col key={game.id}>
              <Card 
                className="game-card h-100 cursor-pointer" 
                onClick={() => showGameDetails(game)}
              >
                <div className="img-hover-zoom">
                  <Card.Img
                    variant="top"
                    src={game.imageUrl}
                    alt={game.title}
                    className="img-fluid"
                  />
                  {game.is_new && <div className="new-badge">NUEVO</div>}
                  {game.discount > 0 && <div className="discount-badge">-{game.discount}%</div>}
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{game.title}</Card.Title>
                  <Card.Text>
                    <span className="badge bg-primary me-2">
                      {getPlatformName(game.platformId)}
                    </span>
                    {formatGamePrice(game.price, game.discount)}
                  </Card.Text>
                  <div className="mt-auto">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="mt-2 me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/game/${game.slug}`);
                      }}
                    >
                      Ver detalle
                    </Button>
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="mt-2"
                      onClick={(e) => handleAddToCart(game, e)}
                    >
                      <i className="fas fa-shopping-cart me-2"></i>Agregar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        
        <h2 className="section-title text-center">Novedades</h2>
        <Row xs={1} sm={2} md={3} className="g-4 mb-5">
          {newGames.length > 0 ? (
            newGames.map(game => (
              <Col key={game.id}>
                <Card 
                  className="game-card h-100 cursor-pointer"
                  onClick={() => showGameDetails(game)}
                >
                  <div className="img-hover-zoom">
                    <Card.Img
                      variant="top"
                      src={game.imageUrl}
                      alt={game.title}
                      className="img-fluid"
                    />
                    <div className="new-badge">NUEVO</div>
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{game.title}</Card.Title>
                    <Card.Text>
                      <span className="badge bg-primary me-2">
                        {getPlatformName(game.platformId)}
                      </span>
                      {formatGamePrice(game.price, game.discount)}
                    </Card.Text>
                    <div className="mt-auto">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="mt-2 me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/game/${game.slug}`);
                        }}
                      >
                        Ver detalle
                      </Button>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        className="mt-2"
                        onClick={(e) => handleAddToCart(game, e)}
                      >
                        <i className="fas fa-shopping-cart me-2"></i>Agregar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12} className="text-center">
              <p>No hay nuevos juegos disponibles en este momento.</p>
            </Col>
          )}
        </Row>

        
        <h2 className="section-title text-center">Ofertas</h2>
        <Row xs={1} sm={2} md={3} className="g-4 mb-5">
          {discountedGames.length > 0 ? (
            discountedGames.map(game => (
              <Col key={game.id}>
                <Card 
                  className="game-card h-100 cursor-pointer"
                  onClick={() => showGameDetails(game)}
                >
                  <div className="img-hover-zoom">
                    <Card.Img
                      variant="top"
                      src={game.imageUrl}
                      alt={game.title}
                      className="img-fluid"
                    />
                    <div className="discount-badge">-{game.discount}%</div>
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{game.title}</Card.Title>
                    <Card.Text>
                      <span className="badge bg-primary me-2">
                        {getPlatformName(game.platformId)}
                      </span>
                      {formatGamePrice(game.price, game.discount)}
                    </Card.Text>
                    <div className="mt-auto">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="mt-2 me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/game/${game.slug}`);
                        }}
                      >
                        Ver detalle
                      </Button>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        className="mt-2"
                        onClick={(e) => handleAddToCart(game, e)}
                      >
                        <i className="fas fa-shopping-cart me-2"></i>Agregar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12} className="text-center">
              <p>No hay ofertas disponibles en este momento.</p>
            </Col>
          )}
        </Row>
      </Container>

      
      <GameModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        game={selectedGame} 
      />
    </>
  );
};

export default Home; 