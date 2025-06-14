import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, instructions, selectedModel, apiKeys } = await req.json()

    const systemMessage = instructions ? { role: "system" as const, content: instructions } : null
    const allMessages = systemMessage ? [systemMessage, ...messages] : messages

    let model
    let apiKey

    switch (selectedModel.provider) {
      case "openai":
        apiKey = apiKeys.openai || process.env.OPENAI_API_KEY
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "OpenAI API key is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          })
        }
        model = openai(selectedModel.name, { apiKey })
        break

      case "anthropic":
        apiKey = apiKeys.anthropic || process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "Anthropic API key is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          })
        }
        model = anthropic(selectedModel.name, { apiKey })
        break

      case "google":
        apiKey = apiKeys.google || process.env.GOOGLE_GENERATIVE_AI_API_KEY
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "Google API key is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          })
        }
        const googleAI = createGoogleGenerativeAI({ apiKey })
        model = googleAI(selectedModel.name)
        break

      default:
        return new Response(JSON.stringify({ error: "Unsupported model provider" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
    }

    const result = streamText({
      model,
      messages: allMessages,
      temperature: 0.7,
      maxTokens: 4000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API Error:", error)

    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        return new Response(JSON.stringify({ error: "Invalid API key provided" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }

      if (error.message.includes("quota") || error.message.includes("limit")) {
        return new Response(JSON.stringify({ error: "API quota exceeded. Please check your usage limits." }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    return new Response(JSON.stringify({ error: "Internal server error. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
