import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Real-time Data Retrieval Bot
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your AI-powered administrative assistant
          </p>
        </header>
        <ChatInterface />
      </div>
    </main>
  );
}
