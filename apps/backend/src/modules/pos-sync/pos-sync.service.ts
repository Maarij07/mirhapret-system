import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { POSSyncLog, Order, Product, ProductSizeInventory } from '../../entities';
import { PushSyncDto, ResolveSyncConflictDto } from './dto';

@Injectable()
export class POSSyncService {
  constructor(
    @InjectRepository(POSSyncLog)
    private syncLogRepository: Repository<POSSyncLog>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductSizeInventory)
    private inventoryRepository: Repository<ProductSizeInventory>,
  ) {}

  async pushSyncData(cashierId: string, pushSyncDto: PushSyncDto) {
    const syncLog = this.syncLogRepository.create({
      cashier_id: cashierId,
      sync_type: 'push',
      status: 'pending',
      data_pushed: pushSyncDto,
      pos_device_id: pushSyncDto.device_id,
    });

    let conflictException: ConflictException | null = null;

    try {
      // Process created orders
      for (const order of pushSyncDto.orders_created) {
        const existingOrder = await this.orderRepository.findOne({
          where: { id: order.id },
        });

        if (existingOrder && existingOrder.updated_at > pushSyncDto.sync_timestamp) {
          // Conflict detected — record it, then exit the loop cleanly
          syncLog.status = 'conflict';
          syncLog.conflict_details = {
            order_id: order.id,
            backend_updated_at: existingOrder.updated_at,
            device_updated_at: pushSyncDto.sync_timestamp,
          };
          conflictException = new ConflictException('Data conflict detected');
          break;
        }

        if (!existingOrder) {
          await this.orderRepository.save(order);
        }
      }

      // Only process inventory if no conflict was found
      if (!conflictException) {
        for (const inv of pushSyncDto.inventory_changes) {
          await this.inventoryRepository.update(inv.id, { quantity: inv.quantity });
        }
        syncLog.status = 'success';
        syncLog.synced_at = new Date();
      }
    } catch (error) {
      // Only catch genuine runtime errors, not our own business exceptions
      syncLog.status = 'failed';
      syncLog.error_message = error.message;
    }

    // Always persist the sync log so history is complete
    const saved = await this.syncLogRepository.save(syncLog);

    if (conflictException) {
      throw conflictException;
    }

    return saved;
  }

  async pullSyncData(cashierId: string, deviceId: string, lastSyncTime: Date) {
    const syncLog = this.syncLogRepository.create({
      cashier_id: cashierId,
      sync_type: 'pull',
      status: 'pending',
      pos_device_id: deviceId,
    });

    try {
      const hasLastSync = lastSyncTime && lastSyncTime.getTime() > 0;

      const updatedProducts = await this.productRepository.find({
        where: hasLastSync ? { updated_at: MoreThan(lastSyncTime) } : undefined,
        take: 1000,
      });

      const updatedInventory = await this.inventoryRepository.find({
        where: hasLastSync ? { updated_at: MoreThan(lastSyncTime) } : undefined,
        take: 1000,
      });

      syncLog.data_received = {
        products: updatedProducts,
        inventory: updatedInventory,
        last_sync: new Date(),
      };

      syncLog.status = 'success';
      syncLog.synced_at = new Date();
    } catch (error) {
      syncLog.status = 'failed';
      syncLog.error_message = error.message;
    }

    return this.syncLogRepository.save(syncLog);
  }

  async resolveSyncConflict(cashierId: string, resolveSyncConflictDto: ResolveSyncConflictDto) {
    const syncLog = await this.syncLogRepository.findOne({
      where: { id: resolveSyncConflictDto.sync_log_id, cashier_id: cashierId },
    });

    if (!syncLog) {
      throw new NotFoundException('Sync log not found');
    }

    if (syncLog.status !== 'conflict') {
      throw new BadRequestException('This sync is not in conflict state');
    }

    const conflictDetails = syncLog.conflict_details;

    if (resolveSyncConflictDto.resolution_type === 'device_wins') {
      const deviceData = syncLog.data_pushed;
      const order = deviceData.orders_created.find(
        (o: any) => o.id === conflictDetails.order_id,
      );
      if (order) {
        await this.orderRepository.save(order);
      }
    } else if (resolveSyncConflictDto.resolution_type === 'manual_merge') {
      await this.orderRepository.save(resolveSyncConflictDto.resolved_data);
    }
    // 'backend_wins' requires no action — backend data is already current

    syncLog.status = 'success';
    syncLog.synced_at = new Date();

    return this.syncLogRepository.save(syncLog);
  }

  async getSyncHistory(cashierId: string, skip = 0, take = 20) {
    const [logs, total] = await this.syncLogRepository.findAndCount({
      where: { cashier_id: cashierId },
      skip: Math.max(0, skip),
      take: Math.min(100, Math.max(1, take)),
      order: { created_at: 'DESC' },
    });
    return { logs, total };
  }

  async getPendingSyncs(cashierId: string) {
    return this.syncLogRepository.find({
      where: { cashier_id: cashierId, status: 'pending' },
    });
  }

  async getSyncStatus(syncLogId: string) {
    const log = await this.syncLogRepository.findOne({ where: { id: syncLogId } });
    if (!log) {
      throw new NotFoundException('Sync log not found');
    }
    return log;
  }
}
