import { Navigation } from "@/components/navigation/Navigation";

export default function About() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container pt-24 pb-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center">О нас</h1>
          
          <div className="space-y-6 text-lg">
            <p>
              EVOLVEFILM - это современная платформа для просмотра фильмов, сериалов и мультфильмов. 
              Мы стремимся предоставить нашим пользователям лучший опыт просмотра контента.
            </p>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-card">
                <h3 className="text-xl font-semibold mb-3">Наша миссия</h3>
                <p>Делать кино доступным для каждого, предоставляя удобный и современный интерфейс для поиска и просмотра любимых фильмов.</p>
              </div>
              
              <div className="p-6 rounded-lg bg-card">
                <h3 className="text-xl font-semibold mb-3">Наши преимущества</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Большая коллекция фильмов</li>
                  <li>Удобный поиск</li>
                  <li>Персональные рекомендации</li>
                  <li>Высокое качество видео</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}