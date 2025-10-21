// backend/controllers/authController.js
import { supabase } from '../config/supabaseClient.js';

export const signUp = async (req, res) => {
  const { email, password, role } = req.body;

  if (!['tenant', 'landlord'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified.' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: role },
    },
  });

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ user: data.user });
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(401).json({ error: 'Invalid credentials' });
  return res.status(200).json({ session: data.session });
};

export const getProfile = async (req, res) => {
  // The 'protect' middleware has already fetched the user and attached it to req.user
  const user = req.user;

  try {
    if (user.user_metadata.role === 'landlord') {
      // If the user is a landlord, fetch their properties
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', user.id);

      if (error) throw error;

      // Return the user object with their properties nested inside
      return res.json({ ...user, properties });

    } else if (user.user_metadata.role === 'tenant') {
      // If the user is a tenant, fetch their applications
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*, property:properties(title)')
        .eq('tenant_id', user.id);

      if (error) throw error;

      // Return the user object with their applications nested inside
      return res.json({ ...user, applications });
    }

    // For any other case, just return the basic user object
    return res.json(user);

  } catch (error) {
    console.error("Error fetching profile data:", error);
    return res.status(400).json({ error: "Failed to fetch profile data." });
  }
};