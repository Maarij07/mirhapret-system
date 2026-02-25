import {
  Controller,
  Post,
  Delete,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { UploadImageDto, UpdateImageDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('images')
@UseGuards(JwtAuthGuard)
@Roles('admin', 'super_admin', 'store_manager')
export class CloudinaryController {
  constructor(private cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: any,
    @Body() uploadImageDto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const folder = uploadImageDto.folder || 'ecommerce';
    const result = await this.cloudinaryService.uploadImage(file, folder);

    return {
      message: 'Image uploaded successfully',
      data: result,
    };
  }

  @Delete(':publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    await this.cloudinaryService.deleteImage(publicId);

    return {
      message: 'Image deleted successfully',
    };
  }

  @Put(':publicId')
  async updateImage(
    @Param('publicId') publicId: string,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    const result = await this.cloudinaryService.updateImage(
      publicId,
      updateImageDto,
    );

    return {
      message: 'Image updated successfully',
      data: result,
    };
  }
}
