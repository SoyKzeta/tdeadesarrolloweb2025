import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { getGames, getCategories, getPlatforms } from '../firebase/firestore';

const Games = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get('platform') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');

  useEffect(() => {
    const loadFilters = async () => {
      try {
        // Cargar categorías
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Cargar plataformas
        const platformsData = await getPlatforms();
        setPlatforms(platformsData);
      } catch (err) {
        console.error('Error al cargar filtros:', err);
        setError('Error al cargar filtros. Por favor, recarga la página.');
      }
    };
    
    loadFilters();
  }, []);

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      
      try {
        // Preparar opciones de filtrado
        const options = {
          sortBy: sortBy || 'rating',
          sortDirection: 'desc',
          itemLimit: 100
        };
        
        // Aplicar filtros de categoría y plataforma si están seleccionados
        if (selectedCategory) {
          options.categoryId = selectedCategory;
        }
        
        if (selectedPlatform) {
          options.platformId = selectedPlatform;
        }
        
        // Obtener juegos
        let gamesData = await getGames(options);
        
        // Aplicar filtro de precio si está seleccionado
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
        console.error('Error al cargar juegos:', err);
        setError('Error al cargar los juegos. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };
    
    loadGames();
  }, [selectedCategory, selectedPlatform, sortBy, priceRange]);

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
      case 'category':
        setSelectedCategory(value);
        break;
      case 'platform':
        setSelectedPlatform(value);
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

  // Función para formatear precio con descuento
  const formatPrice = (price, discount) => {
    if (discount && discount > 0) {
      const discountedPrice = price - (price * (discount / 100));
      return (
        <span>
          <span className="text-decoration-line-through me-2 text-muted">${price.toFixed(2)}</span>
          <span className="text-success fw-bold">${discountedPrice.toFixed(2)}</span>
        </span>
      );
    }
    return <span className="text-success fw-bold">${price.toFixed(2)}</span>;
  };

  // Componente de tarjeta de juego
  const GameCard = ({ game, platforms }) => {
    // Obtener plataforma completa
    const platform = platforms.find(p => p.id === game.platformId);
    const platformName = platform ? platform.name : 'Desconocido';
    
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
            <span className="badge bg-primary me-2">
              {platformName}
            </span>
            {formatPrice(game.price, game.discount)}
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

  return (
    <Container className="py-5">
      <h1 className="mb-4">Catálogo de Juegos</h1>
      
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
                  <Form.Label>Ordenar por</Form.Label>
                  <Form.Select 
                    value={sortBy} 
                    onChange={(e) => updateFilters('sort', e.target.value)}
                  >
                    <option value="rating">Mejor valorados</option>
                    <option value="price">Precio (menor a mayor)</option>
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
                    setSelectedPlatform('');
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
        
        {/* Lista de juegos */}
        <Col lg={9}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <p className="mt-3">Cargando juegos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <p className="text-danger">{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-5">
              <p>No se encontraron juegos con los filtros seleccionados.</p>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="mb-0">Se encontraron {games.length} juegos</p>
              </div>
              
              <Row xs={1} md={2} lg={3} className="g-4">
                {games.map(game => (
                  <Col key={game.id}>
                    <GameCard game={game} platforms={platforms} />
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

export default Games; 