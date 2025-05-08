import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge, Form } from 'react-bootstrap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getAccessories, getPlatforms } from '../firebase/firestore';
import { useCurrency } from '../contexts/useCurrency.js';
import { useCart } from '../contexts/useCart.js';
import GameModal from '../components/GameModal';

const Accessories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accessories, setAccessories] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccessory, setSelectedAccessory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  // Filtros
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get('platform') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');

  // Tipos de accesorios 
  const accessoryTypes = [
    { id: 'controllers', name: 'Controles' },
    { id: 'headsets', name: 'Auriculares/Diademas' },
    { id: 'keyboards', name: 'Teclados Gaming' },
    { id: 'mice', name: 'Ratones Gaming' },
    { id: 'monitors', name: 'Monitores Gaming' },
    { id: 'chairs', name: 'Sillas Gaming' },
    { id: 'other', name: 'Otros Accesorios' }
  ];

  useEffect(() => {
    const loadFilters = async () => {
      try {
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
    const loadAccessories = async () => {
      setLoading(true);
      
      try {
        // Preparar opciones de filtrado
        const options = {
          sortBy: sortBy || 'createdAt',
          sortDirection: sortBy === 'price' ? 'asc' : 'desc',
          itemLimit: 100
        };
        
        // Aplicar filtro de plataforma si está seleccionado
        if (selectedPlatform) {
          options.platformId = selectedPlatform;
        }
        
        // Obtener accesorios
        let accessoriesData = await getAccessories(options);
        
        // Aplicar filtro de tipo si está seleccionado
        if (selectedType) {
          accessoriesData = accessoriesData.filter(accessory => accessory.type === selectedType);
        }
        
        // Aplicar filtro de precio si está seleccionado
        if (priceRange) {
          const [min, max] = priceRange.split('-').map(Number);
          accessoriesData = accessoriesData.filter(accessory => {
            const finalPrice = accessory.discount 
              ? accessory.price - (accessory.price * (accessory.discount / 100)) 
              : accessory.price;
              
            return finalPrice >= min && (max ? finalPrice <= max : true);
          });
        }
        
        setAccessories(accessoriesData);
        setError('');
      } catch (err) {
        console.error('Error al cargar accesorios:', err);
        setError('Error al cargar los accesorios. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAccessories();
  }, [selectedType, selectedPlatform, sortBy, priceRange]);

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
      case 'type':
        setSelectedType(value);
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

  // Función para obtener el nombre del tipo de accesorio
  const getTypeName = (typeId) => {
    const type = accessoryTypes.find(t => t.id === typeId);
    return type ? type.name : 'Accesorio';
  };

  // Función para mostrar el modal con detalles del accesorio
  const showAccessoryDetails = (accessory) => {
    setSelectedAccessory(accessory);
    setShowModal(true);
  };

  // Función para agregar directamente al carrito
  const handleAddToCart = (accessory, event) => {
    event.stopPropagation(); // Evitar que el clic se propague
    addToCart(accessory);
  };

  // Componente de tarjeta de accesorio
  const AccessoryCard = ({ accessory }) => {
    const platformName = platforms.find(p => p.id === accessory.platformId)?.name || 'Universal';
    const typeName = getTypeName(accessory.type);
    
    return (
      <Card 
        className="game-card h-100 cursor-pointer"
        onClick={() => showAccessoryDetails(accessory)}
      >
        <div className="img-hover-zoom">
          <Card.Img 
            variant="top" 
            src={accessory.imageUrl} 
            alt={accessory.name}
            className="img-fluid"
          />
          {accessory.is_new && <div className="new-badge">NUEVO</div>}
          {accessory.discount > 0 && <div className="discount-badge">-{accessory.discount}%</div>}
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title>{accessory.name}</Card.Title>
          <Card.Text>
            <div className="mb-2">
              <Badge bg="primary" className="me-2">{platformName}</Badge>
              <Badge bg="secondary">{typeName}</Badge>
            </div>
            {formatPriceWithDiscount(accessory.price, accessory.discount)}
          </Card.Text>
          <div className="mt-auto">
            <Button 
              variant="primary" 
              size="sm" 
              className="mt-2 me-2"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/accessory/${accessory.slug}`);
              }}
            >
              Ver detalle
            </Button>
            <Button 
              variant="warning" 
              size="sm" 
              className="mt-2"
              onClick={(e) => handleAddToCart(accessory, e)}
            >
              <i className="fas fa-shopping-cart me-2"></i>Agregar
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Accesorios</h1>
      <p className="lead mb-4">
        Descubre nuestra amplia selección de accesorios y periféricos para mejorar tu experiencia de juego.
        Desde controles y diademas hasta teclados y ratones gaming de alta precisión.
      </p>
      
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
                  <Form.Label>Tipo de accesorio</Form.Label>
                  <Form.Select 
                    value={selectedType} 
                    onChange={(e) => updateFilters('type', e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    {accessoryTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
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
                    <option value="createdAt">Más recientes</option>
                    <option value="price">Precio (menor a mayor)</option>
                    <option value="-price">Precio (mayor a menor)</option>
                    <option value="name">Nombre (A-Z)</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Rango de precio</Form.Label>
                  <Form.Select 
                    value={priceRange} 
                    onChange={(e) => updateFilters('price', e.target.value)}
                  >
                    <option value="">Cualquier precio</option>
                    <option value="0-50">Menos de $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="100-200">$100 - $200</option>
                    <option value="200-">Más de $200</option>
                  </Form.Select>
                </Form.Group>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    setSearchParams({});
                    setSelectedType('');
                    setSelectedPlatform('');
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
        
        {/* Lista de accesorios */}
        <Col lg={9}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <p className="mt-3">Cargando accesorios...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <p className="text-danger">{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          ) : accessories.length === 0 ? (
            <div className="text-center py-5">
              <p>No se encontraron accesorios con los filtros seleccionados.</p>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="mb-0">Se encontraron {accessories.length} accesorios</p>
              </div>
              
              <Row xs={1} md={2} lg={3} className="g-4">
                {accessories.map(accessory => (
                  <Col key={accessory.id}>
                    <AccessoryCard accessory={accessory} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>
      </Row>
      
      {/* Modal para detalles del accesorio */}
      <GameModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        game={selectedAccessory} 
      />
    </Container>
  );
};

export default Accessories; 