import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from './entities/webhook.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cv } from '../cvs/entities/cv.entity';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
    private readonly httpService: HttpService,
  ) {}

  async create(createWebhookDto: CreateWebhookDto): Promise<Webhook> {
    const webhook = this.webhookRepository.create(createWebhookDto);
    return this.webhookRepository.save(webhook);
  }

  async remove(id: number): Promise<void> {
    await this.webhookRepository.delete(id);
  }

  @OnEvent('cv.created', { async: true })
  async handleCvCreated(cv: Cv): Promise<void> {
    this.logger.log(`Handling cv.created event for CV ID: ${cv.id}`);
    
    // Fetch all webhooks subscribed to 'cv.created'
    const webhooks = await this.webhookRepository.find({ where: { event: 'cv.created' } });

    // Execute all webhook dispatched concurrently
    await Promise.all(
      webhooks.map(async (webhook) => {
        try {
          this.logger.log(`Dispatching [${webhook.event}] event to ${webhook.url}`);
          await firstValueFrom(this.httpService.post(webhook.url, cv));
          this.logger.log(`Successfully dispatched [${webhook.event}] event to ${webhook.url}`);
        } catch (error: unknown) {
          // Handle errors gracefully without crashing the main application
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Failed to dispatch [${webhook.event}] event to ${webhook.url}: ${errorMessage}`);
        }
      })
    );
  }
}
