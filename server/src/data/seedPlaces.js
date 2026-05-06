import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { places } from './places.js';
import { Place } from '../models/Place.js';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env' });

const seedPlaces = async () => {
  try {
    await connectDB();
    await Place.deleteMany({});
    await Place.insertMany(places);
    console.log(`Seeded ${places.length} places`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedPlaces();
