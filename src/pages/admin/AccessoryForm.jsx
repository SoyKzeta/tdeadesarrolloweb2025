import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { getPlatforms, getCategories, getAccessoryById, updateAccessory, addAccessory } from '../../firebase/firestore';

const AccessoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  
  const [formValues, setFormValues] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    platformIds: [],
    categoryIds: [],
    brand: '',
    model: '',
    features: '',
    compatibility: '',
    color: '',
    discount: '0',
    is_featured: false,
    is_new: false
  });

  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        
        const [platformsData, categoriesData] = await Promise.all([
          getPlatforms(),
          getCategories()
        ]);
        
        setPlatforms(platformsData);
        
        
        const accessoryCategories = categoriesData.filter(cat => 
          cat.slug.includes('accesorio') || 
          cat.slug.includes('perifericos') ||
          cat.slug.includes('componentes') ||
          cat.name.toLowerCase().includes('accesorio')
        );
        
        setCategories(accessoryCategories.length > 0 ? accessoryCategories : categoriesData);
        
        
        if (isEditMode && id) {
          try {
            const accessoryData = await getAccessoryById(id);
            
            
            setFormValues({
              title: accessoryData.title || '',
              slug: accessoryData.slug || '',
              description: accessoryData.description || '',
              price: accessoryData.price?.toString() || '',
              stock: accessoryData.stock?.toString() || '',
              platformIds: accessoryData.platformIds || [],
              categoryIds: accessoryData.categoryIds || [],
              brand: accessoryData.brand || '',
              model: accessoryData.model || '',
              features: accessoryData.features || '',
              compatibility: accessoryData.compatibility || '',
              color: accessoryData.color || '',
              discount: accessoryData.discount?.toString() || '0',
              is_featured: accessoryData.is_featured || false,
              is_new: accessoryData.is_new || false
            });
            
            
            if (accessoryData.imageUrl) {
              setImagePreview(accessoryData.imageUrl);
            }
          } catch (error) {
            console.error('Error al cargar el accesorio:', error);
            setError('No se pudo cargar el accesorio para editar.');
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

  
  const generateSlug = (title) => {
    return title
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

  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    
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

  
  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setFormValues({
      ...formValues,
      [name]: selectedValues
    });
  };

  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      
      if (!formValues.title || !formValues.description || !formValues.price) {
        setError('Por favor, completa todos los campos obligatorios');
        setSaving(false);
        return;
      }
      
      
      if (isEditMode && id) {
        
        await updateAccessory(id, formValues, imageFile);
        setSuccess('Accesorio actualizado con éxito');
      } else {
        
        await addAccessory(formValues, imageFile);
        setSuccess('Accesorio agregado con éxito');
      }
      
      
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
      
      
      if (!isEditMode) {
        setFormValues({
          title: '',
          slug: '',
          description: '',
          price: '',
          stock: '',
          platformIds: [],
          categoryIds: [],
          brand: '',
          model: '',
          features: '',
          compatibility: '',
          color: '',
          discount: '0',
          is_featured: false,
          is_new: false
        });
        setImageFile(null);
        setImagePreview('');
      }
      
      setSaving(false);
    } catch (err) {
      console.error('Error al guardar accesorio:', err);
      setError(`Error al ${isEditMode ? 'actualizar' : 'agregar'} el accesorio. Por favor, inténtalo de nuevo.`);
      setSaving(false);
    }
  };

  
  const handleCancel = () => {
    navigate('/admin');
  };

  return (
    <Container className="py-5">
      <Card>
        <Card.Header>
          <h1 className="mb-0">{isEditMode ? 'Editar Accesorio' : 'Agregar Nuevo Accesorio'}</h1>
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
                          <Form.Label>Precio (COP)*</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>COL$</InputGroup.Text>
                            <Form.Control 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              name="price" 
                              value={formValues.price} 
                              onChange={handleChange}
                              required 
                              placeholder="0.00"
                            />
                          </InputGroup>
                          <Form.Text className="text-muted">
                            Ingrese el precio en Pesos Colombianos (COP)
                          </Form.Text>
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
                          <Form.Label>Marca</Form.Label>
                          <Form.Control 
                            type="text" 
                            name="brand" 
                            value={formValues.brand} 
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Modelo</Form.Label>
                          <Form.Control 
                            type="text" 
                            name="model" 
                            value={formValues.model} 
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Color</Form.Label>
                          <Form.Control 
                            type="text" 
                            name="color" 
                            value={formValues.color} 
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
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Compatibilidad</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="compatibility" 
                        value={formValues.compatibility} 
                        onChange={handleChange}
                        placeholder="PlayStation 5, PC, Xbox Series X..."
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Plataformas compatibles</Form.Label>
                          <Form.Select 
                            multiple 
                            name="platformIds" 
                            value={formValues.platformIds} 
                            onChange={handleMultiSelectChange}
                            style={{ height: '150px' }}
                          >
                            {platforms.map(platform => (
                              <option key={platform.id} value={platform.id}>
                                {platform.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Text className="text-muted">
                            Mantén presionado Ctrl (o Command en Mac) para seleccionar múltiples plataformas
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Categorías</Form.Label>
                          <Form.Select 
                            multiple 
                            name="categoryIds" 
                            value={formValues.categoryIds} 
                            onChange={handleMultiSelectChange}
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
                      </Col>
                    </Row>
                  </Col>
                  
                  <Col md={4}>
                    <Card className="mb-3">
                      <Card.Header>Imagen del accesorio</Card.Header>
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
                      <Card.Header>Estado del accesorio</Card.Header>
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
                      isEditMode ? 'Actualizar Accesorio' : 'Guardar Accesorio'
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

export default AccessoryForm; 