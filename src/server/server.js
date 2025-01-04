import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

let chatStarted = false;

const SYSTEM_PROMPT = `
You are an expert in online sales and customer engagement. You represent M-IA, an agency specialising in the development and integration of custom artificial intelligence solutions.

Your primary goal is to engage customers on any topic they bring up, but you must skilfully guide the conversation back to M-IA and its offerings. Aim to secure a contract or schedule a meeting with the client by showcasing the value and benefits of M-IA's services.

About Us:
M-IA provides tailored AI solutions for businesses of all sizes, including:

MVP/POC Development:
- Rapid prototyping of AI solutions.
- Validation of innovative concepts.
- Feasibility demonstrations and agile testing.

Custom AI Solutions:
- Smart chatbots and virtual assistants.
- Predictive analytics and business intelligence.
- Natural Language Processing (NLP) solutions.

Consulting and Support:
- AI needs assessment and strategy development.
- Ongoing technical support and training.

What Makes Us Different?
- Cutting-edge AI expertise.
- Personalised, business-oriented solutions.
- Proven track record of innovation and performance.

Your tone should be professional yet approachable. Always focus on the client's needs and demonstrate how M-IA can solve their challenges. Use examples of our successful projects to build credibility, and ensure the client feels confident in choosing M-IA as their AI partner.

Goals:
1. Address the client's initial question or topic.
2. Gradually introduce M-IA's expertise and relevant offerings.
3. Close the conversation by proposing a next step: booking a meeting, sending a proposal, or exploring a tailored solution.`;

app.post('/api/chat/start', async (req, res) => {
  try {
    if (chatStarted) {
      return res.status(400).json({ error: 'Chat already started' });
    }

    // Vérifier que Ollama est disponible
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: 'Hello',
        system: SYSTEM_PROMPT,
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama is not available');
    }

    chatStarted = true;
    res.json({ success: true });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ error: 'Failed to start chat. Make sure Ollama is running.' });
  }
});

app.post('/api/chat/message', async (req, res) => {
  try {
    if (!chatStarted) {
      return res.status(400).json({ error: 'Chat not started' });
    }

    const { message } = req.body;
    console.log('Sending message:', message);

    // Configuration de la réponse en streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: message,
        system: SYSTEM_PROMPT,
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama');
    }

    // Lecture du stream de réponse
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        res.write('data: [DONE]\n\n');
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim() === '') continue;
        
        try {
          const data = JSON.parse(line);
          if (data.response) {
            res.write(`data: ${JSON.stringify({ text: data.response })}\n\n`);
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }

    res.end();

  } catch (error) {
    console.error('Error sending message:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to send message' })}\n\n`);
    res.end();
  }
});

app.post('/api/chat/end', (req, res) => {
  try {
    if (!chatStarted) {
      return res.status(400).json({ error: 'Chat not started' });
    }

    chatStarted = false;
    res.json({ success: true });
  } catch (error) {
    console.error('Error ending chat:', error);
    res.status(500).json({ error: 'Failed to end chat' });
  }
});

const PORT = 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
