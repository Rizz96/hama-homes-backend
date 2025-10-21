// backend/controllers/applicationController.js
import { supabase } from '../config/supabaseClient.js';

// Tenant creates a new application
export const createApplication = async (req, res) => {
  const tenant_id = req.user.id;
  const { property_id, message } = req.body;
  const { data, error } = await supabase
    .from('applications')
    .insert([{ property_id, tenant_id, message }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json(data[0]);
};

// Get tenant's applications
export const getMyApplications = async (req, res) => {
  const tenant_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        property:properties(id, title, location, image_url)
      `)
      .eq('tenant_id', tenant_id);

    if (error) {
      throw error;
    }

    // Add cache-busting headers
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '-1');

    return res.json(data);
  } catch (error) {
    console.error("Error fetching tenant applications:", error);
    return res.status(400).json({ error: error.message });
  }
};

// Landlord gets applications for all of their properties
export const getApplicationsForLandlord = async (req, res) => {
  const landlord_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        property: properties!inner ( title, location ),
        tenant: profiles ( email )
      `)
      .eq('properties.landlord_id', landlord_id);

    if (error) {
      console.error("Error fetching landlord's applications:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (error) {
    console.error("Error in getApplicationsForLandlord:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Landlord updates the status of an application
export const updateApplicationStatus = async (req, res) => {
  const landlord_id = req.user.id;
  const { id } = req.params;
  const { status } = req.body;

  try {
    // First, verify the application exists and belongs to this landlord
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select(`
        property:properties(landlord_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching application:', fetchError);
      return res.status(404).json({ error: 'Application not found' });
    }

    if (!application || !application.property || application.property.landlord_id !== landlord_id) {
      console.error('Permission denied: Landlord does not own this property');
      return res.status(403).json({ error: 'Forbidden: You do not own this property' });
    }

    // Update the application status
    const { data, error: updateError } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select();

    if (updateError) {
      console.error('Error updating application status:', updateError);
      return res.status(400).json({ error: updateError.message });
    }

    if (!data || data.length === 0) {
      console.error('No data returned after update');
      return res.status(400).json({ error: 'Failed to update application status' });
    }

    console.log('Application updated successfully:', data[0]);
    return res.json(data[0]);

  } catch (error) {
    console.error('Unexpected error in updateApplicationStatus:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};