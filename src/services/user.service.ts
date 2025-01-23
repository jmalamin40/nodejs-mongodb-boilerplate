import { User } from '../models/user.model';
import { AppError, UserRole } from '../types';
import { IUser } from '../models/user.model'; // Import IUser interface

export class UserService {
  static async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find()
        .select('-refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(id: string) {
    const user = await User.findById(id).select('-refreshToken');
    if (!user) {
      throw new AppError(404, 'error', 'User not found');
    }
    return user;
  }

  static async updateUser(id: string, updates: Partial<IUser>) {  // Use Partial<IUser> instead of Partial<User>
    // Prevent role escalation
    if (updates.role === UserRole.ADMIN) {
      throw new AppError(403, 'error', 'Cannot escalate user to admin role');
    }

    const user = await User.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true }
    ).select('-refreshToken');

    if (!user) {
      throw new AppError(404, 'error', 'User not found');
    }

    return user;
  }

  static async deleteUser(id: string) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError(404, 'error', 'User not found');
    }

    if (user.role === UserRole.ADMIN) {
      throw new AppError(403, 'error', 'Cannot delete admin user');
    }

    await user.deleteOne();
  }
}
