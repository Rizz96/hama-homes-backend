import { supabase } from '../config/supabaseClient.js';
import { validationResult } from 'express-validator';

export const createProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, price, location, image_url } = req.body;
  const landlord_id = req.user.id;

  console.log('Creating property with data:', { title, description, price, location, image_url, landlord_id });

  const { data, error } = await supabase
    .from('properties')
    .insert([{ title, description, price, location, image_url, landlord_id }])
    .select();

  if (error) {
    console.error('Error creating property:', error);
    return res.status(400).json({ error: error.message });
  }
  
  console.log('Property created successfully:', data);
  return res.status(201).json(data[0]);
};

// --- REPLACED FUNCTION ---
export const getAllProperties = async (req, res) => {
  try {
    // Start with the base query
    let query = supabase.from('properties').select('*');

    // Check for a 'location' query parameter
    if (req.query.location) {
      // Use 'ilike' for a case-insensitive search
      query = query.ilike('location', `%${req.query.location}%`);
    }

    // Check for a 'maxPrice' query parameter
    if (req.query.maxPrice) {
      query = query.lte('price', req.query.maxPrice); // lte = less than or equal to
    }

    // Execute the final query
    const { data, error } = await query;

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error("Error fetching all properties:", error);
    return res.status(400).json({ error: error.message });
  }
};

export const getPropertyById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();

    if (error) return res.status(404).json({ error: 'Property not found.' });
    return res.json(data);
};

export const updateProperty = async (req, res) => {
    const { id } = req.params;
    const { title, description, price, location } = req.body;

    const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('landlord_id')
        .eq('id', id)
        .single();
    
    if (fetchError || property.landlord_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: You do not own this property.'});
    }

    const { data, error } = await supabase
        .from('properties')
        .update({ title, description, price, location })
        .eq('id', id)
        .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data[0]);
};

export const deleteProperty = async (req, res) => {
    const { id } = req.params;

    const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('landlord_id')
        .eq('id', id)
        .single();
    
    if (fetchError || property.landlord_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: You do not own this property.'});
    }

    const { error } = await supabase.from('properties').delete().eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: 'Property deleted successfully.' });
};

// Add this to controllers/propertyController.js
// Get all properties for the currently logged-in landlord
export const getMyProperties = async (req, res) => {
  const landlord_id = req.user.id; // Get landlord ID from the 'protect' middleware

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('landlord_id', landlord_id);

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
};