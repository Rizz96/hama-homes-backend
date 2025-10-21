// backend/middleware/authMiddleware.js (DEFINITIVE, CORRECTED VERSION)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ message: 'Not authorized, token failed.' });
      }

      req.user = user;
      next(); // Proceed to the next middleware/controller

    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token processing error.' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

export const isLandlord = (req, res, next) => {
  if (req.user && req.user.user_metadata.role === 'landlord') {
    next();
  } else {
    return res.status(403).json({ error: 'Forbidden: Requires landlord role.' });
  }
};