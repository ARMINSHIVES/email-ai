import * as msal from "@azure/msal-node";

const SCOPES = ["https://graph.microsoft.com/Mail.Send", "offline_access", "openid", "profile", "email"];

export function createMsalApp() {
  return new msal.ConfidentialClientApplication({
    auth: {
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      authority: "https://login.microsoftonline.com/common",
    },
  });
}

export async function getAuthUrl(): Promise<string> {
  const app = createMsalApp();
  return app.getAuthCodeUrl({
    scopes: SCOPES,
    redirectUri: process.env.AZURE_REDIRECT_URI!,
  });
}

export async function exchangeCode(code: string) {
  const app = createMsalApp();
  const result = await app.acquireTokenByCode({
    code,
    scopes: SCOPES,
    redirectUri: process.env.AZURE_REDIRECT_URI!,
  });
  return result;
}

export async function sendOutlook(
  to: string,
  subject: string,
  body: string,
  accessToken: string
) {
  const response = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "Text", content: body },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Outlook send failed: ${err}`);
  }
}
