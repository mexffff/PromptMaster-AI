
import { GoogleGenAI, Type } from "@google/genai";
import { ResearchData, AppMode, NoCodePlatform, ExperienceLevel, FocusArea } from "../types";

// Helper to get client with current key
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. VISUAL ART TEMPLATE (Existing)
const VISUAL_TEMPLATE = {
  "scene": {
    "type": "elevator_mirror_selfie",
    "location": "apartment_elevator",
    "time": "daytime",
    "lighting": "warm_elevator_light",
    "atmosphere": "intimate_between_floors"
  },
  "camera": {
    "pov": "we_are_the_phone",
    "type": "mirror_selfie",
    "angle": "chest_level_slightly_angled",
    "framing": "full_body_in_mirror",
    "phone_visible": true
  },
  "subject": {
    "pose": {
      "stance": "facing_mirror_hips_angled",
      "weight": "on_one_leg_hip_soft_curve_out",
      "energy": "relaxed_effortless_not_aggressive",
      "arms": {
        "right": "holding_phone_for_selfie",
        "left": "carrying_jacket_draped_over_forearm"
      }
    },
    "expression": {
      "eyes": {
        "style": "soft_doe_eyes_through_lowered_lashes",
        "energy": "knowing_not_sleepy",
        "contact": "looking_at_camera_direct",
        "message": "i_see_you_looking_welcome_to_look_more"
      },
      "cheeks": {
        "color": "soft_pink_flush",
        "reason": "just_came_in_from_cold",
        "texture": "healthy_rosy_alive"
      },
      "lips": {
        "position": "soft_part_slightly_open",
        "color": "pink_glossy",
        "energy": "about_to_say_something_or_waiting"
      },
      "overall": "soft_invitation_available_knowing"
    },
    "hair": {
      "color": "platinum_blonde_icy_white",
      "style": "long_loose_slightly_wavy",
      "placement": "falling_from_under_cap_over_shoulders",
      "detail": "some_tucked_some_flowing_free"
    }
  },
  "outfit": {
    "hat": {
      "type": "baseball_cap",
      "color": "forest_green_or_olive",
      "wear_style": "forward_classic",
      "condition": "slightly_worn_favorite_hat",
      "effect": "shadows_forehead_intensifies_eyes"
    },
    "top": {
      "type": "cropped_long_sleeve",
      "fabric": "ribbed_knit_thin_fitted",
      "color": "black",
      "neckline": "scooped_not_too_low",
      "fit": "tight_every_curve_traced_ribs_visible",
      "length": "cropped_above_belly_button_full_stomach_exposed"
    },
    "skirt": {
      "type": "pleated_tennis_skirt",
      "color": "crisp_white",
      "fit": "high_waisted_below_belly_button",
      "length": "short_upper_thigh",
      "detail": "gap_of_bare_skin_between_crop_and_skirt"
    },
    "stockings": {
      "type": "fishnet_thigh_highs",
      "color": "black",
      "pattern": "small_diamond_delicate",
      "top": "thin_lace_band",
      "thigh_gap": "1-2_inches_bare_skin_between_skirt_and_lace"
    },
    "jacket": {
      "type": "leather_or_olive_khaki",
      "status": "draped_over_forearm_not_worn",
      "purpose": "adds_context_story_texture_shows_motion"
    }
  },
  "accessories": {
    "bag": {
      "type": "small_crossbody",
      "material": "black_leather_or_canvas",
      "hardware": "silver_or_gold",
      "position": "strap_diagonal_across_chest_bag_at_hip"
    },
    "earrings": {
      "type": "small_silver_hoops",
      "visibility": "visible_below_cap"
    },
    "necklace": {
      "type": "thin_silver_chain",
      "pendant": "tiny_simple"
    },
    "rings": {
      "type": "one_thin_band",
      "style": "minimal"
    }
  },
  "makeup": {
    "base": "natural_glowing_skin",
    "cheeks": "natural_pink_from_cold",
    "brows": "soft_groomed",
    "eyes": "mascara_pretty_lashes",
    "lips": "pink_gloss_shiny_soft"
  },
  "color_story": {
    "primary": ["forest_green_cap", "black_top", "white_skirt", "black_fishnet"],
    "accents": ["platinum_blonde", "pale_skin", "pink_flush"],
    "contrast": "green_vs_blonde_white_vs_black_pure_vs_sin"
  },
  "narrative": {
    "context": "girl_in_transit_between_places",
    "backstory": "just_came_from_outside_flushed_cheeks_jacket",
    "action": "caught_herself_in_mirror_liked_what_she_saw",
    "intention": "stopped_to_take_this_for_someone",
    "caption_suggestion": "running_late_💚_or_on_my_way"
  },
  "vibe": {
    "core": "soft_invitation_knowing_effortless",
    "contrast": "sporty_cap_vs_fishnet_sin_casual_vs_calculated",
    "energy": "she_knows_you_know_game_recognized",
    "result": "the_face_that_makes_people_act_stupid"
  }
};

// 2. NO-CODE ARCHITECT TEMPLATE (Advanced)
// This template simulates a high-level technical design document.
const SOFTWARE_TEMPLATE = {
  "architecture_summary": {
    "project_name": "App Name",
    "selected_platform": "Platform Name (e.g. Bubble)",
    "architect_notes": "Senior commentary on why this structure was chosen.",
    "complexity_score": "High/Medium/Low"
  },
  "database_architecture": {
    "tables": [
      {
        "name": "Users",
        "fields": ["email (string)", "role (enum)", "is_active (boolean)"],
        "indexes": ["email"],
        "security_rules": "Row Level Security: Users can only see their own profile."
      }
    ],
    "relationships": ["One-to-Many: User -> Orders"]
  },
  "critical_workflows": [
    {
      "name": "Onboarding Flow",
      "trigger": "User Sign Up",
      "logic_steps": ["Create Account", "Send Verification Email", "Initialize User Settings"],
      "error_handling": "If email exists, return 409 Conflict."
    }
  ],
  "integrations_and_apis": [
    {
      "provider": "Stripe",
      "use_case": "Subscriptions",
      "specific_endpoint": "checkout.sessions.create"
    }
  ],
  "master_prompt_for_ai_builder": "A copy-paste prompt optimized for the platform's AI assistant."
};

/**
 * Step 1: Analyze an image if provided.
 */
export const analyzeImage = async (base64Image: string, mimeType: string): Promise<string> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          {
            text: "Analyze this image in extreme detail. If it's a UI screenshot, describe the layout, buttons, and potential database fields. If it's a photo, describe the scene for an art prompt."
          }
        ]
      }
    });
    return response.text || "Image analysis failed.";
  } catch (error) {
    console.error("Image analysis error:", error);
    return "Could not analyze image.";
  }
};

/**
 * Step 2: Research
 */
export const performResearch = async (
  userPrompt: string, 
  imageContext: string, 
  mode: AppMode, 
  platform: NoCodePlatform = 'Bubble.io'
): Promise<ResearchData> => {
  const ai = getClient();
  
  // If no text prompt, skip research
  if (!userPrompt || userPrompt.length < 5) {
     return { summary: "No external research needed.", sources: [] };
  }

  let searchContext = "";
  if (mode === AppMode.NO_CODE_ARCHITECT) {
    // 39-YEAR EXPERT RESEARCH STRATEGY
    searchContext = `
      Context: Senior Software Architect Researching for ${platform}.
      User Request: "${userPrompt}"
      
      OBJECTIVE:
      Find the *latest* and *best practice* technical implementation details for ${platform}.
      
      SEARCH STRATEGY:
      1. Search for "${platform} database best practices for [topic]".
      2. Search for specialized plugins/libraries for "${platform} [feature]".
      3. Look for "Performance pitfalls in ${platform} for [feature]".
      
      We need to know the *exact* plugin names, API limitations, or architectural patterns to recommend.
    `;
  } else {
    searchContext = `
      Context: Generating a visual art prompt.
      User Topic: "${userPrompt}"
      ${imageContext ? `Image Context: ${imageContext}` : ''}
      Find specific visual aesthetics, fashion terms, or lighting styles that match this vibe.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: searchContext,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    const uniqueSources = sources.filter((v: any, i: number, a: any) => a.findIndex((t: any) => t.uri === v.uri) === i);

    return {
      summary: text,
      sources: uniqueSources
    };
  } catch (error) {
    console.error("Research error:", error);
    return {
      summary: "",
      sources: []
    };
  }
};

/**
 * Step 3: Generate the Strict JSON Prompt
 */
export const generateEnhancedPrompt = async (
  userPrompt: string, 
  researchData: ResearchData, 
  imageContext: string,
  mode: AppMode,
  platform: NoCodePlatform = 'Bubble.io',
  experienceLevel: ExperienceLevel = 'Principal (39 Yıl - Extreme)',
  focusArea: FocusArea = 'Genel Mimari'
): Promise<{ enhancedPrompt: string; rationale: string; correctedInput: string }> => {
  const ai = getClient();

  let selectedTemplate = {};
  let personaInstruction = "";

  if (mode === AppMode.NO_CODE_ARCHITECT) {
    selectedTemplate = SOFTWARE_TEMPLATE;
    personaInstruction = `
      Role: You are a Software Architect with this profile:
      - **Experience Level**: ${experienceLevel}
      - **Focus Area**: ${focusArea}
      - **Target Platform**: ${platform}
      
      Persona details based on Experience:
      - 'Junior (MVP)': Focus on speed, simplicity, getting it working. Ignore edge cases.
      - 'Senior (Best Practice)': Balanced, secure, scalable, standard patterns.
      - 'Principal (39 Yıl - Extreme)': OBSESSIVE about security, data integrity, race conditions, and "The Right Way". Harsh critic of bad ideas.
      
      YOUR TASK:
      1. Analyze the user's request.
      2. Design the specification for ${platform} emphasizing the ${focusArea}.
      3. **Master Prompt**: Write a prompt for an AI agent that includes these specific architectural constraints.
      
      THE TEMPLATE FOR "enhancedPrompt" (YOU MUST FOLLOW THIS STRUCTURE EXACTLY):
      ${JSON.stringify(SOFTWARE_TEMPLATE, null, 2)}
    `;
  } else {
    selectedTemplate = VISUAL_TEMPLATE;
    personaInstruction = `
      Role: You are an advanced Visual AI connecting user ideas to a STRICT JSON format for image generation.
      
      THE TEMPLATE FOR "enhancedPrompt" (YOU MUST FOLLOW THIS STRUCTURE EXACTLY):
      ${JSON.stringify(VISUAL_TEMPLATE, null, 2)}
    `;
  }

  const systemInstruction = `
    ${personaInstruction}

    Output Structure:
    You must return a single JSON object with these exact keys:
    {
      "correctedInput": "The fixed user input (in Turkish).",
      "rationale": "Why you made these choices (in Turkish). Explain like a mentor corresponding to the selected experience level.",
      "enhancedPrompt": { ... the populated template object ... }
    }
  `;

  const userMessage = `
    User Input: "${userPrompt}"
    Platform: "${platform}"
    Experience: "${experienceLevel}"
    Focus: "${focusArea}"
    Research: "${researchData.summary}"
    
    Task: Create the JSON prompt object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 16000 },
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    const jsonString = JSON.stringify(result.enhancedPrompt, null, 2);

    return {
      enhancedPrompt: jsonString || "{}",
      rationale: result.rationale || "Rationale not provided.",
      correctedInput: result.correctedInput || ""
    };

  } catch (error) {
    console.error("Thinking error:", error);
    throw new Error("Failed to generate structure.");
  }
};
