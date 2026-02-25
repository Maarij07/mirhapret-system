import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: any, folder: string = 'ecommerce'): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
              { width: 1000, crop: 'scale' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        uploadStream.end(file.buffer);
      });

      return {
        id: (result as any).public_id,
        url: (result as any).secure_url,
        width: (result as any).width,
        height: (result as any).height,
        size: (result as any).bytes,
        format: (result as any).format,
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

  async updateImage(publicId: string, updates: any): Promise<any> {
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

  async getImageUrl(publicId: string, transformations?: any): Promise<string> {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    const defaultTransformations = {
      quality: 'auto',
      fetch_format: 'auto',
    };

    const finalTransformations = {
      ...defaultTransformations,
      ...transformations,
    };

    return cloudinary.url(publicId, finalTransformations);
  }
}
