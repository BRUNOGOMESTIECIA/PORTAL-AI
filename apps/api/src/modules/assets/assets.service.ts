import { Injectable } from '@nestjs/common';

const MOCK_API_DEVICES = [
  {
    id: 'dev_cel_001',
    type: 'smartphone',
    name: 'Smartphone Corporativo',
    model: 'Samsung Galaxy S21',
    serial: '357123048765432',
    patrimony: 'CEL-00456',
    imei: '357123048765432',
    os: 'Android',
    osVersion: '13.0',
    status: 'online',
    battery: 78,
    storage: { used: 38, total: 128 },
    ram: { used: 3.2, total: 8 },
    user: 'André Carvalho',
    company: 'Empresa Matriz',
    unit: 'São Paulo - SP',
    sector: 'Comercial',
    location: 'São Paulo - SP',
    lastSeen: '2026-07-17T11:58:00Z',
    uptime: '3d 14h 22m',
    ip: '192.168.1.105',
    mac: 'A4:70:D6:88:12:BC',
    cpuUsage: 24,
    temperature: 38,
    antivirus: 'ok',
    encryptionEnabled: true,
  },
  {
    id: 'dev_nb_001',
    type: 'notebook',
    name: 'Notebook Corporativo',
    model: 'Dell Latitude 5420',
    serial: '5F8Y2L3',
    patrimony: 'NTB-10234',
    os: 'Windows',
    osVersion: '11 Pro 23H2',
    status: 'online',
    battery: 54,
    storage: { used: 210, total: 512 },
    ram: { used: 10.4, total: 16 },
    user: 'André Carvalho',
    company: 'Empresa Matriz',
    unit: 'São Paulo - SP',
    sector: 'Comercial',
    location: 'São Paulo - SP',
    lastSeen: '2026-07-17T11:55:00Z',
    uptime: '1d 6h 41m',
    ip: '192.168.1.108',
    mac: 'B8:27:EB:44:3A:1F',
    cpuUsage: 61,
    temperature: 56,
    antivirus: 'ok',
    encryptionEnabled: true,
  },
  {
    id: 'dev_nb_002',
    type: 'notebook',
    name: 'Notebook Filial CPS',
    model: 'Lenovo ThinkPad E15',
    serial: 'R9KL22M4',
    patrimony: 'NTB-10102',
    os: 'Windows',
    osVersion: '11 Pro 22H2',
    status: 'warning',
    battery: 12,
    storage: { used: 480, total: 512 },
    ram: { used: 14.8, total: 16 },
    user: 'Paulo Silva',
    company: 'Filial CPS',
    unit: 'Campinas - SP',
    sector: 'Logística',
    location: 'Campinas - SP',
    lastSeen: '2026-07-17T11:50:00Z',
    uptime: '5d 2h 10m',
    ip: '10.0.1.45',
    mac: '00:1B:44:11:3A:B7',
    cpuUsage: 89,
    temperature: 82,
    antivirus: 'outdated',
    encryptionEnabled: false,
  }
];

@Injectable()
export class AssetsService {
  async getAllDevices() {
    return MOCK_API_DEVICES;
  }

  async getDevicesByUser(user: string) {
    // Busca simulando que email ou nome vem na string user. 
    // Como os mocks usam nome, vamos flexibilizar.
    return MOCK_API_DEVICES.filter(d => 
      d.user.toLowerCase().includes(user.toLowerCase())
    );
  }

  async getDeviceById(id: string) {
    return MOCK_API_DEVICES.find(d => d.id === id);
  }
}
