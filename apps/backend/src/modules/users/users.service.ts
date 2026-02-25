import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities';
import { UpdateUserDto, ChangePasswordDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getUserProfile(userId: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        select: [
          'id',
          'email',
          'first_name',
          'last_name',
          'phone',
          'role',
          'is_active',
          'created_at',
          'updated_at',
        ],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to fetch user profile: ${error.message}`);
    }
  }

  async updateUserProfile(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if email is already taken
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.usersRepository.findOne({
          where: { email: updateUserDto.email },
        });
        if (existingUser) {
          throw new ConflictException('Email already in use');
        }
      }

      await this.usersRepository.update(userId, updateUserDto);
      return this.getUserProfile(userId);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update user profile: ${error.message}`);
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const isPasswordValid = await bcrypt.compare(
        changePasswordDto.old_password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Old password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(changePasswordDto.new_password, 10);
      await this.usersRepository.update(userId, {
        password: hashedPassword,
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to change password: ${error.message}`);
    }
  }

  async listUsers(skip: number = 0, take: number = 10): Promise<{ users: User[]; total: number }> {
    try {
      const [users, total] = await this.usersRepository.findAndCount({
        skip,
        take,
        select: [
          'id',
          'email',
          'first_name',
          'last_name',
          'phone',
          'role',
          'is_active',
          'created_at',
        ],
        order: { created_at: 'DESC' },
      });

      return { users, total };
    } catch (error) {
      throw new BadRequestException(`Failed to list users: ${error.message}`);
    }
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      await this.usersRepository.remove(user);
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to delete user: ${error.message}`);
    }
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    try {
      const validRoles = ['customer', 'store_manager', 'admin', 'super_admin'];
      if (!validRoles.includes(role)) {
        throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }

      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      await this.usersRepository.update(userId, { role: role as any });
      return this.getUserProfile(userId);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update user role: ${error.message}`);
    }
  }
}
