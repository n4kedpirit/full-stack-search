import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { MongoClient, Db, ObjectId } from "mongodb";

dotenv.config();

if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
  await import('./db/startAndSeedMemoryDB');
}

const PORT = process.env.PORT || 3001;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const DATABASE_URL = process.env.DATABASE_URL;

const app = express();

app.use(cors());
app.use(express.json());

let db: Db;

const connectToDatabase = async () => {
  if (!db) {
    const client = new MongoClient(DATABASE_URL);
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB");
  }
  return db;
};

// Helper function to check if a string is a valid ObjectId
const isValidObjectId = (id: string) => {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
};

// Search endpoint to search across hotels, cities, and countries
app.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const db = await connectToDatabase();

    const hotelResults = await db.collection('hotels').find({
      $or: [
        { hotel_name: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { country: { $regex: query, $options: 'i' } },
      ]
    }).toArray();

    const cityResults = await db.collection('cities').find({
      name: { $regex: query, $options: 'i' },
    }).toArray();

    const countryResults = await db.collection('countries').find({
      country: { $regex: query, $options: 'i' },
    }).toArray();

    res.json({ hotels: hotelResults, cities: cityResults, countries: countryResults });
  } catch (error) {
    console.error('Error occurred during search:', error);
    res.status(500).json({ error: 'An error occurred while searching' });
  }
});

// Get a specific hotel by ID
app.get('/hotels/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await connectToDatabase();

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const hotel = await db.collection('hotels').findOne({ _id: new ObjectId(id) });
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    console.error('Error fetching hotel data:', error);
    res.status(500).json({ error: 'An error occurred while fetching the hotel' });
  }
});

// Get a specific country by ID or ISO code
app.get('/countries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await connectToDatabase();
    
    let country;
    if (isValidObjectId(id)) {
      country = await db.collection('countries').findOne({ _id: new ObjectId(id) });
    } else {
      country = await db.collection('countries').findOne({ countryisocode: id.toUpperCase() });
    }

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    res.json(country);
  } catch (error) {
    console.error('Error fetching country data:', error);
    res.status(500).json({ error: 'An error occurred while fetching the country' });
  }
});

// Get a specific city by ID
app.get('/cities/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await connectToDatabase();

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const city = await db.collection('cities').findOne({ _id: new ObjectId(id) });
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }
    res.json(city);
  } catch (error) {
    console.error('Error fetching city data:', error);
    res.status(500).json({ error: 'An error occurred while fetching the city' });
  }
});

app.listen(PORT, () => {
  console.log(`API Server Started at ${PORT}`);
});
