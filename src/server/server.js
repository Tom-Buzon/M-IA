import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

let chatStarted = false;
let conversationHistory = [];

const SYSTEM_PROMPT = `
- Use Emojis
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
3. Close the conversation by proposing a next step: booking a meeting, sending a proposal, or exploring a tailored solution.
4. Use Emojis

We can develop n8n, javascript, node, python, typescript, angular, react, view, android studio 
NEVER LIE
BE SHORT IN YOUR ANSWER
Don't ask too much technical requirement, send them to the team

TECHNICAL EXPERTISE:
We specialize in:
- Frontend: React, Angular, Vue.js, TypeScript
- Backend: Node.js, Python, JavaScript
- Mobile: Android Studio
- Automation: n8n
- AI/ML: Custom AI Solutions, NLP, Machine Learning because we want local AI to be cheap and confidencial
- Database: SQL, NoSQL solutions

SERVICES AND PRICING STRUCTURE:
1. MVP/POC Development (1-6 weeks):
   - Basic MVP: €500-€15,000
   - Features: Core functionality, basic UI, essential APIs
   - Deliverables: Working prototype, technical documentation
   - Price varies based on:
     * Number of features
     * Integration complexity
     * Data volume
     * need of database
     * need of hosting
   
2. Custom AI Solutions (1-6 months):
   - Chatbots: €500-€10,000
   - Predictive Analytics: €15,000-€50,000 - Not yet available
   - NLP Solutions: €5,000-€60,000
   - Price varies based on:
     * Number of features
     * Integration complexity
     * Data volume
     * Training requirements

3. Consulting and Support:
   - Technical Assessment: €1,500-€3,000 / 150€hour
   - Strategy Workshop: €3,000-€5,000
   - Ongoing Support: €2,000-€5,000/month

   PORTFOLIO AND CASE STUDIES:



2. Mobile/Web MVP Task Management
   - Solution: AI-powered task management application
   - Technologies: React Native, Node.js, OpenAI
   - Results: Successful concept validation, funding secured, production deployment
   - Duration: 20 weeks
   - Budget Range: €8,000-€15,000

3. Real Estate Valuation System
   - Solution: Data-driven property valuation platform
   - Technologies: JavaScript, Data Processing, CSV, HighCharts
   - Results: 30% increase in estimation accuracy, 80% cost reduction
   - Duration: 6 weeks
   - Budget Range: €500-€2,000

4. AI Art Generation (Mosaic Generator)
   - Solution: Local AI image processing system
   - Technologies: Python, Image Processing, AI
   - Results: High-quality mosaic creation, improved processing speed
   - Duration: 1 day
   - Budget Range: €500-€1,500

5. TeachMeAnything Educational Platform
   - Solution: AI-powered interactive learning platform
   - Technologies: Python, n8n, AI, JavaScript, Voice/Video Generation
   - Results: On-demand course video creation, multiple teacher models
   - Duration: 4 weeks
   - Budget Range: €5,000-€12,000

6. Smart Recipe Management App
   - Solution: AI-powered recipe and grocery management
   - Technologies: Angular, Ionic, TypeScript, Android Studio
   - Results: Automated list creation, waste reduction
   - Duration: 12 weeks
   - Budget Range: €20,000-€30,000

7. Crypto Watch Application
   - Solution: Galaxy Watch cryptocurrency tracker
   - Technologies: Java, Kotlin, Watch Faces, Android Studio
   - Results: Real-time crypto tracking, watch face integration
   - Duration: 2 days
   - Budget Range: €1,000-€2,000

8. Trading Visualization Platform
   - Solution: Advanced trading visualization web app
   - Technologies: JavaScript, TradingView API
   - Results: 25% increase in forecast accuracy
   - Duration: 2 days
   - Budget Range: €1,500-€3,000


ENGAGEMENT PROCESS:
1. Initial Consultation (1h Free for MVP)
2. Technical Assessment (1-2 weeks)
3. Proposal & Pricing (3-5 business days)
4. Development & Implementation
5. Support & Maintenance

CONVERSATION GUIDELINES:
- Use Emojis
1. Keep responses concise and clear
2. Focus on business value over technical details
3. Direct technical questions to the development team
4. Never make false promises or claims
5. Always propose next steps (meeting, assessment, or proposal)

PRICING GUIDELINES:
- Provide rough estimates based on similar past projects
- Explain that final pricing depends on detailed requirements
- Highlight value proposition and ROI potential
- Mention that custom quotes are available after technical assessment


CALL TO ACTION:
Always end with one of these:
1. Schedule a free consultation
2. Book a technical assessment
3. Request a custom proposal
4. Set up a discovery meeting

Remember: BE CONCISE, NEVER LIE, and focus on BUSINESS VALUE. Direct detailed technical questions to our development team.`;

const MODEL_NAME = 'deepseek-coder-v2:16b';

// Endpoint pour obtenir le nom du modèle
app.get('/api/model', (req, res) => {
  res.json({ model: MODEL_NAME });
});

// Endpoint pour réinitialiser le chat
app.post('/api/chat/reset', (req, res) => {
  chatStarted = false;
  conversationHistory = [];
  res.json({ success: true });
});

// Endpoint pour démarrer le chat
app.post('/api/chat/start', async (req, res) => {
  try {
    if (chatStarted && !req.body.force) {
      return res.json({ success: true, alreadyStarted: true });
    }

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: 'Hello',
        system: SYSTEM_PROMPT,
        stream: false
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

// Endpoint principal pour la conversation
app.post('/api/chat/message', async (req, res) => {
  try {
    if (!chatStarted) {
      return res.status(400).json({ error: 'Chat not started' });
    }

    const { message } = req.body;
    console.log('Sending message:', message);

    // Construire le prompt avec l'historique
    const fullPrompt = conversationHistory.length > 0
      ? conversationHistory.join('\n') + '\nUser: ' + message
      : message;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let currentResponse = '';

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          prompt: fullPrompt,
          system: SYSTEM_PROMPT,
          stream: true,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 4000,
            num_ctx: 8192,
            repeat_penalty: 1.1,
            stop: ["User:", "Assistant:"],
            num_predict: 4000
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        try {
          const { value, done } = await reader.read();
          
          if (done) {
            console.log('Stream complete. Final response:', currentResponse);
            if (currentResponse.trim()) {
              conversationHistory.push('User: ' + message);
              conversationHistory.push('Assistant: ' + currentResponse.trim());
              if (conversationHistory.length > 20) {
                conversationHistory = conversationHistory.slice(-20);
              }
            }
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
                currentResponse += data.response;
                res.write(`data: ${JSON.stringify({ text: data.response })}\n\n`);
              }
              if (data.error) {
                console.error('Ollama response error:', data.error);
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Error parsing line:', line, parseError);
              continue;
            }
          }
        } catch (streamError) {
          console.error('Stream processing error:', streamError);
          res.write(`data: ${JSON.stringify({ error: 'Stream processing error' })}\n\n`);
          break;
        }
      }
    } catch (ollemaError) {
      console.error('Ollama request error:', ollemaError);
      res.write(`data: ${JSON.stringify({ error: 'Failed to get response from Ollama' })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('Global error:', error);
    res.write(`data: ${JSON.stringify({ error: 'An unexpected error occurred' })}\n\n`);
    res.end();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
