import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Hotel } from '../types';

const HotelPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/hotels/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setHotel(data);
      } catch (error) {
        console.error('Error fetching hotel data:', error);
        setError('Error fetching hotel data.');
      }
    };

    fetchHotelData();
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!hotel) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{hotel.hotel_name}</h1>
      <p>{hotel.city}, {hotel.country}</p>
      {/* Add more hotel details here */}
    </div>
  );
};

export default HotelPage;
