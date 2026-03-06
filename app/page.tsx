export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8">
      <div>
        <h1 className="text-4xl font-bold mb-3">EmailAI</h1>
        <p className="text-gray-400 text-lg max-w-md">
          Generate personalized emails in your own voice, powered by Claude AI.
          Send them directly through Gmail or Outlook.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <a
          href="/setup"
          className="block w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors text-center"
        >
          1. Setup — Connect email &amp; upload samples
        </a>
        <a
          href="/compose"
          className="block w-full py-3 px-6 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors text-center"
        >
          2. Compose &amp; Send
        </a>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-4 text-sm text-gray-500 max-w-lg">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">✍️</span>
          <span>Learns your writing style</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">👥</span>
          <span>Personalizes per recipient</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">✅</span>
          <span>You approve before sending</span>
        </div>
      </div>
    </div>
  );
}
