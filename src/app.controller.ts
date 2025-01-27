import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { generateText, pipeDataStreamToResponse, streamText } from 'ai';
import { Response } from 'express';

@Controller()
export class AppController {
  @Post('/data-stream')
  async root(@Res() res: Response) {
    const textStream = streamText({
      model: openai('gpt-4o'),
      prompt: 'Invent a new holiday and describe its traditions.',
    });

    textStream.pipeDataStreamToResponse(res);
  }

  @Post('/stream-data')
  async streamData(@Res() res: Response) {
    pipeDataStreamToResponse(res, {
      execute: async (dataStreamWriter) => {
        dataStreamWriter.writeData('initialized call');

        const result = streamText({
          model: openai('gpt-4o'),
          prompt: 'Invent a new holiday and describe its traditions.',
        });

        result.mergeIntoDataStream(dataStreamWriter);
      },
      onError: (error) => {
        // Error messages are masked by default for security reasons.
        // If you want to expose the error message to the client, you can do so here:
        return error instanceof Error ? error.message : String(error);
      },
    });
  }

  @Post('/text-stream')
  async example(@Res() res: Response) {
    const result = streamText({
      model: openai('gpt-4o'),
      prompt: 'Invent a new holiday and describe its traditions.',
    });

    result.pipeTextStreamToResponse(res);
  }

  @Post('/openai-generate-text')
  async openaiGenerateText(@Body() body) {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content:
            `You are a text summarizer. ` +
            `Summarize the text you receive. ` +
            `Be concise. ` +
            `Return only the summary. ` +
            `Do not use the phrase "here is a summary". ` +
            `Highlight relevant phrases in bold. ` +
            `The summary should be two sentences long. `,
        },
        {
          role: 'user',
          content: body.prompt,
        },
      ],
    });

    return text;
  }
}
