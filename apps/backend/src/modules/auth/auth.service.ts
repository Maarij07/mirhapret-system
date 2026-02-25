import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateAccessToken(userId: string, email: string, role: string): string {
    const payload = {
      sub: userId,
      email,
      role,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
    } as any);
  }

  generateRefreshToken(userId: string): string {
    const payload = {
      sub: userId,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    } as any);
  }

  verifyRefreshToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async register(registerDto: RegisterDto): Promise<{ user: User; access_token: string; refresh_token: string }> {
    const { email, password, first_name, last_name, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create new user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      role: 'customer',
      is_active: true,
    });

    const savedUser = await this.usersRepository.save(user);

    // Generate tokens
    const access_token = this.generateAccessToken(savedUser.id, savedUser.email, savedUser.role);
    const refresh_token = this.generateRefreshToken(savedUser.id);

    // Store refresh token
    await this.usersRepository.update(savedUser.id, {
      refresh_token,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword as User,
      access_token,
      refresh_token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; access_token: string; refresh_token: string }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Compare passwords
    const isPasswordValid = await this.comparePasswords(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.usersRepository.update(user.id, {
      last_login_at: new Date(),
    });

    // Generate tokens
    const access_token = this.generateAccessToken(user.id, user.email, user.role);
    const refresh_token = this.generateRefreshToken(user.id);

    // Store refresh token
    await this.usersRepository.update(user.id, {
      refresh_token,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      access_token,
      refresh_token,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    // Verify refresh token
    const payload = this.verifyRefreshToken(refreshToken);

    // Find user
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify stored refresh token matches
    if (user.refresh_token !== refreshToken) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    // Generate new tokens
    const access_token = this.generateAccessToken(user.id, user.email, user.role);
    const new_refresh_token = this.generateRefreshToken(user.id);

    // Store new refresh token
    await this.usersRepository.update(user.id, {
      refresh_token: new_refresh_token,
    });

    return {
      access_token,
      refresh_token: new_refresh_token,
    };
  }

  async logout(userId: string): Promise<void> {
    // Clear refresh token
    await this.usersRepository.update(userId, {
      refresh_token: '' as any,
    });
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: userId },
    });
  }
}
