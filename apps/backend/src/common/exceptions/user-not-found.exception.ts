import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(identifier: string = 'User') {
    super(`${identifier} not found`);
  }
}
