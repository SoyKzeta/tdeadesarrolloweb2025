import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Card, Form, Button, Badge } from 'react-bootstrap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getAllGames, getPlatforms } from '../firebase/firestore';
import { useCurrency } from '../contexts/useCurrency.js';
import { useCart } from '../contexts/useCart.js';
import GameModal from '../components/GameModal';
import '../styles/deals.css'; // Asegúrate de crear este archivo CSS

const Deals = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  // Filtros
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get('platform') || '');
  const [discountRange, setDiscountRange] = useState(searchParams.get('discount') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'discount');

  useEffect(() => {
    // Cargar plataformas para los filtros y las tarjetas
    const loadPlatforms = async () => {
      try {
        const platformsData = await getPlatforms();
        setPlatforms(platformsData);
      } catch (error) {
        console.error('Error al cargar plataformas:', error);
      }
    };
    
    loadPlatforms();
  }, []);

  useEffect(() => {
    const loadGamesWithDiscounts = async () => {
      setLoading(true);
      
      try {
        const options = {
          sortBy: sortBy === 'name' ? 'title' : (sortBy === 'price' ? 'price' : 'discount'),
          sortDirection: sortBy === 'name' ? 'asc' : 'desc',
          itemLimit: 100
        };
        
        // Aplicar filtro de plataforma si está seleccionado
        if (selectedPlatform) {
          options.platformId = selectedPlatform;
        }
        
        // Obtener juegos
        let gamesData = await getAllGames(options);
        
        // Filtrar solo juegos con descuento
        gamesData = gamesData.filter(game => game.discount > 0);
        
        // Aplicar filtro de rango de descuento si está seleccionado
        if (discountRange) {
          const [minDiscount, maxDiscount] = discountRange.split('-').map(Number);
          gamesData = gamesData.filter(game => {
            if (!maxDiscount) {
              return game.discount >= minDiscount;
            }
            return game.discount >= minDiscount && game.discount <= maxDiscount;
          });
        }
        
        // Aplicar filtro de precio si está seleccionado
        if (priceRange) {
          const [minPrice, maxPrice] = priceRange.split('-').map(Number);
          gamesData = gamesData.filter(game => {
            const discountedPrice = game.price * (1 - game.discount / 100);
            
            if (!maxPrice) {
              return discountedPrice >= minPrice;
            }
            return discountedPrice >= minPrice && discountedPrice <= maxPrice;
          });
        }
        
        setGames(gamesData);
        setError('');
      } catch (err) {
        console.error('Error al cargar ofertas:', err);
        setError('Error al cargar las ofertas. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };
    
    loadGamesWithDiscounts();
  }, [selectedPlatform, discountRange, priceRange, sortBy]);

  // Función para actualizar filtros y búsqueda
  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    setSearchParams(params);
    
    // Actualizar estado local
    switch (key) {
      case 'platform':
        setSelectedPlatform(value);
        break;
      case 'discount':
        setDiscountRange(value);
        break;
      case 'price':
        setPriceRange(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
      default:
        break;
    }
  };

  // Función para mostrar el modal con detalles del juego
  const showGameDetails = (game) => {
    setSelectedGame(game);
    setShowModal(true);
  };

  // Función para agregar directamente al carrito
  const handleAddToCart = (game, event) => {
    event.stopPropagation(); // Evitar que el clic se propague
    addToCart(game);
  };

  // Componente de tarjeta de juego
  const GameCard = ({ game }) => {
    const platformName = platforms.find(p => p.id === game.platformId)?.name || 'Desconocido';
    
    // Calcular precio con descuento
    const originalPrice = game.price;
    const discountedPrice = originalPrice - (originalPrice * (game.discount / 100));
    
    return (
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
          {game.discount > 0 && <div className="discount-badge">-{game.discount}%</div>}
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title>{game.title}</Card.Title>
          <Card.Text>
            <div className="mb-2">
              <Badge bg="primary">{platformName}</Badge>
            </div>
            <span className="text-decoration-line-through me-2 text-muted">
              {formatPrice(originalPrice)}
            </span>
            <span className="text-success fw-bold">
              {formatPrice(discountedPrice)}
            </span>
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
    );
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center section-title">Ofertas Especiales</h1>
      
      <Row className="mb-4">
        <Col>
          <p className="lead text-center">
            ¡Aprovecha nuestras ofertas especiales y ahorra en tus juegos favoritos!
          </p>
        </Col>
      </Row>
      
      <Row>
        {/* Sidebar de filtros */}
        <Col lg={3} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Filtros</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Plataforma</Form.Label>
                  <Form.Select 
                    value={selectedPlatform} 
                    onChange={(e) => updateFilters('platform', e.target.value)}
                  >
                    <option value="">Todas las plataformas</option>
                    {platforms.map(platform => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Rango de descuento</Form.Label>
                  <Form.Select 
                    value={discountRange} 
                    onChange={(e) => updateFilters('discount', e.target.value)}
                  >
                    <option value="">Cualquier descuento</option>
                    <option value="10-30">10% - 30%</option>
                    <option value="30-50">30% - 50%</option>
                    <option value="50-">Más del 50%</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Precio con descuento</Form.Label>
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
                
                <Form.Group className="mb-3">
                  <Form.Label>Ordenar por</Form.Label>
                  <Form.Select 
                    value={sortBy} 
                    onChange={(e) => updateFilters('sort', e.target.value)}
                  >
                    <option value="discount">Mayor descuento</option>
                    <option value="price">Menor precio</option>
                    <option value="name">Título (A-Z)</option>
                  </Form.Select>
                </Form.Group>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    setSearchParams({});
                    setSelectedPlatform('');
                    setDiscountRange('');
                    setPriceRange('');
                    setSortBy('discount');
                  }}
                  className="w-100"
                >
                  Limpiar filtros
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Lista de juegos en oferta */}
        <Col lg={9}>
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando ofertas...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : games.length === 0 ? (
            <div className="alert alert-info">
              No hay ofertas disponibles con los filtros seleccionados. ¡Modifica tus filtros o vuelve más tarde!
            </div>
          ) : (
            <Row xs={1} sm={2} md={3} className="g-4">
              {games.map((game) => (
                <Col key={game.id}>
                  <GameCard game={game} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
      
      {/* Modal para detalles del juego */}
      <GameModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        game={selectedGame} 
      />
    </Container>
  );
};

export default Deals; 