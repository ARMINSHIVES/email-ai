import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface Recipient {
  email: string;
  name: string;
  context?: string;
}

export interface GeneratedEmail {
  recipient: Recipient;
  subject: string;
  body: string;
}

export async function generateEmails(
  recipients: Recipient[],
  summary: string,
  writingSamples: string
): Promise<GeneratedEmail[]> {
  const results: GeneratedEmail[] = [];

  for (const recipient of recipients) {
    const prompt = `You are ghostwriting an email on behalf of the user. Match their writing style exactly — same tone, vocabulary, sentence length, punctuation habits, and formality level — based on these writing samples:

---
${writingSamples || "(No writing samples provided — use a professional, friendly tone)"}
---

Write a personalized email to ${recipient.name} <${recipient.email}>.
${recipient.context ? `Additional context about this recipient: ${recipient.context}` : ""}

The email should convey: ${summary}

Important: Write ONLY the email content (no meta-commentary). Return a JSON object with exactly these fields:
{
  "subject": "the email subject line",
  "body": "the full email body text"
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    let subject = "";
    let body = "";

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        subject = parsed.subject ?? "";
        body = parsed.body ?? "";
      }
    } catch {
      // Fallback: use raw text as body
      body = text;
      subject = `Email to ${recipient.name}`;
    }

    results.push({ recipient, subject, body });
  }

  return results;
}
