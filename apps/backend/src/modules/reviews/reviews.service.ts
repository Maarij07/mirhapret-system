import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductReview, Product, Order, OrderItem } from '../../entities';
import { CreateReviewDto, UpdateReviewDto, ApproveReviewDto } from './dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ProductReview)
    private reviewRepository: Repository<ProductReview>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async getProductReviews(productId: string, skip = 0, take = 20) {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { product_id: productId, is_approved: true },
      relations: ['user'],
      skip,
      take,
      order: { helpful_count: 'DESC', created_at: 'DESC' },
    });

    return { reviews, total };
  }

  async getProductRating(productId: string) {
    const reviews = await this.reviewRepository.find({
      where: { product_id: productId, is_approved: true },
    });

    if (reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0, distribution: {} };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / reviews.length;

    const distribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return {
      averageRating: parseFloat(average.toFixed(2)),
      totalReviews: reviews.length,
      distribution,
    };
  }

  async createReview(userId: string, createReviewDto: CreateReviewDto) {
    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: createReviewDto.product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user has purchased this product (verified purchase)
    // Find orders for this customer with status 'delivered'
    const userOrders = await this.orderRepository.find({
      where: { customer_id: userId, status: 'delivered' },
    });

    // Check if any of the delivered orders contain the product
    const orderIds = userOrders.map(o => o.id);
    const orderItemExists = orderIds.length > 0
      ? await this.orderItemRepository.findOne({
          where: { order_id: In(orderIds), product_id: createReviewDto.product_id },
        })
      : null;

    const isVerifiedPurchase = !!orderItemExists;

    // Check if user already reviewed
    const existing = await this.reviewRepository.findOne({
      where: { product_id: createReviewDto.product_id, user_id: userId },
    });

    if (existing) {
      throw new BadRequestException('You have already reviewed this product');
    }

    // Validate rating
    if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const review = this.reviewRepository.create({
      product_id: createReviewDto.product_id,
      user_id: userId,
      rating: createReviewDto.rating,
      title: createReviewDto.title,
      comment: createReviewDto.comment,
      is_verified_purchase: isVerifiedPurchase,
      is_approved: false, // Moderation required
    });

    const saved = await this.reviewRepository.save(review);
    return {
      ...saved,
      product,
    };
  }

  async updateReview(userId: string, reviewId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, user_id: userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (updateReviewDto.rating) {
      if (updateReviewDto.rating < 1 || updateReviewDto.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }
    }

    Object.assign(review, updateReviewDto);
    const updated = await this.reviewRepository.save(review);

    return updated;
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, user_id: userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewRepository.delete(reviewId);
    return { message: 'Review deleted' };
  }

  async approveReview(reviewId: string, approveReviewDto: ApproveReviewDto) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.is_approved = approveReviewDto.is_approved;
    const updated = await this.reviewRepository.save(review);

    return updated;
  }

  async markHelpful(reviewId: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.helpful_count += 1;
    const updated = await this.reviewRepository.save(review);

    return updated;
  }

  async getUserReviews(userId: string, skip = 0, take = 20) {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { user_id: userId },
      relations: ['product'],
      skip,
      take,
      order: { created_at: 'DESC' },
    });

    return { reviews, total };
  }

  async getPendingReviews(skip = 0, take = 20) {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { is_approved: false },
      relations: ['user', 'product'],
      skip,
      take,
      order: { created_at: 'ASC' },
    });

    return { reviews, total };
  }
}
