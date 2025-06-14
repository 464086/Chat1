import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { provider, apiKey } = await req.json()

    let model
    const testMessage = "Hello! This is a connection test."

    switch (provider) {
      case "openai":
        model = openai("gpt-3.5-turbo", { apiKey })
        break
      case "anthropic":
        model = anthropic("claude-3-haiku-20240307", { apiKey })
        break
      case "google":
        const googleAI = createGoogleGenerativeAI({ apiKey })
        model = googleAI("gemini-pro")
        break
      default:
        return new Response(JSON.stringify({ error: "Unsupported provider" }), { status: 400 })
    }

    const result = await generateText({
      model,
      prompt: testMessage,
      maxTokens: 10,
    })

    return new Response(JSON.stringify({ success: true, message: "Connection successful" }), { status: 200 })
  } catch (error) {
    console.error("Connection test error:", error)

    let errorMessage = "Connection failed"
    if (error instanceof Error) {
      if (
        error.message.includes("401") ||
        error.message.includes("authentication") ||
        error.message.includes("API key")
      ) {
        errorMessage = "Invalid API key"
      } else if (error.message.includes("quota") || error.message.includes("limit")) {
        errorMessage = "API quota exceeded"
      }
    }

    return new Response(JSON.stringify({ error: errorMessage }), { status: 400 })
  }
}
