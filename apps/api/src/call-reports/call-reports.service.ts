import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CallReportsRepository } from './call-reports.repository';
import { CreateCallReportDto } from './dto/create-call-report.dto';
import { UpdateCallReportDto } from './dto/update-call-report.dto';
import { QueryCallReportDto } from './dto/query-call-report.dto';

@Injectable()
export class CallReportsService {
  private readonly logger = new Logger(CallReportsService.name);

  constructor(private readonly repository: CallReportsRepository) {}

  async create(dto: CreateCallReportDto) {
    const existing = await this.repository.findByCallId(dto.callId);
    if (existing) {
      throw new ConflictException(
        `Call report for callId "${dto.callId}" already exists`,
      );
    }
    const report = await this.repository.create(dto);
    this.logger.log(
      `Created call report: ${report.id} (callId: ${report.callId})`,
    );
    return report;
  }

  async findAll(query: QueryCallReportDto) {
    return this.repository.findAll(query);
  }

  async findOne(id: string) {
    const report = await this.repository.findById(id);
    if (!report) {
      throw new NotFoundException(`Call report with id "${id}" not found`);
    }
    return report;
  }

  async findByCallId(callId: string) {
    const report = await this.repository.findByCallId(callId);
    if (!report) {
      throw new NotFoundException(
        `Call report for callId "${callId}" not found`,
      );
    }
    return report;
  }

  async update(id: string, dto: UpdateCallReportDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete(id);
  }

  async getStats() {
    return this.repository.getStats();
  }

  async upsertFromVapi(vapiReport: Record<string, unknown>): Promise<void> {
    const call = vapiReport.call as Record<string, unknown> | undefined;
    const callId = call?.id as string | undefined;

    if (!callId) {
      this.logger.warn(
        'Vapi end-of-call-report missing call.id — skipping persist',
      );
      return;
    }

    const costRaw = vapiReport.cost;
    const cost =
      typeof costRaw === 'number'
        ? costRaw
        : typeof costRaw === 'object' && costRaw !== null && 'total' in costRaw
          ? (costRaw as { total: number }).total
          : undefined;

    const dto: CreateCallReportDto = {
      callId,
      duration:
        typeof vapiReport.durationSeconds === 'number'
          ? vapiReport.durationSeconds
          : undefined,
      cost,
      summary:
        typeof vapiReport.summary === 'string' ? vapiReport.summary : undefined,
      transcript:
        typeof vapiReport.transcript === 'string'
          ? vapiReport.transcript
          : undefined,
      endedReason:
        typeof vapiReport.endedReason === 'string'
          ? vapiReport.endedReason
          : undefined,
    };

    try {
      await this.create(dto);
      this.logger.log(`Persisted call report for callId: ${callId}`);
    } catch (error) {
      if (error instanceof ConflictException) {
        this.logger.warn(
          `Duplicate end-of-call-report for callId: ${callId} — skipping`,
        );
      } else {
        this.logger.error(
          `Failed to persist call report for callId: ${callId}`,
          error,
        );
      }
    }
  }
}
