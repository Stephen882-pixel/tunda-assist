import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CallReportsService } from './call-reports.service';
import { CreateCallReportDto } from './dto/create-call-report.dto';
import { UpdateCallReportDto } from './dto/update-call-report.dto';
import { QueryCallReportDto } from './dto/query-call-report.dto';
import {
  CallReportResponseDto,
  CallReportStatsDto,
} from './dto/call-report-response.dto';

@ApiTags('call-reports')
@Controller('call-reports')
export class CallReportsController {
  constructor(private readonly callReportsService: CallReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a call report' })
  @ApiResponse({
    status: 201,
    description: 'Call report created',
    type: CallReportResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateCallReportDto) {
    return this.callReportsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List call reports with optional filters and pagination',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of call reports' })
  findAll(@Query() query: QueryCallReportDto) {
    return this.callReportsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated call statistics' })
  @ApiResponse({
    status: 200,
    description: 'Call statistics',
    type: CallReportStatsDto,
  })
  getStats() {
    return this.callReportsService.getStats();
  }

  @Get('by-call-id/:callId')
  @ApiOperation({ summary: 'Find a call report by Vapi call ID' })
  @ApiParam({ name: 'callId', description: 'Vapi call identifier' })
  @ApiResponse({
    status: 200,
    description: 'Call report found',
    type: CallReportResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Call report not found' })
  findByCallId(@Param('callId') callId: string) {
    return this.callReportsService.findByCallId(callId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a call report by ID' })
  @ApiParam({ name: 'id', description: 'Call report record ID' })
  @ApiResponse({
    status: 200,
    description: 'Call report found',
    type: CallReportResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Call report not found' })
  findOne(@Param('id') id: string) {
    return this.callReportsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a call report' })
  @ApiParam({ name: 'id', description: 'Call report record ID' })
  @ApiResponse({
    status: 200,
    description: 'Call report updated',
    type: CallReportResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Call report not found' })
  update(@Param('id') id: string, @Body() dto: UpdateCallReportDto) {
    return this.callReportsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a call report' })
  @ApiParam({ name: 'id', description: 'Call report record ID' })
  @ApiResponse({ status: 204, description: 'Call report deleted' })
  @ApiResponse({ status: 404, description: 'Call report not found' })
  remove(@Param('id') id: string) {
    return this.callReportsService.remove(id);
  }
}
