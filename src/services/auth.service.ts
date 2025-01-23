import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { config } from '../config';
import { AppError, TokenPayload, TokenPair, UserRole } from '../types';

export class AuthService {
  static async register(email: string, password: string, name: string, role: UserRole = UserRole.USER) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(400, 'error', 'Email already exists');
    }

    const user = await User.create({
      email,
      password,
      name,
      role,
    });

    const tokens = await this.generateTokenPair(user._id.toString(), user.role);
    
    // Save refresh token hash
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError(401, 'error', 'Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError(401, 'error', 'Invalid credentials');
    }

    const tokens = await this.generateTokenPair(user._id.toString(), user.role);
    
    // Update refresh token and last login
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as TokenPayload;

      // Ensure it's a refresh token
      if (decoded.type !== 'refresh') {
        throw new AppError(401, 'error', 'Invalid token type');
      }

      const user = await User.findById(decoded.userId).select('+refreshToken');
      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError(401, 'error', 'Invalid refresh token');
      }

      const tokens = await this.generateTokenPair(user._id.toString(), user.role);
      
      // Update refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (error) {
      throw new AppError(401, 'error', 'Invalid refresh token');
    }
  }

  static async logout(userId: string) {
    await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 },
    });
  }

  private static async generateTokenPair(userId: string, role: string): Promise<TokenPair> {
    const accessToken = jwt.sign(
      { userId, role, type: 'access' } as TokenPayload,
      config.jwt.secret,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { userId, role, type: 'refresh' } as TokenPayload,
      config.jwt.refreshSecret,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}