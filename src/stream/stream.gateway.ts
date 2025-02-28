import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { StreamService } from './stream.service';

@WebSocketGateway()
export class StreamGateway {
  constructor(private readonly streamService: StreamService) {}

  @SubscribeMessage('createRecipe')
  createRecipe(@MessageBody() prompt: string) {
    return this.streamService.createRecipe(prompt);
  }
}
