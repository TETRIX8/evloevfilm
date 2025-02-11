
import { Navigation } from "@/components/navigation/Navigation";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10">
      <Navigation />
      
      <main className="container pt-24 pb-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                О нас
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-24 h-24 mx-auto"
            >
              {/* Animated Rabbit */}
              <div className="relative w-full h-full">
                <motion.div
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -20, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0"
                >
                  <span className="text-6xl" role="img" aria-label="Кролик">🐰</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          <div className="space-y-8 text-lg">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-primary/10"
            >
              <p className="leading-relaxed">
                EVOLVEFILM - это не просто платформа для просмотра фильмов, это ваш персональный 
                проводник в мире кинематографа. Мы создали пространство, где каждый зритель 
                может найти именно то, что искал, и открыть для себя что-то новое.
              </p>
            </motion.div>
            
            <div className="grid gap-8 md:grid-cols-2">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm border border-primary/10 shadow-lg"
              >
                <h3 className="text-2xl font-semibold mb-4 text-primary">Наша миссия</h3>
                <p className="leading-relaxed">
                  Мы стремимся сделать качественное кино доступным для каждого, создавая 
                  уникальное пространство, где технологии и искусство кино сливаются воедино, 
                  чтобы подарить вам незабываемые впечатления от каждого просмотра.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm border border-primary/10 shadow-lg"
              >
                <h3 className="text-2xl font-semibold mb-4 text-primary">Наши преимущества</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✦</span>
                    <span>Огромная коллекция фильмов всех жанров</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✦</span>
                    <span>Умный поиск и персональные рекомендации</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✦</span>
                    <span>Высокое качество изображения и звука</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✦</span>
                    <span>Удобный и современный интерфейс</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center p-8 bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-primary/10"
            >
              <p className="text-xl font-medium text-primary">
                Присоединяйтесь к нам в путешествии по миру кино!
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
