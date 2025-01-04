import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import placeholderImage from '../assets/images/placeholder.svg';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: 1,
    title: "Estimation Immobilière",
    description: "Application d'estimation immobilière basée sur les données gouvernementales françaises",
    tech: ["JavaScript", "Data Processing", "CSV"],
    image: placeholderImage,
    details: "Traitement de données massives à partir des fichiers CSV gouvernementaux pour fournir des estimations immobilières précises."
  },
  {
    id: 2,
    title: "Mosaic Generator",
    description: "Générateur d'images en mosaïque utilisant une bibliothèque locale",
    tech: ["Python", "Image Processing", "AI"],
    image: placeholderImage,
    details: "Création d'images en mosaïque à partir d'une bibliothèque d'images générée par IA avec un profil psychologique d'artiste."
  },
  {
    id: 3,
    title: "TeachMeAnything",
    description: "Plateforme éducative interactive avec génération de contenu par IA",
    tech: ["Python", "n8n", "AI"],
    image: placeholderImage,
    details: "Évolution d'un générateur de dialogues vers une plateforme complète d'apprentissage avec différentes 'classes' et modules."
  },
  {
    id: 4,
    title: "UseYourFridge",
    description: "Application de gestion de recettes et courses intelligente",
    tech: ["Angular", "Ionic", "TypeScript"],
    image: placeholderImage,
    details: "Application mobile pour optimiser la gestion des repas et courses, avec planification et partage en temps réel."
  },
  {
    id: 5,
    title: "Crypto Watch App",
    description: "Application Galaxy Watch pour le suivi des cryptomonnaies",
    tech: ["Java", "Kotlin", "Watch Faces"],
    image: placeholderImage,
    details: "Application pour montres Galaxy permettant de suivre les prix des cryptomonnaies avec graphiques et variations."
  },
  {
    id: 6,
    title: "TradeBroFamily",
    description: "Application web de trading avec visualisation avancée",
    tech: ["JavaScript", "TradingView API", "Technical Analysis"],
    image: placeholderImage,
    details: "Interface de trading avec graphiques détaillés et simulation de stratégies sur les tokens Binance."
  }
];

const Portfolio = () => {
  const cardsRef = useRef([]);

  useEffect(() => {
    cardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.fromTo(card,
          { 
            autoAlpha: 0,
            y: 50 
          },
          {
            duration: 0.8,
            autoAlpha: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=100",
              toggleActions: "play none none none"
            },
            delay: index * 0.1
          }
        );
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12"
        >
          Portfolio
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              ref={el => cardsRef.current[index] = el}
              className="project-card bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-48 bg-gray-700 relative overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-400">{project.details}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
