import { GoogleGenAI, Type } from "@google/genai";
import type { ScannedTicket, Scanned4DTicket, DrawResult, FourDDrawResult } from '../types';

// FIX: Per coding guidelines, API key must be read from process.env.API_KEY.
// This also resolves the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
const API_KEY = process.env.API_KEY;

export const IS_API_KEY_SET = !!API_KEY;

// Initialize ai conditionally. This prevents the app from crashing on startup if the key is missing.
const ai = IS_API_KEY_SET ? new GoogleGenAI({ apiKey: API_KEY! }) : null;

// A generic error to throw from all functions if the API key is not set
// FIX: Updated error message to refer to API_KEY to match the change above.
const apiKeyError = new Error("API Key not configured. Please set the API_KEY environment variable in your deployment settings to enable scanning features.");


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
  if (!ai) throw apiKeyError;
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
  if (!ai) throw apiKeyError;
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

// --- Live Result Fetching ---

export async function fetchLiveTotoResult(dateStr: string): Promise<DrawResult | null> {
    if (!ai) throw apiKeyError;
    console.log(`Performing live fetch for TOTO results for date: ${dateStr}`);
    try {
        const prompt = `Using Google Search, go directly to the Singapore Pools TOTO results page at https://www.singaporepools.com.sg/en/product/pages/toto_results.aspx. Find the winning numbers and the additional number for the draw date: ${dateStr}. The date might be in a dropdown list on the page, often formatted like 'Day, DD Mon YYYY'. Your response MUST be a single, valid JSON object with this exact structure: { "winningNumbers": [int, ...], "additionalNumber": int }. Do not include any other text, markdown formatting, or explanations.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const jsonString = response.text.trim();
        const parsedResult = JSON.parse(jsonString);

        if (parsedResult.winningNumbers && parsedResult.additionalNumber) {
            return {
                drawDate: dateStr,
                winningNumbers: parsedResult.winningNumbers,
                additionalNumber: parsedResult.additionalNumber,
            };
        }
        return null;

    } catch(error) {
        console.error(`Live fetch for TOTO date ${dateStr} failed:`, error);
        if (error instanceof Error && error.message.includes(apiKeyError.message)) {
            throw error;
        }
        throw new Error(`The live search for TOTO results on ${dateStr} failed. The draw may not have happened yet or results are not yet published.`);
    }
}

export async function fetchLive4DResult(dateStr: string): Promise<FourDDrawResult | null> {
     if (!ai) throw apiKeyError;
     console.log(`Performing live fetch for 4D results for date: ${dateStr}`);
    try {
        const prompt = `Using Google Search, go directly to the Singapore Pools 4D results page at https://www.singaporepools.com.sg/en/product/pages/4d_results.aspx. Find all winning numbers for the draw date: ${dateStr}. The date might be in a dropdown list on the page, often formatted like 'Day, DD Mon YYYY'. Your response MUST be a single, valid JSON object with this exact structure: { "firstPrize": "string", "secondPrize": "string", "thirdPrize": "string", "starterPrizes": ["string", ...], "consolationPrizes": ["string", ...] }. It is critical that all prize numbers are 4-digit strings to preserve leading zeros (e.g., "0123"). Do not include any other text, markdown, or explanations.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const jsonString = response.text.trim();
        const parsedResult = JSON.parse(jsonString);

        if (parsedResult.firstPrize && parsedResult.starterPrizes) {
            return {
                drawDate: dateStr,
                ...parsedResult,
            };
        }
        return null;

    } catch(error) {
        console.error(`Live fetch for 4D date ${dateStr} failed:`, error);
        if (error instanceof Error && error.message.includes(apiKeyError.message)) {
            throw error;
        }
        throw new Error(`The live search for 4D results on ${dateStr} failed. The draw may not have happened yet or results are not yet published.`);
    }
}
