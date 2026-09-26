import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize Gemini client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Generate Custom Quiz via Gemini
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { 
      topic, 
      customNotes, 
      category = 'General', 
      difficulty = 'Intermediate', 
      questionCount = 5,
      durationMinutes = 15,
      negativeMarking = 0.25,
      questionTypes = ['single_choice']
    } = req.body;

    if (!topic && !customNotes) {
      return res.status(400).json({ error: 'Topic or custom notes/syllabus is required.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Return a dynamically generated structured test fallback if no API key is present
      const fallbackQuiz = generateSyntheticQuiz(topic || 'Custom Subject', difficulty, questionCount, category, durationMinutes, negativeMarking);
      return res.json({ quiz: fallbackQuiz, fallback: true });
    }

    const promptText = `
You are an expert exam creator and standardized assessment psychometrician.
Generate a high-quality, rigorous mock examination test on the following topic:
Topic: "${topic || 'Custom Subject'}"
Category: "${category}"
Difficulty Level: "${difficulty}"
Number of Questions: ${questionCount}
Target Exam Duration: ${durationMinutes} minutes
Negative Marking: ${negativeMarking} marks deducted per wrong answer

${customNotes ? `SOURCE MATERIAL / STUDY NOTES TO TEST FROM:\n"""${customNotes.slice(0, 4000)}"""\nAll questions MUST be derived from or directly relevant to the material above.` : ''}

Create exactly ${questionCount} questions.
Group the questions into 1 or 2 logical sections (e.g. "Section 1: Conceptual Foundations", "Section 2: Scenario Analysis & Application").
For each question:
- Provide 4 distinct, plausible options (A, B, C, D).
- Ensure only 1 option is unequivocally correct.
- Write a clear, comprehensive explanation that details WHY the correct answer is right and why distractors are common misconceptions.
- Add a helpful hint that guides the student without revealing the exact answer directly.
- If relevant (e.g. for coding or math), include a clean codeSnippet or formula.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: 'You are an elite academic test designer and exam simulator engine. Output strictly structured JSON conforming to the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Descriptive, professional mock exam title' },
            description: { type: Type.STRING, description: 'Overview of topics and objectives assessed' },
            category: { type: Type.STRING, description: 'Broad subject category' },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Section title' },
                  description: { type: Type.STRING, description: 'Brief description of section coverage' },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING, description: 'Question text with full context' },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: 'Exactly 4 distinct answer options'
                        },
                        correctIndex: { type: Type.INTEGER, description: 'Index (0 to 3) of the correct option' },
                        explanation: { type: Type.STRING, description: 'In-depth educational explanation' },
                        topic: { type: Type.STRING, description: 'Sub-topic or skill tested' },
                        difficulty: { type: Type.STRING, description: 'easy, medium, or hard' },
                        hint: { type: Type.STRING, description: 'Socratic hint for practice mode' },
                        codeSnippet: { type: Type.STRING, description: 'Optional code snippet or mathematical equation' }
                      },
                      required: ['text', 'options', 'correctIndex', 'explanation', 'topic', 'difficulty']
                    }
                  }
                },
                required: ['title', 'questions']
              }
            }
          },
          required: ['title', 'description', 'sections']
        }
      }
    });

    const rawText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(rawText);

    // Format into standard Quiz object
    const quizId = `custom-${Date.now()}`;
    const generatedQuiz = {
      id: quizId,
      title: parsedData.title || `${topic} Mock Examination`,
      description: parsedData.description || `Mock assessment covering key competencies in ${topic}.`,
      category: parsedData.category || category,
      difficulty,
      durationMinutes: Number(durationMinutes) || 15,
      negativeMarking: Number(negativeMarking) || 0.25,
      marksPerQuestion: 1,
      passPercentage: 65,
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
      sections: (parsedData.sections || []).map((sec: any, sIdx: number) => ({
        id: `sec-${quizId}-${sIdx + 1}`,
        title: sec.title || `Section ${sIdx + 1}`,
        description: sec.description || '',
        questions: (sec.questions || []).map((q: any, qIdx: number) => ({
          id: `q-${quizId}-${sIdx + 1}-${qIdx + 1}`,
          text: q.text,
          options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < (q.options?.length || 4) ? q.correctIndex : 0,
          type: 'single_choice',
          explanation: q.explanation || 'No explanation provided.',
          topic: q.topic || topic || 'General Concept',
          difficulty: q.difficulty || 'medium',
          hint: q.hint || undefined,
          codeSnippet: q.codeSnippet || undefined
        }))
      }))
    };

    return res.json({ quiz: generatedQuiz, fallback: false });
  } catch (error: any) {
    console.error('Error generating quiz via Gemini:', error);
    // Graceful fallback so the user always has a functioning test
    const { topic = 'General Aptitude', difficulty = 'Intermediate', questionCount = 5, category = 'General' } = req.body;
    const fallbackQuiz = generateSyntheticQuiz(topic, difficulty, questionCount, category, 15, 0.25);
    return res.json({ quiz: fallbackQuiz, fallback: true, warning: 'AI service unavailable; generated algorithmic drill.' });
  }
});

// API: Deeper Socratic AI Explanation for any question during review
app.post('/api/explain-question', async (req, res) => {
  try {
    const { questionText, options, correctIndex, userSelectedIndex, topic, explanation } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        deepExplanation: `Detailed Concept Review:\n\nThe correct answer is "${options[correctIndex]}".\n\n${explanation}\n\nKey Takeaway: Carefully distinguish between prerequisite conditions and downstream effects when tackling ${topic || 'this subject'}.`
      });
    }

    const prompt = `
A student just completed a mock test question and needs a personalized tutor breakdown.

Question: "${questionText}"
Options:
${options.map((opt: string, i: number) => `${i === correctIndex ? '✓ ' : '  '}[${String.fromCharCode(65 + i)}] ${opt}`).join('\n')}

Correct Option: [${String.fromCharCode(65 + correctIndex)}] ${options[correctIndex]}
Student's Chosen Option: ${userSelectedIndex !== null && userSelectedIndex !== undefined ? `[${String.fromCharCode(65 + userSelectedIndex)}] ${options[userSelectedIndex]}` : 'Unanswered'}
Sub-topic: ${topic}
Standard Explanation: ${explanation}

Provide a concise, highly educational response:
1. Core Mental Model: Explain the intuition in 2-3 sentences.
2. Why Distractors Fail: Explain specifically why the other choices (and especially the student's choice if wrong) are common pitfalls or traps.
3. Rule of Thumb / Exam Mnemonic: A quick trick or test-taking heuristic to remember this concept under exam pressure.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an encouraging, master academic tutor specializing in high-stakes test preparation. Be concise, punchy, and clear.'
      }
    });

    res.json({ deepExplanation: response.text });
  } catch (error) {
    console.error('Error in question explanation:', error);
    res.json({
      deepExplanation: 'Unable to connect to AI tutor at this moment. Please review the provided solution notes.'
    });
  }
});

// Helper for dynamic offline quiz synthesis
function generateSyntheticQuiz(topic: string, difficulty: string, count: number, category: string, duration: number, negativeMarking: number) {
  const quizId = `mock-${Date.now()}`;
  const questions = [];

  for (let i = 1; i <= Math.min(count, 15); i++) {
    questions.push({
      id: `q-${quizId}-${i}`,
      text: `Key Assessment Problem ${i} in ${topic}: How does standard methodology resolve state or operational invariants under high stress?`,
      options: [
        `Optimal approach prioritizing formal verification and invariant bounds`,
        `Alternative heuristic with relaxed guarantees under edge conditions`,
        `Legacy procedural pattern with linear overhead penalties`,
        `Ad-hoc fallback without deterministic error boundaries`
      ],
      correctIndex: 0,
      type: 'single_choice' as const,
      explanation: `In ${topic}, the leading best practice prioritizes explicit formal boundaries and invariant preservation to avoid cascade failures.`,
      topic: `${topic} Concepts`,
      difficulty: difficulty === 'Advanced' ? 'hard' : difficulty === 'Beginner' ? 'easy' : 'medium',
      hint: `Look for the option providing deterministic safety guarantees.`
    });
  }

  return {
    id: quizId,
    title: `${topic} Adaptive Mock Test`,
    description: `Targeted evaluation designed to test foundational and advanced competencies in ${topic}.`,
    category,
    difficulty,
    durationMinutes: duration || 15,
    negativeMarking: negativeMarking || 0.25,
    marksPerQuestion: 1,
    passPercentage: 65,
    isCustom: true,
    createdAt: new Date().toISOString().split('T')[0],
    sections: [
      {
        id: `sec-${quizId}-1`,
        title: `Comprehensive Core Assessment`,
        description: `Evaluates critical problem-solving and conceptual depth in ${topic}.`,
        questions
      }
    ]
  };
}

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Vantage Exam Simulator running on port ${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer();
