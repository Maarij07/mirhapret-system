import {
  Injectable,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: any, folder = 'ecommerce'): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    try {
      const result: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto',
            transformation: [{ width: 1000, crop: 'scale' }],
          },
          (error, res) => (error ? reject(error) : resolve(res)),
        );
        stream.end(file.buffer);
      });

      return {
        id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        size: result.bytes,
        format: result.format,
      };
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok') {
        throw new NotFoundException(`Image with ID ${publicId} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }

  async updateImage(publicId: string, updates: { tags?: string[]; context?: Record<string, any> }): Promise<any> {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }
    try {
      const result = await cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        tags: updates.tags || [],
        context: updates.context || {},
      });
      return {
        id: result.public_id,
        url: result.secure_url,
        tags: result.tags,
        context: result.context,
      };
    } catch (error) {
      throw new BadRequestException(`Update failed: ${error.message}`);
    }
  }

  getImageUrl(publicId: string, transformations?: Record<string, any>): string {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }
    return cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      ...transformations,
    });
  }
}
