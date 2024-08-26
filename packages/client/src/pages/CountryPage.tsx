import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Country } from '../types';

const CountryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [country, setCountry] = useState<Country | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/countries/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCountry(data);
      } catch (error) {
        console.error('Error fetching country data:', error);
        setError('Error fetching country data.');
      }
    };

    fetchCountryData();
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!country) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{country.country}</h1>
    </div>
  );
};

export default CountryPage;
