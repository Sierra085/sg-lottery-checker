import { GoogleGenAI, Type } from "@google/genai";
import type { ScannedTicket, Scanned4DTicket } from '../types';

// Vercel exposes browser variables prefixed with NEXT_PUBLIC_
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const IS_API_KEY_SET = !!API_KEY;

// Gracefully handle missing API key. The UI will show an error message.
// The key can be an empty string, and the library will throw an error on first use, which is caught in the UI.
const ai = new GoogleGenAI({ apiKey: API_KEY || "" });


const totoResponseSchema = {
  type: Type.OBJECT,
  properties: {
    drawDate: {
      type: Type.STRING,
      description: 'The draw date found on the ticket in YYYY-MM-DD format.',
    },
    entries: {
      type: Type.ARRAY,
      description: 'An array of all the TOTO entries found on the ticket.',
      items: {
        type: Type.OBJECT,
        properties: {
          numbers: {
            type: Type.ARRAY,
            description: 'An array of lottery numbers for this entry. Usually 6 for Ordinary bets. Ensure they are between 1 and 49.',
            items: { type: Type.INTEGER },
          },
          betType: {
            type: Type.STRING,
            description: 'The bet type, typically "Ordinary", "System 7", etc.',
          },
        },
        required: ['numbers', 'betType'],
      },
    },
  },
  required: ['drawDate', 'entries'],
};

const fourDResponseSchema = {
    type: Type.OBJECT,
    properties: {
        drawDate: {
            type: Type.STRING,
            description: 'The draw date found on the ticket in YYYY-MM-DD format.',
        },
        entries: {
            type: Type.ARRAY,
            description: 'An array of all the 4D entries found on the ticket.',
            items: {
                type: Type.OBJECT,
                properties: {
                    number: {
                        type: Type.STRING,
                        description: 'The 4-digit number. MUST be a string to preserve leading zeros, e.g., "0012".'
                    },
                    betType: {
                        type: Type.STRING,
                        description: 'The bet type, typically "Big", "Small", or "iBet".'
                    }
                },
                required: ['number', 'betType'],
            }
        }
    },
    required: ['drawDate', 'entries'],
};

function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string; } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string"));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function parseTicketImage(imageFile: File): Promise<ScannedTicket> {
  if (!IS_API_KEY_SET) {
    throw new Error("Gemini API Key is not configured. Please set the NEXT_PUBLIC_API_KEY environment variable in your Vercel project settings.");
  }
  try {
    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `You are an expert Optical Character Recognition (OCR) system specializing in Singapore TOTO lottery tickets. 
    Analyze the provided image of a TOTO ticket. A single ticket can contain multiple entries (rows of numbers). Your task is to be thorough and extract ALL entries, their corresponding bet types (e.g., 'Ordinary'), and the draw date.
    - Each entry will have a set of numbers, usually 6 for an Ordinary bet. The numbers must be integers between 1 and 49.
    - The draw date on the ticket will be in DD/MM/YY format. You MUST convert this to YYYY-MM-DD format in your output. For example, if the ticket shows '25/07/24', you must output '2024-07-25'.
    - Your output MUST be a valid JSON object matching the provided schema. Do not include any other text or markdown formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          imagePart,
          { text: prompt }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: totoResponseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedResult = JSON.parse(jsonString);

    if (!parsedResult.entries || parsedResult.entries.length === 0) {
        throw new Error("AI could not detect any TOTO entries. Please try again with a clearer picture.");
    }
     if (!parsedResult.drawDate || !/^\d{4}-\d{2}-\d{2}$/.test(parsedResult.drawDate)) {
        throw new Error("AI could not determine a valid draw date from the ticket.");
    }
    
    return parsedResult as ScannedTicket;

  } catch (error) {
    console.error("Error parsing ticket with Gemini API:", error);
    if (error instanceof Error) {
        if(error.message.includes('json')){
            throw new Error("The AI failed to return a valid result. The image might be blurry or angled.");
        }
        throw new Error(`An error occurred while scanning the ticket: ${error.message}`);
    }
    throw new Error("An unknown error occurred during ticket scanning.");
  }
}

export async function parse4DTicketImage(imageFile: File): Promise<Scanned4DTicket> {
  if (!IS_API_KEY_SET) {
    throw new Error("Gemini API Key is not configured. Please set the NEXT_PUBLIC_API_KEY environment variable in your Vercel project settings.");
  }
  try {
    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `You are an expert Optical Character Recognition (OCR) system specializing in Singapore 4D lottery tickets. 
    Analyze the provided image of a 4D ticket. A single ticket can contain multiple 4-digit entries. Your task is to be thorough and extract ALL 4-digit numbers, their corresponding bet types (e.g., 'Big', 'Small'), and the draw date.
    - The numbers must be 4 digits long. Preserve any leading zeros by returning them as strings.
    - The draw date on the ticket will be in DD/MM/YY format. You MUST convert this to YYYY-MM-DD format in your output. For example, if the ticket shows '23/02/25', you must output '2025-02-23'.
    - Your output MUST be a valid JSON object matching the provided schema. Do not include any other text or markdown formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          imagePart,
          { text: prompt }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: fourDResponseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedResult = JSON.parse(jsonString);

    if (!parsedResult.entries || parsedResult.entries.length === 0) {
        throw new Error("AI could not detect any 4D numbers. Please try again with a clearer picture.");
    }
    if (!parsedResult.drawDate || !/^\d{4}-\d{2}-\d{2}$/.test(parsedResult.drawDate)) {
        throw new Error("AI could not determine a valid draw date from the ticket.");
    }
    
    return parsedResult as Scanned4DTicket;

  } catch (error) {
    console.error("Error parsing 4D ticket with Gemini API:", error);
    if (error instanceof Error) {
        if(error.message.includes('json')){
            throw new Error("The AI failed to return a valid result. The image might be blurry or angled.");
        }
        throw new Error(`An error occurred while scanning the ticket: ${error.message}`);
    }
    throw new Error("An unknown error occurred during 4D ticket scanning.");
  }
}