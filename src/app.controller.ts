import { Body, Controller, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import {
  CoreMessage,
  generateText,
  LanguageModelV1,
  pipeDataStreamToResponse,
  streamText,
} from 'ai';

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

  @Post('/model-generate-text')
  async hotSwapModels(@Query() query, @Body() body) {
    const models: [string, LanguageModelV1][] = [
      ['gpt-4o', openai('gpt-4o')],
      ['gemini-1.5-flash', google('gemini-1.5-flash')],
    ];

    const model =
      models.find((model) => model[0] === query.model)[1] || openai('gpt-4o');

    const { text } = await generateText({
      model,
      messages: [
        {
          role: 'system',
          content:
            `You are a text summarizer. ` +
            `Summarize the text you receive. ` +
            `Be concise. ` +
            `State which model you are using` +
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

  @Post('/get-completions')
  async getCompletions(@Body() body) {
    const messages: CoreMessage[] = await body.messages

    const result = await generateText({
      model: openai('gpt-4o'),
      messages
    })

    const newMessages = result.response.messages;
    const allMessages = [
      ...messages,
      ...newMessages
    ]

    return allMessages;
  }
}
