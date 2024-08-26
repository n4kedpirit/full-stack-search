import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { City } from '../types';

const CityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/cities/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCity(data);
      } catch (error) {
        console.error('Error fetching city data:', error);
        setError('Error fetching city data.');
      }
    };

    fetchCityData();
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!city) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{city.name}</h1>
    </div>
  );
};

export default CityPage;
