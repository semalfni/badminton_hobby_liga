import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: 'admin' | 'league_manager' | 'team_manager' | 'observer';
    team_id: number | null;
  };
}

export function generateToken(user: { id: number; username: string; role: string; team_id: number | null }) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, team_id: user.team_id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = user;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export function requireTeamAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Admins and league_managers have access to all teams
  if (req.user.role === 'admin' || req.user.role === 'league_manager') {
    return next();
  }

  // Team managers can only access their own team
  const teamId = parseInt(req.params.teamId || req.body.team_id);
  if (req.user.role === 'team_manager' && req.user.team_id === teamId) {
    return next();
  }

  return res.status(403).json({ error: 'Access denied to this team' });
}

export function requireCanEdit(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role === 'observer') {
    return res.status(403).json({ error: 'Observers cannot edit data' });
  }

  next();
}

export function requireCanDelete(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role === 'admin' || req.user.role === 'league_manager') {
    return next();
  }

  return res.status(403).json({ error: 'Insufficient permissions to delete' });
}

