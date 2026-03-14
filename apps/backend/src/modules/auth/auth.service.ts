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
import * as crypto from 'crypto';
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

  // ─── Token helpers ──────────────────────────────────────────────────────────

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * One-way SHA-256 hash for refresh token storage.
   * Fast (tokens already have entropy) and avoids storing raw tokens in DB.
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  generateAccessToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
      } as any,
    );
  }

  generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
      } as any,
    );
  }

  verifyRefreshToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ─── Auth operations ─────────────────────────────────────────────────────────

  async register(registerDto: RegisterDto): Promise<{ user: Omit<User, 'password' | 'refresh_token'>; access_token: string; refresh_token: string }> {
    const { email, password, first_name, last_name, phone } = registerDto;

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await this.hashPassword(password);

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

    const access_token = this.generateAccessToken(savedUser.id, savedUser.email, savedUser.role);
    const refresh_token = this.generateRefreshToken(savedUser.id);

    // Store only the hash — raw token never persisted
    await this.usersRepository.update(savedUser.id, {
      refresh_token: this.hashToken(refresh_token),
    });

    const { password: _, refresh_token: __, ...userSafe } = savedUser;
    return { user: userSafe as any, access_token, refresh_token };
  }

  async login(loginDto: LoginDto): Promise<{ user: Omit<User, 'password' | 'refresh_token'>; access_token: string; refresh_token: string }> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });

    // Constant-time response regardless of whether user exists (prevents user enumeration)
    if (!user) {
      await bcrypt.hash(password, 10); // dummy hash to equalise timing
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await this.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const access_token = this.generateAccessToken(user.id, user.email, user.role);
    const refresh_token = this.generateRefreshToken(user.id);

    // Store hash + update last login in a single query
    await this.usersRepository.update(user.id, {
      refresh_token: this.hashToken(refresh_token),
      last_login_at: new Date(),
    });

    const { password: _, refresh_token: __, ...userSafe } = user;
    return { user: userSafe as any, access_token, refresh_token };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const payload = this.verifyRefreshToken(refreshToken);

    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.refresh_token) {
      throw new UnauthorizedException('Session expired, please log in again');
    }

    // Compare hash of incoming token against stored hash
    const incomingHash = this.hashToken(refreshToken);
    if (user.refresh_token !== incomingHash) {
      // Possible token theft — invalidate session immediately
      await this.usersRepository.update(user.id, { refresh_token: null as any });
      throw new UnauthorizedException('Refresh token invalid, session terminated');
    }

    const access_token = this.generateAccessToken(user.id, user.email, user.role);
    const new_refresh_token = this.generateRefreshToken(user.id);

    await this.usersRepository.update(user.id, {
      refresh_token: this.hashToken(new_refresh_token),
    });

    return { access_token, refresh_token: new_refresh_token };
  }

  async logout(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { refresh_token: null as any });
  }

  async validateUser(userId: string): Promise<Omit<User, 'password' | 'refresh_token'> | null> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'store_id'],
    });
    return user;
  }
}
