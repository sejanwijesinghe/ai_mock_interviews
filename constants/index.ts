import { z } from "zod";
import { CreateAssistantDTO } from "@vapi-ai/web/api";

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

// Interview Generator - Asks user questions to collect interview details
export const interviewGenerator: CreateAssistantDTO = {
  name: "Interview Generator",
  firstMessage:
      "Hello! I'm here to help you create a personalized interview. Let me ask you a few questions to customize it for you. First, what job role are you preparing for? For example, Frontend Developer, Backend Developer, Data Scientist, etc.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    functions: [
      {
        name: "generate_interview",
        description: "Generate interview questions based on collected information from the user",
        parameters: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description: "The job role the user is preparing for (e.g., Frontend Developer, Data Scientist)",
            },
            level: {
              type: "string",
              enum: ["junior", "mid", "senior"],
              description: "Experience level: junior, mid, or senior",
            },
            type: {
              type: "string",
              enum: ["technical", "behavioral", "mixed"],
              description: "Type of interview: technical, behavioral, or mixed",
            },
            techstack: {
              type: "string",
              description: "Comma-separated list of technologies or skills (e.g., React, Node.js, Python)",
            },
            amount: {
              type: "string",
              description: "Number of questions to generate (typically 5-10)",
            },
          },
          required: ["role", "level", "type", "techstack", "amount"],
        },
      },
    ],
    messages: [
      {
        role: "system",
        content: `You are an AI assistant helping users create personalized interview preparation sessions through voice conversation.

Your task is to collect the following information in order:
1. Job Role (e.g., Frontend Developer, Backend Engineer, Product Manager)
2. Experience Level (junior, mid, or senior)
3. Interview Type (technical, behavioral, or mixed)
4. Tech Stack/Skills (specific technologies or skills, comma-separated)
5. Number of Questions (recommend 5-10, default to 7)

STRICT RULES:
- Ask ONLY ONE question at a time
- Wait for the user's response before asking the next question
- Be conversational and friendly
- If the user gives an unclear answer, ask for clarification
- Keep your responses SHORT (1-2 sentences max) - this is VOICE conversation
- After collecting ALL 5 pieces of information, summarize and confirm with the user
- Once the user confirms, immediately call the generate_interview function with the collected data

CONVERSATION FLOW:
1. First Message: "What job role are you preparing for?"
   - Wait for answer (e.g., "Frontend Developer")
   
2. Second Question: "Great! What's your experience level - junior, mid-level, or senior?"
   - Wait for answer (e.g., "Senior")
   
3. Third Question: "Perfect! Would you like a technical interview, behavioral interview, or a mixed approach?"
   - Wait for answer (e.g., "Mixed")
   
4. Fourth Question: "Excellent! What technologies or skills should we focus on? You can list multiple."
   - Wait for answer (e.g., "React, TypeScript, Next.js")
   
5. Fifth Question: "How many questions would you like? I recommend 5 to 7 questions."
   - Wait for answer (e.g., "7")
   
6. Confirmation: "Let me confirm: A mixed interview for a Senior Frontend Developer position, focusing on React, TypeScript, and Next.js, with 7 questions. Is this correct?"
   - If YES: Call generate_interview function immediately
   - If NO: Ask what they'd like to change

IMPORTANT:
- Keep responses SHORT - maximum 2 sentences
- This is a VOICE conversation, not text chat
- Do NOT move to the next question until the user has answered
- After confirmation, MUST call the generate_interview function`,
      },
    ],
  },
};

// Interview Conductor - Conducts the actual interview with generated questions
export const interviewer: CreateAssistantDTO = {
  name: "Interviewer",
  firstMessage:
      "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience. Let's begin with the first question.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate.

Interview Questions:
{{questions}}

STRICT RULES:
- Ask ONE question at a time from the list above
- Wait for the candidate's COMPLETE answer before proceeding
- After each answer, give a brief acknowledgment (e.g., "Thank you for sharing that" or "That's interesting")
- Then ask the NEXT question in the list
- Do NOT skip questions
- Do NOT ask questions not in the list
- Keep your responses SHORT (1-2 sentences max)
- If an answer is too vague, ask ONE brief follow-up question, then move on
- After ALL questions are asked, thank the candidate and tell them they'll receive feedback soon

Engagement Guidelines:
- Be professional yet warm and friendly
- Use natural, conversational language
- Acknowledge responses briefly before moving to next question
- This is VOICE conversation - be concise
- Stay focused on the interview questions

End of Interview:
- After the last question is answered, say: "That concludes our interview. Thank you so much for your time today. You'll receive detailed feedback shortly. Have a great day!"`,
      },
    ],
  },
};

export const feedbackSchema = z.object({
  totalScore: z.number().min(0).max(100).describe("Overall interview score from 0 to 100"),

  categoryScores: z.array(
      z.object({
        name: z.string().describe("Category name (e.g., Communication Skills, Technical Knowledge, etc.)"),
        score: z.number().min(0).max(100).describe("Score for this category from 0 to 100"),
        comment: z.string().describe("Detailed feedback for this category")
      })
  ).length(5).describe("Scores for exactly 5 categories: Communication Skills, Technical Knowledge, Problem Solving, Cultural Fit, and Confidence and Clarity"),

  strengths: z.array(
      z.string()
  ).min(2).max(5).describe("List of 2-5 key strengths demonstrated in the interview"),

  areasForImprovement: z.array(
      z.string()
  ).min(2).max(5).describe("List of 2-5 areas where the candidate can improve"),

  finalAssessment: z.string().min(100).describe("A comprehensive final assessment paragraph (at least 100 characters) summarizing the candidate's overall performance")
});


export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user1",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior",
    questions: ["What is Node.js?"],
    finalized: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
];