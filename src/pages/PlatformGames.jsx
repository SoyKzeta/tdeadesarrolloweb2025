import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge, Form } from 'react-bootstrap';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getGames, getCategories, getPlatforms } from '../firebase/firestore';
import { useCurrency } from '../contexts/useCurrency.js';


import PlaystationLogo from '../assets/logos/ps4_logo.png';
import PlaystationLogo5 from '../assets/logos/ps5_logo.png';
import XboxLogo from '../assets/logos/xbox_logo.png';
import NintendoLogo from '../assets/logos/switch_logo.png';
import PCLogo from '../assets/logos/pc_gaming.png';


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


const getPlatformLogoBySlug = (slug) => {
  if (!slug) return null;
  
  
  if (slug === "playstation-5" || slug === "ps5") {
    return PlaystationLogo5;
  }
  
  
  const matchingKey = Object.keys(platformLogos).find(key => 
    slug.toLowerCase().includes(key.toLowerCase())
  );
  
  return matchingKey ? platformLogos[matchingKey] : null;
};

const PlatformGames = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [platform, setPlatform] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { formatPrice } = useCurrency();
  
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        
        const categoriesData = await getCategories();
        console.log('PlatformGames: Categorías cargadas', categoriesData.length);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    };
    
    loadCategories();
  }, []);

  useEffect(() => {
    const loadPlatformAndGames = async () => {
      try {
        setLoading(true);
        
        
        const platforms = await getPlatforms();
        
        
        const currentPlatform = platforms.find(p => p.slug === slug);
        
        if (!currentPlatform) {
          setError('Plataforma no encontrada');
          return;
        }
        
        setPlatform(currentPlatform);
        
        
        const options = {
          platformId: currentPlatform.id,
          sortBy: sortBy || 'rating',
          sortDirection: sortBy === 'price' ? 'asc' : 'desc'
        };
        
        
        if (selectedCategory) {
          options.categoryId = selectedCategory;
        }
        
        let gamesData = await getGames(options);
        
        
        if (priceRange) {
          const [min, max] = priceRange.split('-').map(Number);
          gamesData = gamesData.filter(game => {
            const finalPrice = game.discount 
              ? game.price - (game.price * (game.discount / 100)) 
              : game.price;
              
            return finalPrice >= min && (max ? finalPrice <= max : true);
          });
        }
        
        setGames(gamesData);
        
      } catch (err) {
        console.error('Error al cargar plataforma y juegos:', err);
        setError('Error al cargar los datos. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPlatformAndGames();
  }, [slug, selectedCategory, sortBy, priceRange]);

  
  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    setSearchParams(params);
    
    
    switch (key) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
      case 'price':
        setPriceRange(value);
        break;
      default:
        break;
    }
  };

  
  const GameCard = ({ game }) => {
    const getCategoryName = (categoryId) => {
      const category = categories.find(c => c.id === categoryId);
      return category ? category.name : 'Juego';
    };
    
    const formatPriceWithDiscount = (price, discount) => {
      if (discount && discount > 0) {
        const discountedPrice = price - (price * (discount / 100));
        return (
          <span>
            <span className="text-decoration-line-through me-2 text-muted">{formatPrice(price)}</span>
            <span className="text-success fw-bold">{formatPrice(discountedPrice)}</span>
          </span>
        );
      }
      return <span className="text-success fw-bold">{formatPrice(price)}</span>;
    };
    
    return (
      <Card className="game-card h-100">
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
            <span className="badge bg-secondary me-2">
              {getCategoryName(game.categoryId)}
            </span>
            {formatPriceWithDiscount(game.price, game.discount)}
          </Card.Text>
          <div className="mt-auto">
            <Link to={`/game/${game.slug}`} className="text-decoration-none">
              <Button variant="primary" size="sm" className="mt-2 me-2">
                Ver detalle
              </Button>
            </Link>
            <Button variant="warning" size="sm" className="mt-2">
              <i className="fas fa-shopping-cart me-2"></i>Agregar
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando datos de la plataforma...</p>
      </Container>
    );
  }

  
  if (error) {
    return (
      <Container className="text-center py-5">
        <p className="text-danger">{error}</p>
        <Button variant="primary" onClick={() => navigate('/games')}>
          Ver todas las plataformas
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center mb-4">
        <Link to="/games" className="btn btn-outline-secondary me-3">
          <i className="fas fa-arrow-left"></i>
        </Link>
        <div>
          <h1 className="mb-0">
            {getPlatformLogoBySlug(platform.slug) ? (
              <img 
                src={getPlatformLogoBySlug(platform.slug)} 
                alt={platform.name}
                style={{ height: '50px', marginRight: '15px', verticalAlign: 'middle' }}
              />
            ) : (
              <span className="me-2" style={{ color: platform.color || '#007bff' }}>
                <i className={platform.icon || 'fas fa-gamepad'}></i>
              </span>
            )}
            {platform.name}
          </h1>
          <p className="text-muted mb-0">{platform.description || `Juegos para ${platform.name}`}</p>
        </div>
      </div>
      
      <Row>
        
        <Col lg={3} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Filtros</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Select 
                    value={selectedCategory} 
                    onChange={(e) => updateFilters('category', e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    {categories
                      .filter((category, index, self) => 
                        index === self.findIndex(c => c.slug === category.slug)
                      )
                      .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Ordenar por</Form.Label>
                  <Form.Select 
                    value={sortBy} 
                    onChange={(e) => updateFilters('sort', e.target.value)}
                  >
                    <option value="rating">Mejor valorados</option>
                    <option value="price">Precio (menor a mayor)</option>
                    <option value="-price">Precio (mayor a menor)</option>
                    <option value="title">Título (A-Z)</option>
                    <option value="createdAt">Más recientes</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Rango de precio</Form.Label>
                  <Form.Select 
                    value={priceRange} 
                    onChange={(e) => updateFilters('price', e.target.value)}
                  >
                    <option value="">Cualquier precio</option>
                    <option value="0-20">Menos de $20</option>
                    <option value="20-40">$20 - $40</option>
                    <option value="40-60">$40 - $60</option>
                    <option value="60-">Más de $60</option>
                  </Form.Select>
                </Form.Group>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    setSearchParams({});
                    setSelectedCategory('');
                    setSortBy('rating');
                    setPriceRange('');
                  }}
                  className="w-100"
                >
                  Limpiar filtros
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        
        <Col lg={9}>
          {games.length === 0 ? (
            <div className="text-center py-5">
              <p>No hay juegos disponibles con los filtros seleccionados.</p>
              <Button variant="primary" onClick={() => {
                setSearchParams({});
                setSelectedCategory('');
                setSortBy('rating');
                setPriceRange('');
              }}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-4">Se encontraron {games.length} juegos para {platform.name}</p>
              
              <Row xs={1} sm={2} md={3} className="g-4 mb-5">
                {games.map(game => (
                  <Col key={game.id}>
                    <GameCard game={game} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PlatformGames; 