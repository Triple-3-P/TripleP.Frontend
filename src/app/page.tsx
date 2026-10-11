import { messages } from '@/shared/config/messages';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">
        {messages.home.title}
      </h1>
      <p className="text-muted-foreground">{messages.home.description}</p>
    </main>
  );
}
