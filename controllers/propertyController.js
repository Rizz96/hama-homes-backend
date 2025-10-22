// controllers/propertyController.js (FINAL WORKING VERSION)
import { supabase } from '../config/supabaseClient.js';
import { validationResult } from 'express-validator';

export const createProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, description, price, location } = req.body;
  const landlord_id = req.user.id;

  const { data, error } = await supabase
    .from('properties')
    .insert([{ title, description, price, location, landlord_id }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json(data[0]);
};

export const getAllProperties = async (req, res) => {
  try {
    let query = supabase.from('properties').select('*');
    if (req.query.location) query = query.ilike('location', `%${req.query.location}%`);
    if (req.query.maxPrice) query = query.lte('price', req.query.maxPrice);
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
    const { data, error } = await supabase
        .from('properties')
        .select(`*, property_images(image_url)`)
        .eq('id', id)
        .single();
    if (error) return res.status(404).json({ error: 'Property not found.' });
    return res.json(data);
};

export const updateProperty = async (req, res) => {
    const { id } = req.params;
    const { title, description, price, location } = req.body;
    const { data: property, error: fetchError } = await supabase.from('properties').select('landlord_id').eq('id', id).single();
    if (fetchError || property.landlord_id !== req.user.id) return res.status(403).json({ error: 'Forbidden: You do not own this property.'});
    const { data, error } = await supabase.from('properties').update({ title, description, price, location }).eq('id', id).select();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data[0]);
};

export const deleteProperty = async (req, res) => {
    const { id } = req.params;
    const { data: property, error: fetchError } = await supabase.from('properties').select('landlord_id').eq('id', id).single();
    if (fetchError || property.landlord_id !== req.user.id) return res.status(403).json({ error: 'Forbidden: You do not own this property.'});
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: 'Property deleted successfully.' });
};

export const getMyProperties = async (req, res) => {
  const landlord_id = req.user.id;
  const { data, error } = await supabase.from('properties').select('*').eq('landlord_id', landlord_id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
}; 

// --- FINAL: Function to add images to a property ---
export const addImagesToProperty = async (req, res) => {
    const { id } = req.params;
    const files = req.files;
    const landlord_id = req.user.id;

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded.' });
    }

    // Verify ownership
    const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('landlord_id')
        .eq('id', id)
        .single();
    
    if (fetchError || property.landlord_id !== landlord_id) {
        return res.status(403).json({ error: 'Forbidden: You do not own this property.'});
    }

    try {
        const imageUrls = [];
        for (const file of files) {
            const fileExt = file.originalname.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('property-images')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true,
                });

            if (uploadError) {
                console.error('Supabase storage upload error:', uploadError);
                throw new Error('Failed to upload image to storage.');
            }

            const { data: { publicUrl } } = supabase.storage
                .from('property-images')
                .getPublicUrl(filePath);

            imageUrls.push(publicUrl);
        }

        const { error: insertError } = await supabase
            .from('property_images')
            .insert(imageUrls.map(url => ({ property_id: id, image_url: url })));

        if (insertError) {
            console.error('Supabase DB insert error:', insertError);
            throw new Error('Failed to save image URLs to database.');
        }

        return res.status(201).json({ message: 'Images uploaded successfully', urls: imageUrls });

    } catch (error) {
        console.error('Error in addImagesToProperty:', error);
        return res.status(500).json({ error: error.message || 'An unknown error occurred during image upload.' });
    }
};