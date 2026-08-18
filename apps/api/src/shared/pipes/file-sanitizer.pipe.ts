import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';

const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh',
  '.ps1', '.ps2', '.msi', '.msp', '.scr', '.dll', '.cpl', '.jar', '.com',
  '.pif', '.hta', '.iso', '.img', '.php', '.sh', '.py', '.rb', '.apk',
];

const ALLOWED_EXTENSIONS = [
  '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.txt',
  '.doc', '.docx', '.xls', '.xlsx', '.csv', '.zip',
];

// Assinaturas de cabeçalho binário (Magic Bytes)
const MAGIC_SIGNATURES: Record<string, number[][]> = {
  '.png': [[0x89, 0x50, 0x4E, 0x47]], // PNG
  '.jpg': [[0xFF, 0xD8, 0xFF]], // JPG
  '.jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG
  '.gif': [[0x47, 0x49, 0x46, 0x38]], // GIF
  '.pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  '.zip': [[0x50, 0x4B, 0x03, 0x04]], // PK.. (ZIP, DOCX, XLSX)
  '.docx': [[0x50, 0x4B, 0x03, 0x04]],
  '.xlsx': [[0x50, 0x4B, 0x03, 0x04]],
};

const EXECUTABLE_MAGIC_BYTES = [
  [0x4D, 0x5A], // Windows PE executable (MZ)
  [0x7F, 0x45, 0x4C, 0x46], // Linux ELF executable
];

const EICAR_TEST_STRING = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

@Injectable()
export class FileSanitizerPipe implements PipeTransform {
  private readonly logger = new Logger('FileSanitizer');
  private readonly maxSizeBytes = 25 * 1024 * 1024; // 25MB

  transform(file: Express.Multer.File, _metadata: ArgumentMetadata) {
    if (!file) {
      return file;
    }

    const originalName = file.originalname || 'unknown';

    // 1. Verificação de Tamanho
    if (file.size > this.maxSizeBytes) {
      this.logger.warn(`Upload bloqueado: Arquivo excede o limite (${file.size} bytes). Nome: ${originalName}`);
      throw new BadRequestException('O arquivo excede o limite máximo permitido de 25MB.');
    }

    // 2. Detecção de Extensões Duplas e Extensões Perigosas
    const cleanName = originalName.trim().replace(/[\s\.]+$|[\0]/g, '').toLowerCase();
    const nameParts = cleanName.split('.');
    const allSubExtensions = nameParts.slice(1).map((ext) => `.${ext}`);
    const fileExt = `.${nameParts.pop() || ''}`;

    const matchedDangerousExt = allSubExtensions.find((ext) => DANGEROUS_EXTENSIONS.includes(ext));
    if (matchedDangerousExt) {
      this.logger.warn(`🚨 [MALWARE BLOCKED] Tentativa de upload de executável/script: ${originalName} (${matchedDangerousExt})`);
      throw new BadRequestException(
        `Upload bloqueado: Extensão perigosa (${matchedDangerousExt}) detectada. Arquivos executáveis e scripts são proibidos por segurança ISO 27001.`,
      );
    }

    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      this.logger.warn(`Upload bloqueado: Extensão não permitida (${fileExt}). Nome: ${originalName}`);
      throw new BadRequestException(`Extensão de arquivo (${fileExt}) não permitida no portal.`);
    }

    // 3. Inspeção de Magic Bytes (Buffer no servidor)
    if (file.buffer && file.buffer.length >= 4) {
      const buffer = file.buffer;

      // 3a. Checar se é executável PE (MZ) ou ELF disfarçado
      const isExecutable = EXECUTABLE_MAGIC_BYTES.some((sig) =>
        sig.every((byte, idx) => buffer[idx] === byte),
      );

      if (isExecutable) {
        this.logger.error(`🚨 [SPOOFING THREAT] Arquivo executável disfarçado de ${fileExt}: ${originalName}`);
        throw new BadRequestException('Assinatura binária de arquivo executável detectada. O envio foi bloqueado.');
      }

      // 3b. Validação da assinatura correspondente à extensão
      const expectedSignatures = MAGIC_SIGNATURES[fileExt];
      if (expectedSignatures) {
        const matchesSignature = expectedSignatures.some((sig) =>
          sig.every((byte, idx) => buffer[idx] === byte),
        );

        if (!matchesSignature) {
          this.logger.warn(`Inconsistência de formato: Cabeçalho binário incompatível com a extensão ${fileExt}. Nome: ${originalName}`);
          throw new BadRequestException('O conteúdo real do arquivo não corresponde à sua extensão.');
        }
      }

      // 4. Teste de assinatura de vírus padrão EICAR
      if (file.size < 1024) {
        const fileContentString = buffer.toString('utf-8');
        if (fileContentString.includes(EICAR_TEST_STRING)) {
          this.logger.error(`🚨 [VIRUS BLOCKED] Assinatura EICAR Antivírus detectada em: ${originalName}`);
          throw new BadRequestException('Assinatura de vírus detectada pelo motor de segurança.');
        }
      }
    }

    this.logger.log(`Arquivo aprovado e sanitizado: ${originalName} (${(file.size / 1024).toFixed(1)} KB)`);
    return file;
  }
}
