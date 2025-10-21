// backend/controllers/userController.js (HYBRID VERSION)
import { supabase } from '../config/supabaseClient.js';

export const getFavorites = async (req, res) => {
  const user_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('property_id, properties(id, title, location, image_url)')
      .eq('user_id', user_id);

    if (error) {
      throw error;
    }

    // Extract just the property IDs for easier checking
    const favoriteIds = data.map(fav => fav.property_id);
    const favoriteProperties = data.map(fav => fav.properties);

    return res.json({
      favoriteIds,
      favoriteProperties
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return res.status(400).json({ error: error.message });
  }
};

export const addFavorite = async (req, res) => {
  const user_id = req.user.id;
  const { propertyId } = req.params;

  if (!propertyId) {
    return res.status(400).json({ error: 'Property ID is required.' });
  }

  try {
    // Check if already favorited to prevent duplicates
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('property_id', propertyId);

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Property already in favorites' });
    }

    // Add to favorites
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id, property_id: propertyId }])
      .select();

    if (error) {
      throw error;
    }

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error adding favorite:', error);
    return res.status(400).json({ error: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  const user_id = req.user.id;
  const { propertyId } = req.params;

  if (!propertyId) {
    return res.status(400).json({ error: 'Property ID is required.' });
  }

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user_id)
      .eq('property_id', propertyId);

    if (error) {
      throw error;
    }

    return res.json({ message: 'Favorite removed successfully.' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return res.status(400).json({ error: error.message });
  }
};

// --- NEW FUNCTION TO UPDATE USER PROFILE ---
export const updateUserProfile = async (req, res) => {
  const user = req.user;
  const { name } = req.body; // We'll start by allowing them to update their name

  if (!name) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { user_metadata: { ...user.user_metadata, name: name } }
    );

    if (error) throw error;

    return res.json(data.user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(400).json({ error: "Failed to update profile." });
  }
};