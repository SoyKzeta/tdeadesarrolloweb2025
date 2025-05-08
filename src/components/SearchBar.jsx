import { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Form onSubmit={handleSearch} className="search-bar-container">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="Buscar juegos, accesorios..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Búsqueda"
        />
        <Button variant="warning" type="submit">
          <i className="fas fa-search"></i>
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar; 