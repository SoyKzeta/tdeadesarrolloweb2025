import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { getPlatforms, getGiftCardById, addGiftCard, updateGiftCard } from '../../firebase/firestore';

const GiftCardForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Estado del formulario
  const [formValues, setFormValues] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    value: '',
    stock: '',
    platformId: '',
    discount: '0',
    is_digital: true,
    is_featured: false,
    is_new: false
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar plataformas
        const platformsData = await getPlatforms();
        setPlatforms(platformsData);
        
        // Cargar datos de la tarjeta de regalo para edición
        if (isEditMode) {
          try {
            const giftCardData = await getGiftCardById(id);
            setFormValues({
              name: giftCardData.name || '',
              slug: giftCardData.slug || '',
              description: giftCardData.description || '',
              price: giftCardData.price?.toString() || '',
              value: giftCardData.value?.toString() || '',
              stock: giftCardData.stock?.toString() || '',
              platformId: giftCardData.platformId || '',
              discount: giftCardData.discount?.toString() || '0',
              is_digital: giftCardData.is_digital || true,
              is_featured: giftCardData.is_featured || false,
              is_new: giftCardData.is_new || false
            });
            
            if (giftCardData.imageUrl) {
              setImagePreview(giftCardData.imageUrl);
            }
          } catch (err) {
            console.error('Error al cargar la tarjeta de regalo:', err);
            setError('No se pudo cargar la información de la tarjeta de regalo');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, isEditMode]);

  // Generar slug automáticamente a partir del nombre
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Manejar cambios en inputs del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Si es el nombre, generar el slug automáticamente
    if (name === 'name') {
      setFormValues({
        ...formValues,
        name: value,
        slug: generateSlug(value)
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Manejar subida de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Crear URL para previsualización
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
      if (!formValues.name || !formValues.description || !formValues.price || !formValues.value || !formValues.platformId) {
        setError('Por favor, completa todos los campos obligatorios');
        setSaving(false);
        return;
      }
      
      // Crear objeto con datos para enviar a Firestore
      const giftCardData = {
        name: formValues.name,
        slug: formValues.slug,
        description: formValues.description,
        price: parseFloat(formValues.price),
        value: parseFloat(formValues.value),
        stock: parseInt(formValues.stock) || 100,
        platformId: formValues.platformId,
        discount: parseInt(formValues.discount) || 0,
        is_digital: formValues.is_digital,
        is_featured: formValues.is_featured,
        is_new: formValues.is_new
      };
      
      if (isEditMode) {
        await updateGiftCard(id, giftCardData, imageFile);
        setSuccess('Tarjeta de regalo actualizada con éxito');
      } else {
        await addGiftCard(giftCardData, imageFile);
        setSuccess('Tarjeta de regalo agregada con éxito');
        
        // Limpiar formulario
        setFormValues({
          name: '',
          slug: '',
          description: '',
          price: '',
          value: '',
          stock: '',
          platformId: '',
          discount: '0',
          is_digital: true,
          is_featured: false,
          is_new: false
        });
        setImageFile(null);
        setImagePreview('');
      }
      
      setSaving(false);
      
      // Opcional: redirigir a la lista después de guardar
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
      
    } catch (err) {
      console.error('Error al guardar tarjeta de regalo:', err);
      setError(`Error al ${isEditMode ? 'actualizar' : 'agregar'} la tarjeta de regalo. Por favor, inténtalo de nuevo.`);
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
          <h1 className="mb-0">{isEditMode ? 'Editar Tarjeta de Regalo' : 'Agregar Nueva Tarjeta de Regalo'}</h1>
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
                      <Form.Label>Nombre*</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="name" 
                        value={formValues.name} 
                        onChange={handleChange}
                        required 
                        placeholder="PlayStation Store Gift Card $20"
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
                        Generado automáticamente a partir del nombre
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
                        placeholder="Tarjeta de regalo para comprar juegos y contenido digital en PlayStation Store"
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Precio de Venta*</Form.Label>
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
                          <Form.Label>Valor de la Tarjeta*</Form.Label>
                          <Form.Control 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            name="value" 
                            value={formValues.value} 
                            onChange={handleChange}
                            required 
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
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
                  
                  <Col md={4}>
                    <Card className="mb-3">
                      <Card.Header>Imagen de la Tarjeta</Card.Header>
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
                      <Card.Header>Opciones</Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="checkbox" 
                            label="Entrega digital" 
                            name="is_digital" 
                            checked={formValues.is_digital} 
                            onChange={handleChange}
                          />
                        </Form.Group>
                        
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
                            label="Nuevo" 
                            name="is_new" 
                            checked={formValues.is_new} 
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
                      isEditMode ? 'Actualizar Tarjeta de Regalo' : 'Guardar Tarjeta de Regalo'
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

export default GiftCardForm; 