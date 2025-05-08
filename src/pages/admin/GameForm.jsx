import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { getGameById, addGame, updateGame, getCategories, getPlatforms } from '../../firebase/firestore';

const GameForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Estado del formulario
  const [formValues, setFormValues] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    release_date: '',
    developer: '',
    publisher: '',
    categoryIds: [],
    platformId: '',
    features: '',
    rating: '',
    discount: '0',
    is_featured: false,
    is_new: false,
    is_upcoming: false
  });

  // Cargar datos para el formulario (categorías, plataformas y datos del juego en modo edición)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar categorías y plataformas
        const [categoriesData, platformsData] = await Promise.all([
          getCategories(),
          getPlatforms()
        ]);
        
        setCategories(categoriesData);
        setPlatforms(platformsData);
        
        // Si estamos en modo edición, cargar datos del juego
        if (isEditMode) {
          const gameData = await getGameById(id);
          if (gameData) {
            // Convertir fecha a formato YYYY-MM-DD para el input
            let releaseDate = '';
            if (gameData.release_date) {
              const date = gameData.release_date.toDate ? 
                gameData.release_date.toDate() : 
                new Date(gameData.release_date);
              releaseDate = date.toISOString().split('T')[0];
            }
            
            setFormValues({
              title: gameData.title || '',
              slug: gameData.slug || '',
              description: gameData.description || '',
              price: gameData.price?.toString() || '',
              stock: gameData.stock?.toString() || '',
              release_date: releaseDate,
              developer: gameData.developer || '',
              publisher: gameData.publisher || '',
              categoryIds: gameData.categoryIds || [],
              platformId: gameData.platformId || '',
              features: (gameData.features || []).join(', '),
              rating: gameData.rating?.toString() || '',
              discount: gameData.discount?.toString() || '0',
              is_featured: gameData.is_featured || false,
              is_new: gameData.is_new || false,
              is_upcoming: gameData.is_upcoming || false
            });
            
            // Mostrar la imagen actual si existe
            if (gameData.imageUrl) {
              setImagePreview(gameData.imageUrl);
            }
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, isEditMode]);

  // Generar slug automáticamente a partir del título
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Evitar múltiples guiones seguidos
      .trim();
  };

  // Manejar cambios en inputs del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Si es el título, generar el slug automáticamente
    if (name === 'title') {
      setFormValues({
        ...formValues,
        title: value,
        slug: generateSlug(value)
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Manejar cambios en selección múltiple de categorías
  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selectedCategories = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCategories.push(options[i].value);
      }
    }
    setFormValues({
      ...formValues,
      categoryIds: selectedCategories
    });
  };

  // Manejar subida de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Crear una URL para previsualización
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Validación básica
      if (!formValues.title || !formValues.description || !formValues.price || !formValues.platformId) {
        setError('Por favor, completa todos los campos obligatorios');
        setSaving(false);
        return;
      }
      
      // Preparar datos para guardar en Firebase
      const gameData = {
        title: formValues.title,
        slug: formValues.slug,
        description: formValues.description,
        price: parseFloat(formValues.price),
        stock: parseInt(formValues.stock, 10) || 0,
        release_date: formValues.release_date ? new Date(formValues.release_date) : null,
        developer: formValues.developer,
        publisher: formValues.publisher,
        categoryIds: formValues.categoryIds,
        platformId: formValues.platformId,
        features: formValues.features.split(',').map(feature => feature.trim()).filter(Boolean),
        rating: parseFloat(formValues.rating) || 0,
        discount: parseFloat(formValues.discount) || 0,
        is_featured: formValues.is_featured,
        is_new: formValues.is_new,
        is_upcoming: formValues.is_upcoming
      };
      
      // Guardar datos (añadir o actualizar)
      if (isEditMode) {
        await updateGame(id, gameData, imageFile);
        setSuccess('Juego actualizado con éxito');
        // Redirigir al panel de administración después de un breve retraso
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
        const newId = await addGame(gameData, imageFile);
        setSuccess(`Juego agregado con éxito (ID: ${newId})`);
        // Redirigir al panel de administración después de un breve retraso
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
        
        // Limpiar formulario después de agregar (no es necesario si redirigimos)
        setFormValues({
          title: '',
          slug: '',
          description: '',
          price: '',
          stock: '',
          release_date: '',
          developer: '',
          publisher: '',
          categoryIds: [],
          platformId: '',
          features: '',
          rating: '',
          discount: '0',
          is_featured: false,
          is_new: false,
          is_upcoming: false
        });
        setImageFile(null);
        setImagePreview('');
      }
    } catch (err) {
      console.error('Error al guardar juego:', err);
      setError(`Error al ${isEditMode ? 'actualizar' : 'agregar'} el juego. Por favor, inténtalo de nuevo.`);
    } finally {
      setSaving(false);
    }
  };

  // Volver a la página anterior
  const handleCancel = () => {
    navigate('/admin');
  };

  return (
    <Container className="py-5">
      <Card>
        <Card.Header>
          <h1 className="mb-0">{isEditMode ? 'Editar Juego' : 'Agregar Nuevo Juego'}</h1>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <p className="mt-3">Cargando datos...</p>
            </div>
          ) : (
            <>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Título*</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="title" 
                        value={formValues.title} 
                        onChange={handleChange}
                        required 
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Slug</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="slug" 
                        value={formValues.slug} 
                        onChange={handleChange}
                        disabled 
                      />
                      <Form.Text className="text-muted">
                        Generado automáticamente a partir del título
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Descripción*</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={4}
                        name="description" 
                        value={formValues.description} 
                        onChange={handleChange}
                        required 
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Precio*</Form.Label>
                          <Form.Control 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            name="price" 
                            value={formValues.price} 
                            onChange={handleChange}
                            required 
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Stock</Form.Label>
                          <Form.Control 
                            type="number" 
                            min="0" 
                            name="stock" 
                            value={formValues.stock} 
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Fecha de lanzamiento</Form.Label>
                          <Form.Control 
                            type="date" 
                            name="release_date" 
                            value={formValues.release_date} 
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Descuento (%)</Form.Label>
                          <Form.Control 
                            type="number" 
                            min="0" 
                            max="100" 
                            name="discount" 
                            value={formValues.discount} 
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Desarrollador</Form.Label>
                          <Form.Control 
                            type="text" 
                            name="developer" 
                            value={formValues.developer} 
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Publicador</Form.Label>
                          <Form.Control 
                            type="text" 
                            name="publisher" 
                            value={formValues.publisher} 
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Plataforma*</Form.Label>
                          <Form.Select 
                            name="platformId" 
                            value={formValues.platformId} 
                            onChange={handleChange}
                            required
                          >
                            <option value="">Selecciona una plataforma</option>
                            {platforms.map(platform => (
                              <option key={platform.id} value={platform.id}>
                                {platform.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Valoración (0-10)</Form.Label>
                          <Form.Control 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            max="10" 
                            name="rating" 
                            value={formValues.rating} 
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Categorías</Form.Label>
                      <Form.Select 
                        multiple 
                        name="categoryIds" 
                        value={formValues.categoryIds} 
                        onChange={handleCategoryChange}
                        style={{ height: '150px' }}
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Mantén presionado Ctrl (o Command en Mac) para seleccionar múltiples categorías
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Características</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={2}
                        name="features" 
                        value={formValues.features} 
                        onChange={handleChange}
                        placeholder="Característica 1, Característica 2, Característica 3..."
                      />
                      <Form.Text className="text-muted">
                        Separa las características con comas
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Card className="mb-3">
                      <Card.Header>Imagen del juego</Card.Header>
                      <Card.Body>
                        <div className="text-center mb-3">
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt="Vista previa" 
                              className="img-fluid mb-3"
                              style={{ maxHeight: '200px' }}
                            />
                          ) : (
                            <div 
                              className="border d-flex align-items-center justify-content-center"
                              style={{ height: '200px', backgroundColor: '#f8f9fa' }}
                            >
                              <span className="text-muted">Sin imagen</span>
                            </div>
                          )}
                          
                          <Form.Group controlId="formFile" className="mb-3">
                            <Form.Label>Seleccionar imagen</Form.Label>
                            <Form.Control 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </Form.Group>
                        </div>
                      </Card.Body>
                    </Card>
                    
                    <Card className="mb-3">
                      <Card.Header>Estado del juego</Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="checkbox" 
                            label="Destacado" 
                            name="is_featured" 
                            checked={formValues.is_featured} 
                            onChange={handleChange}
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="checkbox" 
                            label="Nuevo lanzamiento" 
                            name="is_new" 
                            checked={formValues.is_new} 
                            onChange={handleChange}
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="checkbox" 
                            label="Próximo lanzamiento" 
                            name="is_upcoming" 
                            checked={formValues.is_upcoming} 
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        {isEditMode ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      isEditMode ? 'Actualizar Juego' : 'Guardar Juego'
                    )}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GameForm; 