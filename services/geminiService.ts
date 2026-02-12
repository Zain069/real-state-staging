import { GoogleGenAI, Type } from "@google/genai";
import { StagingStyle, RoomType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to remove data URL prefix
const stripBase64Prefix = (base64: string) => {
  return base64.replace(/^data:image\/[a-z]+;base64,/, "");
};

/**
 * Analyzes the room structure using Gemini 3 Pro with Thinking Mode.
 * Determines the best room type and creates a custom staging strategy.
 */
export const analyzeRoomWithThinking = async (
  base64Image: string
): Promise<{ roomType: RoomType; suggestedStyle: StagingStyle }> => {
  try {
    const cleanBase64 = stripBase64Prefix(base64Image);

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Analyze this room image for virtual staging purposes. 
            1. Identify the room type (Living Room, Bedroom, Kitchen, Dining Room, Office, Bathroom, or Empty Room).
            2. Analyze the lighting, flooring, and architectural features (windows, ceiling height).
            3. Create a CUSTOM, high-end interior design style that would maximize this specific property's value. 
            4. Provide a detailed 'promptModifier' that describes the furniture and decor for this specific style.
            
            Use your thinking capabilities to determine the most market-appealing setup.`
          }
        ]
      },
      config: {
        thinkingConfig: {
          thinkingBudget: 32768, // Max thinking for deep analysis
        },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roomType: { type: Type.STRING },
            styleName: { type: Type.STRING },
            styleDescription: { type: Type.STRING },
            promptModifier: { type: Type.STRING },
          },
          required: ['roomType', 'styleName', 'styleDescription', 'promptModifier']
        }
      }
    });

    const json = JSON.parse(response.text || "{}");

    // Map the string to our RoomType type, fallback to 'Empty Room'
    const validRoomTypes: RoomType[] = ['Living Room', 'Bedroom', 'Kitchen', 'Dining Room', 'Office', 'Bathroom', 'Empty Room'];
    const matchedRoomType = validRoomTypes.includes(json.roomType as RoomType) 
      ? (json.roomType as RoomType) 
      : 'Living Room';

    const customStyle: StagingStyle = {
      id: `ai-custom-${Date.now()}`,
      name: json.styleName || "AI Curated Style",
      description: json.styleDescription || "Optimized specifically for this room's architecture.",
      image: 'https://picsum.photos/400/300?grayscale', // Placeholder for custom style
      promptModifier: json.promptModifier,
      isCustom: true
    };

    return {
      roomType: matchedRoomType,
      suggestedStyle: customStyle
    };

  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Failed to analyze room structure.");
  }
};

/**
 * Stages a room using Gemini 2.5 Flash Image model.
 * It takes an input image and edits it based on the style.
 */
export const stageRoomImage = async (
  base64Image: string,
  style: StagingStyle,
  roomType: string
): Promise<string> => {
  try {
    const cleanBase64 = stripBase64Prefix(base64Image);

    // Prompt engineering for virtual staging
    // We emphasize keeping the structure while changing the interior.
    const prompt = `
      You are a professional real estate virtual stager. 
      Your task is to add furniture to the provided room image while keeping the architectural shell EXACTLY as it is.
      
      TARGET STYLE: ${style.name}
      STYLE DETAILS: ${style.promptModifier}
      ROOM TYPE: ${roomType}

      STRICT RULES:
      1. DO NOT CHANGE THE WALLS: Keep the original wall color, paint, and texture exactly as provided.
      2. DO NOT CHANGE THE FLOOR: Keep the original flooring material, color, and condition exactly as provided.
      3. DO NOT CHANGE THE CEILING, WINDOWS, OR DOORS: These structural elements must remain identical.
      4. ONLY ADD OR CHANGE FURNITURE AND DECOR: Place realistic, high-quality furniture that fits the perspective and lighting of the room.
      5. PERSPECTIVE MATCHING: The new furniture must align perfectly with the floor plane and room vanishing points.
      6. LIGHTING MATCH: Use the existing light sources from the window/fixtures to cast correct shadows for the new furniture.
      
      ACTION:
      If the room is empty, fill it with furniture in the ${style.name} style.
      If the room is furnished, replace the existing furniture with ${style.name} style furniture, but touch nothing else.
      
      Output a photorealistic image of the same room with the new furniture.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity, or detect from input
            },
          },
        ],
      },
      config: {
        // We don't set responseMimeType for image models usually, but we need to parse the output
      }
    });

    // Extract image from response
    // The model returns the generated image in the parts
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated");
    }

    let generatedImageBase64 = "";

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        generatedImageBase64 = part.inlineData.data;
        break; // Found the image
      }
    }

    if (!generatedImageBase64) {
      // Sometimes it might refuse or output text only if safety triggers
      if (parts[0]?.text) {
        throw new Error(`Generation failed: ${parts[0].text}`);
      }
      throw new Error("No image data found in response");
    }

    return `data:image/jpeg;base64,${generatedImageBase64}`;

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};