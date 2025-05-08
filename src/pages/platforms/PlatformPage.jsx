import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getGames, getPlatforms, getCategories } from '../../firebase/firestore';
import { initializePlatforms } from '../../firebase/migrations';
import { useCurrency } from '../../contexts/useCurrency.js';
import { useCart } from '../../contexts/useCart.js';
import GameModal from '../../components/GameModal';

const PlatformPage = ({ platformSlug, title, description }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [platform, setPlatform] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
  
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    };
    
    loadCategories();
  }, []);

  useEffect(() => {
    const loadPlatformAndGames = async () => {
      setLoading(true);
      setDebugInfo(null);
      
      try {
        console.log(`Buscando plataforma con slug: ${platformSlug}`);
        
        
        const platformsData = await getPlatforms();
        console.log('Plataformas obtenidas:', platformsData);
        
        
        const platformData = platformsData.find(p => p.slug === platformSlug);
        
        
        setDebugInfo({
          totalPlatforms: platformsData.length,
          platforms: platformsData.map(p => ({ 
            id: p.id, 
            name: p.name, 
            slug: p.slug,
            allData: p
          })),
          searchedSlug: platformSlug,
          foundPlatform: platformData ? { 
            id: platformData.id, 
            name: platformData.name, 
            slug: platformData.slug,
            allData: platformData
          } : null
        });
        
        if (!platformData) {
          setError(`No se encontró ninguna plataforma con el slug '${platformSlug}'. Revisa la configuración en Firebase.`);
          setLoading(false);
          return;
        }
        
        setPlatform(platformData);
        console.log(`Plataforma encontrada: ${platformData.name} (ID: ${platformData.id})`);
        
        
        const options = {
          platformId: platformData.id,
          sortBy: sortBy || 'createdAt',
          sortDirection: sortBy === 'price' ? 'asc' : 'desc'
        };
        
        
        if (selectedCategory) {
          options.categoryId = selectedCategory;
        }
        
        console.log('Solicitando juegos con opciones:', options);
        let gamesData = await getGames(options);
        console.log(`Se encontraron ${gamesData.length} juegos para la plataforma ${platformData.name}`);
        
        
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
        setError('');
      } catch (err) {
        console.error('Error al cargar la página de plataforma:', err);
        setError(`Error al cargar los juegos: ${err.message}. Por favor, recarga la página.`);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlatformAndGames();
  }, [platformSlug, selectedCategory, sortBy, priceRange]);

  
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

  
  const showGameDetails = (game) => {
    setSelectedGame(game);
    setShowModal(true);
  };

  
  const handleAddToCart = (game, event) => {
    event.stopPropagation(); 
    addToCart(game);
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
            <span className="badge bg-secondary me-2">
              {getCategoryName(game.categoryId)}
            </span>
            {formatPriceWithDiscount(game.price, game.discount)}
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

  
  const handleUpdatePlatforms = async () => {
    try {
      setUpdating(true);
      setUpdateMessage('Actualizando plataformas...');
      
      
      await initializePlatforms();
      
      setUpdateMessage('¡Plataformas actualizadas! Recargando...');
      
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar plataformas:', error);
      setUpdateMessage(`Error: ${error.message}`);
      setUpdating(false);
    }
  };

  return (
    <Container className="py-5">
      <h1 className="mb-3">{title || `Juegos para ${platform?.name || platformSlug}`}</h1>
      
      {description && <p className="lead mb-4">{description}</p>}
      
      {updating ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Actualizando...</span>
          </Spinner>
          <p className="mt-3">{updateMessage}</p>
        </div>
      ) : loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3">Cargando juegos para {platformSlug}...</p>
        </div>
      ) : error ? (
        <div className="text-center py-5">
          <Alert variant="danger">{error}</Alert>
          {updateMessage && (
            <Alert variant="info" className="mt-2">
              {updateMessage}
            </Alert>
          )}
          {debugInfo && (
            <div className="mt-4 text-start">
              <details>
                <summary className="mb-2">Información de depuración (Para el administrador)</summary>
                <pre className="bg-dark text-light p-3 rounded">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
                <div className="mt-3 mb-2">
                  <h5>Slugs de plataformas disponibles:</h5>
                  <ul>
                    {debugInfo.platforms.map(p => (
                      <li key={p.id}>
                        <strong>{p.name}:</strong> "{p.slug}"
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3">
                    <strong>Slug buscado:</strong> "{debugInfo.searchedSlug}"
                  </p>
                </div>
              </details>
            </div>
          )}
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Button 
              variant="primary" 
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
            <Link to="/admin">
              <Button variant="secondary">
                Ir al Panel de Administración
              </Button>
            </Link>
            <Button 
              variant="warning" 
              onClick={handleUpdatePlatforms}
              disabled={updating}
            >
              Actualizar Plataformas
            </Button>
          </div>
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-5">
          <Alert variant="warning">
            No se encontraron juegos para esta plataforma.
            {debugInfo && debugInfo.foundPlatform && (
              <p className="mt-2 mb-0">
                <small>Plataforma: {debugInfo.foundPlatform.name} (ID: {debugInfo.foundPlatform.id})</small>
              </p>
            )}
          </Alert>
          <Link to="/games">
            <Button variant="primary" className="mt-3">Ver todos los juegos</Button>
          </Link>
        </div>
      ) : (
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
                      {categories.map(category => (
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
                      <option value="createdAt">Más recientes</option>
                      <option value="price">Precio (menor a mayor)</option>
                      <option value="-price">Precio (mayor a menor)</option>
                      <option value="title">Título (A-Z)</option>
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
                      setSortBy('createdAt');
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
            <p className="mb-4">Mostrando {games.length} juegos para {platform?.name}</p>
            
            <Row xs={1} md={2} lg={3} className="g-4">
              {games.map(game => (
                <Col key={game.id}>
                  <GameCard game={game} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}
      
      
      <GameModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        game={selectedGame} 
      />
    </Container>
  );
};

export default PlatformPage; 