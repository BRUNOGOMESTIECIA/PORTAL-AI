import { Controller, Get, Param } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('devices')
  async getAllDevices() {
    return this.assetsService.getAllDevices();
  }

  @Get('users/:identifier/devices')
  async getUserDevices(@Param('identifier') identifier: string) {
    return this.assetsService.getDevicesByUser(identifier);
  }

  @Get('devices/:id')
  async getDeviceById(@Param('id') id: string) {
    return this.assetsService.getDeviceById(id);
  }

  @Get('printers')
  async getPrinters() {
    return this.assetsService.getPrinters();
  }
}

