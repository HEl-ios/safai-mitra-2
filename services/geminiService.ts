import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { WasteClassificationResult, QuizQuestion, Facility, QuizAnalysis, WasteMediaAuthenticationResult } from '../types.ts';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const classificationSchema = {
  type: Type.OBJECT,
  properties: {
    wasteType: {
      type: Type.STRING,
      description: "The type of waste. Must be one of: Wet Waste, Dry Waste, Hazardous, Recyclable, Unknown.",
      enum: ['Wet Waste', 'Dry Waste', 'Hazardous', 'Recyclable', 'Unknown'],
    },
    itemName: {
      type: Type.STRING,
      description: "A short, descriptive name for the item in the image (e.g., Plastic Bottle, Apple Core, Used Battery)."
    },
    description: {
      type: Type.STRING,
      description: "A brief one-sentence description of this waste category."
    },
    disposalInstructions: {
      type: Type.STRING,
      description: "Clear, concise instructions on how to properly dispose of or recycle this item."
    },
    recyclable: {
      type: Type.BOOLEAN,
      description: "Is the item generally considered recyclable?"
    }
  },
  required: ["wasteType", "itemName", "description", "disposalInstructions", "recyclable"]
};

export const classifyWasteImage = async (base64Image: string, mimeType: string, language: 'en' | 'hi'): Promise<WasteClassificationResult> => {
  try {
    const langInstruction = language === 'hi' ? "Provide your response in Hindi." : "Provide your response in English.";
    const prompt = `You are an expert waste management assistant. Your task is to accurately classify the primary waste item in the provided image. Use the JSON schema for your response. Be precise in your identification and provide clear, actionable disposal instructions. ${langInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: classificationSchema,
        temperature: 0.2, // Lower temperature for more deterministic classification
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as WasteClassificationResult;
  } catch (error) {
    console.error("Error classifying waste image:", error);
    throw new Error("Failed to classify the image. The AI model might be unable to identify the item.");
  }
};

export const classifyWasteVideo = async (base64Video: string, mimeType: string, language: 'en' | 'hi'): Promise<WasteClassificationResult> => {
  try {
    const langInstruction = language === 'hi' ? "Provide your response in Hindi." : "Provide your response in English.";
    const prompt = `You are an expert waste management assistant. Analyze this video to accurately identify and classify the primary waste item shown. Use the JSON schema for your response, providing the item name, waste type, and clear disposal instructions. ${langInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Video,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: classificationSchema,
        temperature: 0.2, // Lower temperature for more deterministic classification
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as WasteClassificationResult;
  } catch (error) {
    console.error("Error classifying waste video:", error);
    throw new Error("Failed to classify the video. The AI model might be unable to identify the item.");
  }
};

const mediaAuthenticationSchema = {
  type: Type.OBJECT,
  properties: {
    isValidWasteReport: {
      type: Type.BOOLEAN,
      description: "True if the image/video clearly shows improperly disposed waste (e.g., litter, overflowing bin). False if it's just a regular scene, a person, or irrelevant content."
    },
    isRecent: {
      type: Type.BOOLEAN,
      description: "True if the content appears to have been captured within the last 3 days. Look for clues like freshness of organic waste, lack of significant weathering on items, or other environmental cues. False if it looks old or staged."
    },
    reason: {
      type: Type.STRING,
      description: "A brief, user-facing explanation for the decision, especially if validation fails. For example, 'The image does not appear to contain waste,' or 'The scene looks like it may be older than 3 days.'"
    }
  },
  required: ["isValidWasteReport", "isRecent", "reason"]
};

export const authenticateWasteMedia = async (base64Media: string, mimeType: string, language: 'en' | 'hi'): Promise<WasteMediaAuthenticationResult> => {
  try {
    const langInstruction = language === 'hi' ? "Provide your response in Hindi." : "Provide your response in English.";
    const prompt = `You are a waste reporting authenticator. Analyze the provided media (image or video) to verify its suitability for a community waste report.
    1. Confirm that the media genuinely depicts improperly managed waste (e.g., litter on the ground, an overflowing public dustbin, illegal dumping).
    2. Critically assess if the scene looks recent, within approximately the last 3 days. Scrutinize for signs of age, such as advanced decay of organic matter, significant dust accumulation, plant overgrowth, or weathering that suggests a longer period.
    3. Use the provided JSON schema to structure your response. Be strict in your assessment to prevent spam or old reports.
    ${langInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Media,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: mediaAuthenticationSchema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as WasteMediaAuthenticationResult;
  } catch (error) {
    console.error("Error authenticating waste media:", error);
    throw new Error("Failed to authenticate the media. The AI model could not process the request.");
  }
};


export const createChat = (language: 'en' | 'hi'): Chat => {
    const systemInstruction = language === 'hi'
      ? "आप सफाई मित्र हैं, अपशिष्ट प्रबंधन और पर्यावरणीय स्थिरता में विशेषज्ञ एक एआई सहायक। आपका लक्ष्य सटीक, स्पष्ट और उत्साहजनक मार्गदर्शन प्रदान करना है। जब विशिष्ट वस्तुओं के बारे में पूछा जाए, तो रीसाइक्लिंग, कंपोस्टिंग और उचित निपटान पर व्यावहारिक सलाह दें। यदि कोई प्रश्न आपकी विशेषज्ञता से बाहर है, तो विनम्रता से बताएं कि आप पर्यावरणीय विषयों में विशेषज्ञ हैं। सकारात्मक और सहायक लहजा बनाए रखें। सूचियों और जोर देने के लिए मार्कडाउन का उपयोग करें। केवल हिंदी में जवाब दें।"
      : "You are Safai Mitra, an expert AI assistant specializing in waste management and environmental sustainability. Your goal is to provide accurate, clear, and encouraging guidance. When asked about specific items, give practical advice on recycling, composting, and proper disposal. If a question is outside your expertise, politely state that you specialize in environmental topics. Maintain a positive and supportive tone. Use markdown for lists and emphasis. Respond only in English.";

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        },
    });
};

const quizSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: {
                type: Type.STRING,
                description: "The quiz question."
            },
            options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 4 possible answers."
            },
            correctAnswer: {
                type: Type.STRING,
                description: "The correct answer, which must be one of the strings from the 'options' array."
            }
        },
        required: ["question", "options", "correctAnswer"]
    }
};

export const generateQuizQuestions = async (language: 'en' | 'hi'): Promise<QuizQuestion[]> => {
    try {
        const langInstruction = language === 'hi' ? "हिंदी में" : "in English";
        const prompt = `Generate 5 unique and engaging multiple-choice quiz questions about waste management, recycling, and sustainability. Include a mix of easy, medium, and hard questions suitable for a general audience to test their knowledge and encourage learning. Generate the quiz ${langInstruction}.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: quizSchema,
                temperature: 0.8, // Higher temperature for more creative and varied questions
            },
        });
        
        const jsonText = response.text.trim();
        const questions = JSON.parse(jsonText);
        // Basic validation
        if (Array.isArray(questions) && questions.length > 0) {
            return questions as QuizQuestion[];
        }
        throw new Error("Generated data is not in the expected format.");

    } catch (error) {
        console.error("Error generating quiz questions:", error);
        throw new Error("Failed to generate new quiz questions from the AI.");
    }
};

export const findNearbyFacilities = async (latitude: number, longitude: number, language: 'en' | 'hi'): Promise<Facility[]> => {
    try {
      const langInstruction = language === 'hi' ? 'Provide the facility names and addresses in Hindi if possible.' : '';
      const prompt = `List up to 5 waste management or recycling facilities near latitude ${latitude} and longitude ${longitude}. For each facility, provide its name and full address. Format each facility strictly on two consecutive lines like this, with no extra lines between facilities:
Name: [Facility Name]
Address: [Full Address]
${langInstruction}
Do not include any other introductory or concluding text, just the list.`;
  
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });
  
      const text = response.text.trim();
      const facilities: Facility[] = [];
      const lines = text.split('\n');
  
      let currentFacility: Partial<Facility> = {};
  
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('Name:')) {
          if (currentFacility.name && currentFacility.address) {
            facilities.push(currentFacility as Facility);
          }
          currentFacility = { name: trimmedLine.substring(5).trim() };
        } else if (trimmedLine.startsWith('Address:')) {
          if (currentFacility.name) {
            currentFacility.address = trimmedLine.substring(8).trim();
            facilities.push(currentFacility as Facility);
            currentFacility = {};
          }
        }
      }
  
      return facilities;
    } catch (error) {
      console.error("Error finding nearby facilities:", error);
      throw new Error("Failed to find nearby facilities using the AI model.");
    }
  };

const quizAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    performanceSummary: {
      type: Type.STRING,
      description: "A short, encouraging summary of the user's performance (1-2 sentences)."
    },
    improvementAreas: {
      type: Type.ARRAY,
      description: "A list of 2-3 specific topics or concepts the user should review.",
      items: { type: Type.STRING }
    },
    nextSteps: {
      type: Type.STRING,
      description: "A brief suggestion for what the user can do next to learn more."
    }
  },
  required: ["performanceSummary", "improvementAreas", "nextSteps"]
};

export const generateQuizAnalysis = async (score: number, totalQuestions: number, language: 'en' | 'hi'): Promise<QuizAnalysis> => {
    try {
      const langInstruction = language === 'hi' ? "प्रतिक्रिया हिंदी में होनी चाहिए।" : "The response should be in English.";
      const prompt = `As an encouraging environmental coach, analyze a user's quiz performance. They scored ${score} out of ${totalQuestions}. Provide a positive summary, pinpoint 2-3 specific topics for improvement (e.g., 'E-waste disposal', 'Composting basics'), and suggest a clear, actionable next step. Keep the tone supportive. Adhere to the provided JSON schema. ${langInstruction}`;
  
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: quizAnalysisSchema,
          temperature: 0.7, // Moderate temperature for creative yet focused feedback
        },
      });
  
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as QuizAnalysis;

    } catch (error) {
      console.error("Error generating quiz analysis:", error);
      throw new Error("Failed to generate quiz analysis from the AI.");
    }
};