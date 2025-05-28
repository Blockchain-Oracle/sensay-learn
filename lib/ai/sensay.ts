import { SensayAPI } from "../../src/sensay-sdk/SensayAPI";

const SENSAY_API_KEY = process.env.SENSAY_API_KEY || "2b1f87eed6ffddc97f1fc30393f59432f986e2fd99073b939f6996bbb175bd69";
const SAMPLE_USER_ID = process.env.SAMPLE_USER_ID || "73a8ac8e-2f3c-4896-bd67-54bbcc2040f8"; // Fallback user ID if not provided
const API_VERSION = "2025-03-25"; // Default API version

// Type for Sensay LLM models
type SensayModel = 
  | "gpt-4o" 
  | "claude-3-5-haiku-latest" 
  | "claude-3-7-sonnet-latest" 
  | "claude-4-sonnet-20250514" 
  | "grok-2-latest" 
  | "grok-3-beta" 
  | "deepseek-chat" 
  | "o3-mini" 
  | "gpt-4o-mini" 
  | "huggingface-eva" 
  | "huggingface-dolphin-llama";

// Updated message type with more flexibility
type SensayMessage = {
  role: string;
  content: string | null | undefined;
};

// Type for the headers object to avoid indexing errors
type SensayHeaders = {
  "Content-Type": string;
  "X-ORGANIZATION-SECRET": string;
  "X-USER-ID"?: string;
};

// Type for linked accounts
type LinkedAccount = {
  accountID: string;
  accountType: "discord" | "telegram" | "embed";
};

/**
 * Initialize the Sensay API client with proper authentication
 */
function initSensayClient(userId?: string) {
  if (!SENSAY_API_KEY) {
    throw new Error("Sensay API configuration error: Missing API key");
  }
  
  const headers: SensayHeaders = {
    "Content-Type": "application/json",
    "X-ORGANIZATION-SECRET": SENSAY_API_KEY,
    ...(userId ? { "X-USER-ID": userId } : {}),
  };
  
  const config = {
    HEADERS: headers
  };
  
  return new SensayAPI(config);
}

/**
 * Get or create a replica for use with the Sensay API
 */
async function getOrCreateReplica(client: SensayAPI, modelInput: string, userId: string) {
  try {
    // List replicas to find our default replica
    const replicas = await client.replicas.getV1Replicas();
    let replicaId;

    // Look for the default replica by slug
    if (replicas.items && replicas.items.length > 0) {
      const defaultReplica = replicas.items.find(replica => {
        return replica.ownerID === userId;
      });
      if (defaultReplica) {
        replicaId = defaultReplica.uuid;
        return replicaId;
      }
    }

    // Ensure we have a valid model
    const model = validateModel(modelInput);

    // Create the default replica if it doesn't exist
    const newReplica = await client.replicas.postV1Replicas(API_VERSION, {
      name: `My Replica ${userId}`,
      shortDescription: "An AI learning assistant",
      greeting: "Hello, I'm your AI learning assistant. How can I help you today?",
      slug: `${userId}-replica`,
      ownerID: userId, // Use the correct owner UUID
      llm: {
        model: model,
        memoryMode: "rag-search", // Use the same memory mode as existing replica
        systemMessage: "You are a helpful AI assistant that provides clear and concise responses about learning topics."
      }
    });
    
    return newReplica.uuid;
  } catch (error) {
    console.error("Error getting or creating replica:", error);
    throw error;
  }
}

/**
 * Validate and return a supported model
 */
function validateModel(modelInput: string): SensayModel {
  // List of supported models
  const supportedModels: SensayModel[] = [
    "gpt-4o",
    "claude-3-5-haiku-latest",
    "claude-3-7-sonnet-latest",
    "claude-4-sonnet-20250514",
    "grok-2-latest",
    "grok-3-beta",
    "deepseek-chat",
    "o3-mini",
    "gpt-4o-mini",
    "huggingface-eva",
    "huggingface-dolphin-llama"
  ];
  
  // Check if the input model is supported
  if (modelInput && supportedModels.includes(modelInput as SensayModel)) {
    return modelInput as SensayModel;
  }
  
  // Default to GPT-4o if the model is not supported (matches existing replica)
  return "gpt-4o";
}

/**
 * Generate a response using the Sensay API
 */
export async function generateChatResponse(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  model = "claude-3-5-haiku-latest",
  useCache = false,
  userId: string = SAMPLE_USER_ID
) {
  try {
    // Process userId to handle Privy DID format
    let processedUserId = userId
    if (userId && userId.startsWith("did:privy:")) {
      // Extract just the unique part after the prefix
      processedUserId = userId.split("did:privy:")[1]
    }

    let client = initSensayClient();
    
    // Check if user exists, create if necessary
    try {
      const user = await client.users.getV1Users(processedUserId);
    } catch (error) {
      // User doesn't exist, create
      const user = await client.users.postV1Users(API_VERSION, {
        id: processedUserId,
        name: "Sensay Learn User",
        email: `${processedUserId}@example.com`,
      });
    }
    
    // Get or create replica
    const replicaId = await getOrCreateReplica(client, model, processedUserId);
    
    // Prepare content for the request
    let userContent = "";
    
    // Convert messages array to a single content string for the standard API
    // Include system prompt at the beginning if provided
    if (systemPrompt) {
      userContent += `System: ${systemPrompt}\n\n`;
    }
    
    // Add all messages to the content string
    messages.forEach(msg => {
      userContent += `${msg.role}: ${msg.content || ""}\n\n`;
    });
    
    // Update the client to use the userId
    client = initSensayClient(processedUserId);
    
    // Using the standard chat completions endpoint
    const response = await client.chatCompletions.postV1ReplicasChatCompletions(
      replicaId,
      API_VERSION,
      {
        content: userContent,
        source: 'web',
        skip_chat_history: false
      }
    );
    
    if (!response || !response.content) {
      console.warn("Sensay API returned empty message:", response);
      return "";
    }
    
    return response.content;
  } catch (error) {
    console.error("Sensay API error:", error);
    throw new Error(`Failed to generate AI response from Sensay: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate a summary using Sensay API
 */
export async function generateSummary(text: string, userId: string = SAMPLE_USER_ID): Promise<string> {
  try {
    // Process userId to handle Privy DID format
    let processedUserId = userId
    if (userId && userId.startsWith("did:privy:")) {
      // Extract just the unique part after the prefix
      processedUserId = userId.split("did:privy:")[1]
    }
    
    const client = initSensayClient(processedUserId);
    
    // Get or create replica
    const replicaId = await getOrCreateReplica(client, "claude-3-5-haiku-latest", processedUserId);
    
    // Using the standard chat completions endpoint
    const response = await client.chatCompletions.postV1ReplicasChatCompletions(
      replicaId,
      API_VERSION,
      {
        content: `Please provide a concise summary of the following text:\n\n${text}`,
        source: 'web',
        skip_chat_history: true
      }
    );
    
    if (!response || !response.content) {
      return "";
    }
    
    return response.content;
  } catch (error) {
    console.error("Error generating Sensay summary:", error);
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate flashcards using Sensay API
 */
export async function generateFlashcards(text: string, userId: string = SAMPLE_USER_ID): Promise<Array<{ question: string; answer: string }>> {
  try {
    // Process userId to handle Privy DID format
    let processedUserId = userId
    if (userId && userId.startsWith("did:privy:")) {
      // Extract just the unique part after the prefix
      processedUserId = userId.split("did:privy:")[1]
    }
    
    const client = initSensayClient(processedUserId);
    
    // Get or create replica
    const replicaId = await getOrCreateReplica(client, "claude-3-5-haiku-latest", processedUserId);
    
    // Using the standard chat completions endpoint
    const response = await client.chatCompletions.postV1ReplicasChatCompletions(
      replicaId,
      API_VERSION,
      {
        content: `Create educational flashcards from the following text. Return a JSON array of objects with "question" and "answer" fields. Make questions clear and answers concise.\n\n${text}`,
        source: 'web',
        skip_chat_history: true
      }
    );
    
    try {
      const content = response.content || "[]";
      // Find the JSON array in the response using regex
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (parseError) {
      console.error("Error parsing flashcards JSON:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Initialize or verify a user exists
 * Can be used to ensure the user exists before making API calls
 */
export async function initializeUser(
  userId: string, 
  email: string, 
  name: string,
  privyId?: string
): Promise<boolean> {
  try {
    // Process userId to handle Privy DID format
    let processedUserId = userId
    if (userId && userId.startsWith("did:privy:")) {
      // Extract just the unique part after the prefix
      processedUserId = userId.split("did:privy:")[1]
    }

    const client = initSensayClient(processedUserId);
    
    // Check if user exists
    try {
      await client.users.getV1Users(processedUserId);
      console.log(`User ${processedUserId} already exists in Sensay`);
      return true; // User exists
    } catch (error) {
      // User doesn't exist, create them
      console.log(`Creating new user in Sensay with ID: ${processedUserId}`);
      
      const userData: {
        id: string;
        name: string;
        email: string;
        linkedAccounts: LinkedAccount[];
      } = {
        id: processedUserId,
        name: name || "User",
        email: email || "",
        linkedAccounts: []
      };
      
      // If this is a social login, add the linked account
      if (privyId && privyId.startsWith("did:privy:")) {
        userData.linkedAccounts = [
          {
            accountID: privyId,
            accountType: "embed"
          }
        ];
      }
      
      const result = await client.users.postV1Users(
        API_VERSION,
        userData
      );
      
      console.log(`User created successfully: ${result.id}`);
      return true;
    }
  } catch (error) {
    console.error("Failed to initialize user in Sensay:", error);
    return false;
  }
} 