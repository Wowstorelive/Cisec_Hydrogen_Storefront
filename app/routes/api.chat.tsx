// app/routes/api.chat.tsx
import { json } from '@remix-run/node';
import { getChatResponse } from '~/services/vertexai/chat.server';

export async function action({ request }) {
  const { message, history } = await request.json();

  if (!message) {
    return json({ error: 'Message is required' }, { status: 400 });
  }

  const context = { history: history ? JSON.parse(history) : [] };
  const response = await getChatResponse(message, context);

  return json({ response });
}
