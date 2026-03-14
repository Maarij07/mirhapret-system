import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CustomerAddress, User } from '../../entities';
import { CreateAddressDto, UpdateAddressDto } from './dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(CustomerAddress)
    private addressRepository: Repository<CustomerAddress>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAddresses(userId: string): Promise<CustomerAddress[]> {
    return this.addressRepository.find({
      where: { user_id: userId },
      order: { is_default_shipping: 'DESC', created_at: 'DESC' },
    });
  }

  async getAddressById(userId: string, addressId: string): Promise<CustomerAddress> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user_id: userId },
    });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async createAddress(userId: string, createAddressDto: CreateAddressDto): Promise<CustomerAddress> {
    // Fetch user's name and phone so the address record has real data
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['first_name', 'last_name', 'phone'],
    });

    if (createAddressDto.is_default) {
      await this.addressRepository.update(
        { user_id: userId },
        { is_default_shipping: false, is_default_billing: false },
      );
    }

    const address = this.addressRepository.create({
      user_id: userId,
      full_name: user ? `${user.first_name} ${user.last_name}`.trim() : '',
      phone_number: user?.phone || '',
      street_address: createAddressDto.street_address,
      city: createAddressDto.city,
      province: createAddressDto.province,
      postal_code: createAddressDto.postal_code,
      country: createAddressDto.country,
      type: (createAddressDto.address_type || 'both') as any,
      is_default_shipping: createAddressDto.is_default || false,
      is_default_billing: createAddressDto.is_default || false,
    });

    return this.addressRepository.save(address);
  }

  async updateAddress(
    userId: string,
    addressId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<CustomerAddress> {
    const address = await this.getAddressById(userId, addressId);

    if (updateAddressDto.is_default === true) {
      await this.addressRepository.update(
        { user_id: userId },
        { is_default_shipping: false, is_default_billing: false },
      );
    }

    if (updateAddressDto.street_address !== undefined) address.street_address = updateAddressDto.street_address;
    if (updateAddressDto.city !== undefined) address.city = updateAddressDto.city;
    if (updateAddressDto.province !== undefined) address.province = updateAddressDto.province;
    if (updateAddressDto.postal_code !== undefined) address.postal_code = updateAddressDto.postal_code;
    if (updateAddressDto.country !== undefined) address.country = updateAddressDto.country;
    if (updateAddressDto.is_default !== undefined) {
      address.is_default_shipping = updateAddressDto.is_default;
      address.is_default_billing = updateAddressDto.is_default;
    }

    return this.addressRepository.save(address);
  }

  async deleteAddress(userId: string, addressId: string): Promise<{ message: string }> {
    const address = await this.getAddressById(userId, addressId);

    // If this was the default, promote the next most recent address
    if (address.is_default_shipping || address.is_default_billing) {
      const nextAddress = await this.addressRepository.findOne({
        where: { user_id: userId, id: Not(addressId) },
        order: { created_at: 'DESC' },
      });

      if (nextAddress) {
        nextAddress.is_default_shipping = address.is_default_shipping;
        nextAddress.is_default_billing = address.is_default_billing;
        await this.addressRepository.save(nextAddress);
      }
    }

    await this.addressRepository.delete(addressId);
    return { message: 'Address deleted' };
  }

  async getDefaultAddress(userId: string): Promise<CustomerAddress | null> {
    return this.addressRepository.findOne({
      where: { user_id: userId, is_default_shipping: true },
    }) || null;
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<CustomerAddress> {
    const address = await this.getAddressById(userId, addressId);

    await this.addressRepository.update(
      { user_id: userId },
      { is_default_shipping: false, is_default_billing: false },
    );

    address.is_default_shipping = true;
    address.is_default_billing = true;
    return this.addressRepository.save(address);
  }
}
