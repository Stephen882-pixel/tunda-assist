import { Test, TestingModule } from '@nestjs/testing';
import { ToolsService } from '../tools/tools.service';
import { AiOrchestratorService } from './ai-orchestrator.service';

describe('AiOrchestratorService', () => {
  let service: AiOrchestratorService;
  const toolsService = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiOrchestratorService,
        { provide: ToolsService, useValue: toolsService },
      ],
    }).compile();

    service = module.get(AiOrchestratorService);
  });

  it('returns a greeting for /start', async () => {
    await expect(
      service.generateReply({
        channel: 'telegram',
        userId: '1',
        message: '/start',
      }),
    ).resolves.toEqual(
      'Hi there, this is Ivy from SunCulture support. How can I help you today?',
    );

    expect(toolsService.execute).not.toHaveBeenCalled();
  });

  it('routes pricing questions to the pricing tool', async () => {
    toolsService.execute.mockResolvedValue('Pricing reply');

    await expect(
      service.generateReply({
        channel: 'telegram',
        userId: '1',
        message: 'How much is the RainMaker 2S?',
      }),
    ).resolves.toContain('Pricing reply');

    expect(toolsService.execute).toHaveBeenCalledWith('get_pricing', {
      query_type: 'product_price',
      product_code: 'csd_rm2s',
    });
  });

  it('routes account questions with an ID to the account tool', async () => {
    toolsService.execute.mockResolvedValue('Account reply');

    await expect(
      service.generateReply({
        channel: 'telegram',
        userId: '1',
        message: 'Check my balance for national id 12345678',
      }),
    ).resolves.toEqual(
      'Let me check that for you, just a moment. Account reply Is there anything specific about your account you would like to know?',
    );

    expect(toolsService.execute).toHaveBeenCalledWith('check_account', {
      national_id: '12345678',
    });
  });

  it('treats pricing as a pricing query', async () => {
    toolsService.execute.mockResolvedValue('Pricing answer. More detail here.');

    await expect(
      service.generateReply({
        channel: 'telegram',
        userId: '1',
        message: 'what about pricing',
      }),
    ).resolves.toContain('Pricing answer.');

    expect(toolsService.execute).toHaveBeenCalledWith('get_pricing', {
      query_type: 'product_price',
      product_code: undefined,
    });
  });

  it('treats pump interest as a product recommendation query', async () => {
    toolsService.execute.mockResolvedValue(
      'To recommend the right system, I need a couple of details. How big is your farm in acres? And how deep is your water source?',
    );

    await expect(
      service.generateReply({
        channel: 'telegram',
        userId: '1',
        message: 'i am interested in a pump',
      }),
    ).resolves.toEqual(
      'I can help with that. To recommend the right system, I need a couple of details. How big is your farm in acres? How big is your farm in acres, and how deep is your water source?',
    );

    expect(toolsService.execute).toHaveBeenCalledWith('get_product_info', {
      query_type: 'recommend_by_farm_size',
      product_line: undefined,
      variant: undefined,
      farm_size_acres: undefined,
    });
  });

  it('adds empathy and one clear next question for troubleshooting', async () => {
    toolsService.execute.mockResolvedValue(
      'Check the panel and controller lights first. If the issue continues, we can keep narrowing it down.',
    );

    await expect(
      service.generateReply({
        channel: 'telegram',
        userId: '1',
        message: 'my pump is not working',
      }),
    ).resolves.toEqual(
      'I understand that can be frustrating. Let me help you sort this out. Check the panel and controller lights first. If the issue continues, we can keep narrowing it down. Is the solar panel clean and in direct sunlight, and are there any lights or indicators on the controller?',
    );
  });

  it('gives a clear non-support response for job questions', async () => {
    await expect(
      service.generateReply({
        channel: 'telegram',
        userId: '1',
        message: 'Share with me any job advertisement at the moment',
      }),
    ).resolves.toEqual(
      'I mainly help with SunCulture products, pricing, payments, accounts, and troubleshooting. For jobs or careers, please check SunCulture’s official website or social pages.',
    );

    expect(toolsService.execute).not.toHaveBeenCalled();
  });

  it('guides new customers instead of falling back', async () => {
    await expect(
      service.generateReply({
        channel: 'telegram',
        userId: '1',
        message: 'I am not an existing client',
      }),
    ).resolves.toEqual(
      'That is okay. I can still help you choose a SunCulture system. How big is your farm in acres, and how deep is your water source?',
    );

    expect(toolsService.execute).not.toHaveBeenCalled();
  });
});
