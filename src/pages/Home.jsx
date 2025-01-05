import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RippleBackground from '../components/effects/RippleBackground';
import WaveButton from '../components/buttons/WaveButton';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroRef = useRef(null);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, -150]), {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation du titre
      gsap.from('.hero-title span', {
        y: 100,
        opacity: 0,
        rotateX: -90,
        duration: 1.5,
        stagger: 0.1,
        ease: 'power4.out',
        clearProps: 'all'
      });

      // Animation du sous-titre
      gsap.from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        filter: 'blur(20px)',
        duration: 1.2,
        delay: 0.8,
        ease: 'power3.out',
        clearProps: 'all'
      });

      // Animation des boutons
      gsap.from('.hero-cta > *', {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        delay: 1.2,
        stagger: 0.2,
        ease: 'back.out(1.7)',
        clearProps: 'all'
      });

      // Animations parallax des sections
      gsap.utils.toArray('.expertise-card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top bottom-=100',
            end: 'top center',
            scrub: false,
            once: true,
          },
          y: 100,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          clearProps: 'transform'
        });
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const expertiseAreas = [
    {
      title: "Développement MVP/POC",
      description: "Création rapide et adaptative de prototypes et produits minimum viables, parfaitement alignés avec vos objectifs.",
      icon: "",
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
      icon: "",
      points: [
        "Conseil stratégique en IA",
        "Sélection des technologies adaptées",
        "Intégration et déploiement",
        "Formation et support"
      ]
    }
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen text-white overflow-x-hidden">
      <RippleBackground />
      <motion.div 
        className="relative z-10 bg-black/30 min-h-screen"
        style={{ y }}
      >
        <div ref={heroRef} className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="pt-32 pb-20">
              <h1 className="hero-title text-5xl md:text-7xl font-bold text-center mb-8">
                {['Transformez', 'vos', 'idées', 'en', 'réalité'].map((word, index) => (
                  <span key={index} className="inline-block mx-2">{word}</span>
                ))}
              </h1>
              <p className="hero-subtitle text-xl md:text-2xl text-gray-300 text-center max-w-3xl mx-auto mb-12">
                Développement rapide de MVP/POC et expertise en intelligence artificielle pour concrétiser vos projets
              </p>
              <div className="hero-cta flex justify-center gap-6">
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

            {/* Expertise Section */}
            <div className="py-20">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Nos Domaines d'Expertise</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Une double expertise unique : création rapide de prototypes et conseil expert en IA
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-12">
                {expertiseAreas.map((area, index) => (
                  <div
                    key={index}
                    className="expertise-card bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 hover:bg-gray-800/70 transition-all duration-500"
                  >
                    <motion.div
                      className="text-4xl mb-6"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {area.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">{area.title}</h3>
                    <p className="text-gray-300 mb-8 text-lg">{area.description}</p>
                    <ul className="space-y-4">
                      {area.points.map((point, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-300">{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <motion.div
              className="mt-20 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
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
      </motion.div>
    </div>
  );
};

export default Home;
