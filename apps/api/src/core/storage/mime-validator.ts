import { BadRequestException } from '@nestjs/common';

// Allowed MIME types and their magic byte signatures
const ALLOWED_TYPES: Record<string, { magic: Buffer[]; ext: string[] }> = {
  'image/jpeg': {
    magic: [Buffer.from([0xff, 0xd8, 0xff])],
    ext: ['jpg', 'jpeg'],
  },
  'image/png': {
    magic: [Buffer.from([0x89, 0x50, 0x4e, 0x47])],
    ext: ['png'],
  },
  'image/gif': {
    magic: [Buffer.from('GIF87a'), Buffer.from('GIF89a')],
    ext: ['gif'],
  },
  'image/webp': {
    magic: [Buffer.from('RIFF')], // RIFF....WEBP — checked with additional offset
    ext: ['webp'],
  },
  'application/pdf': {
    magic: [Buffer.from('%PDF')],
    ext: ['pdf'],
  },
  'application/msword': {
    magic: [Buffer.from([0xd0, 0xcf, 0x11, 0xe0])], // OLE compound document
    ext: ['doc'],
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    magic: [Buffer.from([0x50, 0x4b, 0x03, 0x04])], // ZIP (OOXML)
    ext: ['docx'],
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    magic: [Buffer.from([0x50, 0x4b, 0x03, 0x04])],
    ext: ['xlsx'],
  },
  'text/plain': {
    magic: [], // text files don't have magic bytes; check extension only
    ext: ['txt', 'log', 'csv'],
  },
};

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function validateMimeType(buffer: Buffer, originalMimeType: string, filename: string): void {
  const declared = originalMimeType.toLowerCase().split(';')[0].trim();

  if (!ALLOWED_TYPES[declared]) {
    throw new BadRequestException(`Tipo de arquivo não permitido: ${declared}`);
  }

  const { magic, ext } = ALLOWED_TYPES[declared];
  const fileExt = filename.split('.').pop()?.toLowerCase() ?? '';

  // Extension check
  if (ext.length > 0 && !ext.includes(fileExt)) {
    throw new BadRequestException(`Extensão de arquivo inválida para o tipo ${declared}`);
  }

  // Magic bytes check (skip for text/plain)
  if (magic.length > 0) {
    const matchesMagic = magic.some((signature) => buffer.slice(0, signature.length).equals(signature));
    if (!matchesMagic) {
      throw new BadRequestException(
        `O conteúdo do arquivo não corresponde ao tipo declarado (${declared}). Upload rejeitado por segurança.`,
      );
    }
  }

  // Extra WEBP check
  if (declared === 'image/webp') {
    const webpMarker = buffer.slice(8, 12).toString('ascii');
    if (webpMarker !== 'WEBP') {
      throw new BadRequestException('Arquivo WEBP inválido');
    }
  }
}

export function validateFileSize(sizeBytes: number): void {
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new BadRequestException(
      `Arquivo excede o tamanho máximo permitido (${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB)`,
    );
  }
}
