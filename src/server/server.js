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
        prompt: 'Hello'
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

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: message,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama');
    }

    const data = await response.json();
    console.log('Ollama response:', data);
    res.json({ response: data.response });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
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
