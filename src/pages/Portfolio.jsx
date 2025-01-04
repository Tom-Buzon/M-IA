import { motion } from 'framer-motion';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

const projects = [
  {
    id: 1,
    title: "IA de Recommandation",
    description: "Système de recommandation basé sur l'IA pour une plateforme e-commerce",
    category: "Intelligence Artificielle",
    image: "/project1.jpg",
    technologies: ["Python", "TensorFlow", "React"],
    duration: "6 semaines",
    results: ["Augmentation des ventes de 25%", "Amélioration de l'engagement utilisateur"]
  },
  {
    id: 2,
    title: "MVP Application Mobile",
    description: "Application de gestion de tâches avec fonctionnalités IA",
    category: "MVP/POC",
    image: "/project2.jpg",
    technologies: ["React Native", "Node.js", "OpenAI"],
    duration: "4 semaines",
    results: ["Validation du concept", "Levée de fonds réussie"]
  },
  {
    id: 3,
    title: "Estimation Immobilière",
    description: "Application d'estimation immobilière basée sur les données gouvernementales françaises",
    category: "Intelligence Artificielle",
    image: "/project3.jpg",
    technologies: ["JavaScript", "Data Processing", "CSV"],
    duration: "8 semaines",
    results: ["Augmentation de la précision des estimations de 30%", "Réduction des coûts de 20%"]
  },
  {
    id: 4,
    title: "Mosaic Generator",
    description: "Générateur d'images en mosaïque utilisant une bibliothèque locale",
    category: "MVP/POC",
    image: "/project4.jpg",
    technologies: ["Python", "Image Processing", "AI"],
    duration: "6 semaines",
    results: ["Création de mosaïques de haute qualité", "Amélioration de la vitesse de traitement"]
  },
  {
    id: 5,
    title: "TeachMeAnything",
    description: "Plateforme éducative interactive avec génération de contenu par IA",
    category: "Intelligence Artificielle",
    image: "/project5.jpg",
    technologies: ["Python", "n8n", "AI"],
    duration: "12 semaines",
    results: ["Augmentation de l'engagement des étudiants de 40%", "Amélioration de la qualité du contenu"]
  },
  {
    id: 6,
    title: "UseYourFridge",
    description: "Application de gestion de recettes et courses intelligente",
    category: "MVP/POC",
    image: "/project6.jpg",
    technologies: ["Angular", "Ionic", "TypeScript"],
    duration: "8 semaines",
    results: ["Augmentation de la satisfaction des utilisateurs de 30%", "Réduction des coûts de 15%"]
  },
  {
    id: 7,
    title: "Crypto Watch App",
    description: "Application Galaxy Watch pour le suivi des cryptomonnaies",
    category: "MVP/POC",
    image: "/project7.jpg",
    technologies: ["Java", "Kotlin", "Watch Faces"],
    duration: "6 semaines",
    results: ["Création d'une application de suivi des cryptomonnaies", "Amélioration de la vitesse de mise à jour"]
  },
  {
    id: 8,
    title: "TradeBroFamily",
    description: "Application web de trading avec visualisation avancée",
    category: "Intelligence Artificielle",
    image: "/project8.jpg",
    technologies: ["JavaScript", "TradingView API", "Technical Analysis"],
    duration: "12 semaines",
    results: ["Augmentation de la précision des prévisions de 25%", "Amélioration de la vitesse de traitement"]
  }
];

const Portfolio = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState('all');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    show: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const projectDetails = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.3
      }
    }
  };

  const filteredProjects = projects.filter(project => 
    filter === 'all' || project.category.toLowerCase() === filter
  );

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6">Nos Réalisations</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Découvrez nos projets de MVP et d'intégration d'IA
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-4 mb-12"
        >
          {['all', 'mvp/poc', 'intelligence artificielle'].map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(category)}
              className={`px-6 py-2 rounded-full ${
                filter === category
                  ? 'bg-gradient-to-r from-primary to-secondary'
                  : 'bg-gray-800 hover:bg-gray-700'
              } transition-colors`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          ref={ref}
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={item}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="group relative bg-gray-800 rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="aspect-video bg-gray-700">
                {/* Image du projet */}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                    {project.category}
                  </span>
                  <span className="text-gray-400 text-sm">{project.duration}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700/50 rounded text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8"
                initial={false}
                whileHover={{ opacity: 1 }}
              >
                <motion.button
                  className="px-6 py-2 bg-primary rounded-full font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Voir les détails
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal de détails du projet */}
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              variants={projectDetails}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="aspect-video bg-gray-700 rounded-lg mb-6">
                {/* Image du projet */}
              </div>
              <h2 className="text-3xl font-bold mb-4">{selectedProject.title}</h2>
              <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                  {selectedProject.category}
                </span>
                <span className="text-gray-400">{selectedProject.duration}</span>
              </div>
              <p className="text-gray-300 mb-6">{selectedProject.description}</p>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Technologies utilisées</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Résultats</h3>
                <ul className="space-y-2">
                  {selectedProject.results.map((result, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-gray-300">{result}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <motion.button
                className="mt-8 px-6 py-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedProject(null)}
              >
                Fermer
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
