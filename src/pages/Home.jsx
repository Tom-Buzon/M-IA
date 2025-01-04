import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import FluidButton from '../components/buttons/FluidButton';
import RippleBackground from '../components/effects/RippleBackground';
import WaveButton from '../components/buttons/WaveButton';

const Home = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current.children, {
        duration: 1,
        y: 30,
        opacity: 0,
        stagger: 0.2,
        ease: "power3.out"
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const expertiseAreas = [
    {
      title: "Développement MVP/POC",
      description: "Création rapide et adaptative de prototypes et produits minimum viables, parfaitement alignés avec vos objectifs.",
      icon: "🚀",
      points: [
        "Développement agile et itératif",
        "Adaptation continue aux besoins",
        "Focus sur les fonctionnalités essentielles",
        "Livraison rapide et de qualité"
      ]
    },
    {
      title: "Expertise IA",
      description: "Conseil expert et accompagnement dans l'intégration de solutions d'intelligence artificielle.",
      icon: "🧠",
      points: [
        "Conseil stratégique en IA",
        "Sélection des technologies adaptées",
        "Intégration et déploiement",
        "Formation et support"
      ]
    }
  ];

  return (
    <div className="relative min-h-screen text-white">
      <RippleBackground />
      <div className="relative z-10 bg-black/30 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div ref={heroRef} className="max-w-7xl mx-auto text-center">
            {/* Hero Section */}
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="hero-title text-5xl md:text-7xl font-bold text-center mb-8">
                  {['Transformez', 'vos', 'idées', 'en', 'réalité'].map((word, index) => (
                    <span key={index} className="inline-block mx-2">{word}</span>
                  ))}
                </h1>
                <p className="hero-subtitle text-xl md:text-2xl text-gray-300 text-center max-w-3xl mx-auto mb-12">
                  Développement rapide de MVP/POC et expertise en intelligence artificielle pour concrétiser vos projets
                </p>
                <div className="hero-cta flex justify-center gap-6 items-center">
                  <WaveButton to="/agence">
                    Démarrer un Projet
                  </WaveButton>
                  <Link
                    to="/portfolio"
                    className="px-8 py-4 border border-gray-600 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Voir nos Réalisations
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Value Proposition */}
            <div className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Nos Domaines d'Expertise</h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Une double expertise unique : création rapide de prototypes et conseil expert en IA pour des solutions innovantes et efficaces.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  {expertiseAreas.map((area, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 hover:bg-gray-800/70 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <div className="text-4xl mb-6">{area.icon}</div>
                      <h3 className="text-2xl font-bold mb-4">{area.title}</h3>
                      <p className="text-gray-300 mb-8 text-lg">{area.description}</p>
                      <ul className="space-y-4">
                        {area.points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-300">{point}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8">
                        <Link
                          to="/agence"
                          className="inline-block px-6 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg text-primary hover:from-primary/30 hover:to-secondary/30 transition-colors"
                        >
                          En savoir plus →
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Why Choose Us */}
                <div className="mt-20">
                  <h2 className="text-3xl font-bold mb-12 text-center">Notre Approche</h2>
                  <div className="grid md:grid-cols-3 gap-8">
                    <motion.div
                      className="bg-gray-800/30 p-6 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                    >
                      <h3 className="text-xl font-semibold mb-3">Rapidité & Qualité</h3>
                      <p className="text-gray-300">
                        Développement agile de MVP/POC de haute qualité, adaptés à vos besoins spécifiques.
                      </p>
                    </motion.div>
                    <motion.div
                      className="bg-gray-800/30 p-6 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    >
                      <h3 className="text-xl font-semibold mb-3">Expertise IA</h3>
                      <p className="text-gray-300">
                        Conseil stratégique et accompagnement personnalisé dans votre parcours d'adoption de l'IA.
                      </p>
                    </motion.div>
                    <motion.div
                      className="bg-gray-800/30 p-6 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <h3 className="text-xl font-semibold mb-3">Solution Sur Mesure</h3>
                      <p className="text-gray-300">
                        Chaque projet est unique. Nous adaptons notre approche à vos objectifs spécifiques.
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <h2 className="text-3xl font-bold mb-6">Prêt à Concrétiser Votre Projet ?</h2>
                    <p className="text-gray-300 mb-8 text-lg">
                      Que vous ayez besoin d'un MVP rapidement ou d'un conseil en IA, nous sommes là pour vous accompagner
                    </p>
                    <WaveButton to="/agence">
                      Démarrer un Projet
                    </WaveButton>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
