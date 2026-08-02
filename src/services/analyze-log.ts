import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const systemPrompt = `You are a senior production-support engineer. Analyze the provided application log. Return:
1. A probable root cause, clearly marking uncertainty where applicable.
2. Evidence from the log.
3. Concrete next diagnostic steps.
4. A safe remediation or workaround.
Do not invent details that are absent from the log.`;

export async function analyzeLog(logContent: string): Promise<string> {
  const modelId = requiredEnvironment("BEDROCK_MODEL_ID");
  const client = new BedrockRuntimeClient({
    region: requiredEnvironment("AWS_REGION"),
  });

  const response = await client.send(
    new ConverseCommand({
      modelId,
      system: [{ text: systemPrompt }],
      messages: [
        {
          role: "user",
          content: [{ text: `Application log:\n\n${logContent}` }],
        },
      ],
      inferenceConfig: {
        maxTokens: 800,
        temperature: 0.2,
      },
    }),
  );

  const analysis = response.output?.message?.content
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!analysis) {
    throw new Error("Bedrock returned no text analysis.");
  }

  return analysis;
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set in the environment.`);
  }
  return value;
}

