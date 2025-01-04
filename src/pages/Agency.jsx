import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    id: 1,
    title: "MVP / POC",
    description: "Transformez rapidement votre idée en prototype fonctionnel",
    icon: "🚀",
    featured: true,
    steps: [
      "Analyse et cadrage du projet",
      "Design UX/UI et maquettes / integration de votre maquette",
      "Développement du prototype",
      "Tests et validation",
      "Déploiement et feedback"
    ],
    benefits: [
      "Validation rapide de votre concept",
      "Réduction des risques et coûts",
      "Feedback utilisateur précoce",
      "Itérations agiles"
    ],
    timeframe: "1-4 semaines",
    priceRange: "500€ - 4000€ / nombre de features",
    deliverables: [
      "Prototype fonctionnel",
      "Documentation technique",
      "Guide d'utilisation",
      "Code source",
      "Rapport de tests"
    ]
  },
  {
    id: 2,
    title: "Conseil",
    description: "Expertise technique et stratégique pour vos projets",
    icon: "💡",
    steps: [
      "Audit de l'existant",
      "Analyse des besoins",
      "Recommandations techniques",
      "Plan d'action",
      "Suivi et ajustements"
    ],
    benefits: [
      "Expertise pointue",
      "Vision objective",
      "Optimisation des coûts",
      "Stratégie sur mesure"
    ],
    timeframe: "1-4 semaines",
    priceRange: "150€/heure",
    deliverables: [
      "Rapport d'audit",
      "Recommandations détaillées",
      "Plan d'action",
      "Support stratégique"
    ]
  },
  {
    id: 3,
    title: "Chatbot Personnalisé",
    description: "Création de chatbots intelligents adaptés à vos besoins",
    icon: "🤖",
    comingSoon: true,
    steps: [
      "Définition des use-cases",
      "Sélection du modèle d'IA",
      "Personnalisation du modèle",
      "Intégration technique",
      "Tests et optimisation"
    ],
    benefits: [
      "Automatisation du support",
      "Disponibilité 24/7",
      "Personnalisation avancée",
      "Évolutivité"
    ],
    timeframe: "1-2 semaines",
    priceRange: "500€ - 2000€",
    deliverables: [
      "Chatbot opérationnel",
      "Interface d'administration",
      "Documentation d'utilisation",
      "Support technique"
    ]
  },
  {
    id: 4,
    title: "SEO",
    description: "Optimisation de votre visibilité en ligne",
    icon: "📈",
    steps: [
      "Audit SEO complet",
      "Analyse des mots-clés",
      "Optimisation technique",
      "Création de contenu",
      "Suivi des performances"
    ],
    benefits: [
      "Meilleur classement Google",
      "Trafic organique qualifié",
      "ROI mesurable",
      "Visibilité durable"
    ],
    timeframe: "1-2 mois",
    priceRange: "800€ - 2500€/mois",
    deliverables: [
      "Rapport d'audit SEO",
      "Plan d'optimisation",
      "Rapports mensuels",
      "Recommandations continues"
    ]
  },
  {
    id: 5,
    title: "Application Complète",
    description: "Développement complet de votre application de A à Z",
    icon: "💻",
    steps: [
      "Analyse approfondie des besoins",
      "Architecture technique",
      "Design UX/UI complet",
      "Développement full-stack",
      "Tests et optimisation",
      "Déploiement et maintenance"
    ],
    benefits: [
      "Solution sur mesure",
      "Architecture évolutive",
      "Support technique complet",
      "Formation utilisateur"
    ],
    timeframe: "3-6 mois",
    priceRange: "10k€ - 50k€",
    deliverables: [
      "Application complète",
      "Documentation détaillée",
      "Formation",
      "Support technique",
      "Plan de maintenance"
    ]
  },
  {
    id: 6,
    title: "Data Intelligence",
    description: "Exploitation et analyse avancée de vos données",
    icon: "🧠",
    comingSoon: true,
    steps: [
      "Audit des données",
      "Nettoyage et structuration",
      "Modélisation",
      "Visualisation",
      "Prédictions et insights"
    ],
    benefits: [
      "Décisions basées sur les données",
      "Automatisation des analyses",
      "Tableaux de bord personnalisés",
      "Prédictions fiables"
    ],
    timeframe: "2-4 mois",
    priceRange: "10k€ - 30k€",
    deliverables: [
      "Pipeline de données",
      "Dashboards",
      "Modèles prédictifs",
      "Documentation",
      "Formation équipe"
    ]
  }
];

const Agency = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    need: '',
    projectType: '',
    budget: '',
    timeline: '',
    description: '',
    features: [],
    technical: {
      platform: '',
      integration: [],
      security: []
    }
  });
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  const handleServiceSelect = (service) => {
    if (!service.comingSoon) {
      setSelectedService(service);
      setStep(2);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const renderServiceCard = (service) => (
    <motion.div
      key={service.id}
      className={`${
        service.featured 
          ? 'col-span-full bg-gradient-to-r from-primary/20 to-secondary/20' 
          : service.comingSoon
          ? 'bg-gray-800/30 backdrop-blur-sm'
          : 'bg-gray-800/50'
      } backdrop-blur-sm p-8 rounded-xl cursor-pointer hover:bg-gray-700/50 transition-all relative`}
      whileHover={{ scale: service.comingSoon ? 1 : 1.02 }}
      onClick={() => handleServiceSelect(service)}
    >
      {service.comingSoon && (
        <motion.div 
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-xl flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold text-xl shadow-lg"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Coming Soon
          </motion.div>
        </motion.div>
      )}
      <div className="flex items-start gap-6">
        <div className="text-4xl">{service.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold">{service.title}</h3>
            {service.featured && (
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                Service Recommandé
              </span>
            )}
          </div>
          <p className="text-gray-300 mt-2 mb-6">{service.description}</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-lg">Processus</h4>
              <ul className="space-y-2">
                {service.steps.map((step, index) => (
                  <li key={index} className="flex items-center space-x-2 text-gray-300">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-lg">Bénéfices</h4>
              <ul className="space-y-2">
                {service.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-2 text-gray-300">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Délai Typique</h4>
              <p className="text-gray-300">{service.timeframe}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Budget Indicatif</h4>
              <p className="text-gray-300">{service.priceRange}</p>
            </div>
          </div>

          {service.featured && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-lg">Livrables</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {service.deliverables.map((deliverable, index) => (
                  <div key={index} className="bg-gray-900/50 p-3 rounded-lg text-gray-300">
                    {deliverable}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-8"
          >
            {services.map((service) => renderServiceCard(service))}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-3xl mx-auto"
          >
            <form onSubmit={handleFormSubmit} className="space-y-8">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Informations Générales</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Plateforme</label>
                    <select
                      value={formData.technical.platform}
                      onChange={(e) => setFormData({
                        ...formData,
                        technical: { ...formData.technical, platform: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white py-2 px-3"
                      required
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="web">Application Web</option>
                      <option value="mobile">Application Mobile</option>
                      <option value="desktop">Application Desktop</option>
                      <option value="all">Multi-plateforme</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Budget</label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white py-2 px-3"
                      required
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="small">{"< 10k€"}</option>
                      <option value="medium">10k€ - 30k€</option>
                      <option value="large">{"> 30k€"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Délai Souhaité</label>
                    <select
                      value={formData.timeline}
                      onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white py-2 px-3"
                      required
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="urgent">{"< 1 mois"}</option>
                      <option value="normal">1-3 mois</option>
                      <option value="flexible">{"> 3 mois"}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Description du Projet</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Description Détaillée</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white py-2 px-3"
                      placeholder="Décrivez votre projet, ses objectifs, et vos attentes..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Fonctionnalités Clés</label>
                    <div className="space-y-2">
                      {['Authentication', 'API Integration', 'Real-time Updates', 'Data Analytics', 'Payment Processing'].map((feature) => (
                        <label key={feature} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.features.includes(feature)}
                            onChange={(e) => {
                              const updatedFeatures = e.target.checked
                                ? [...formData.features, feature]
                                : formData.features.filter(f => f !== feature);
                              setFormData({...formData, features: updatedFeatures});
                            }}
                            className="rounded bg-gray-700 border-gray-600 text-primary focus:ring-primary"
                          />
                          <span className="text-gray-300">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                >
                  Générer une Proposition
                </button>
              </div>
            </form>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-6">Proposition Personnalisée</h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-6">
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold mb-3">Étapes du Projet</h4>
                    <ul className="space-y-2">
                      {selectedService?.steps.map((step, index) => (
                        <li key={index} className="flex items-center space-x-2 text-gray-300">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold mb-3">Livrables</h4>
                    <ul className="space-y-2">
                      {selectedService?.deliverables.map((deliverable, index) => (
                        <li key={index} className="flex items-center space-x-2 text-gray-300">
                          <span className="text-primary">✓</span>
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold mb-3">Estimation</h4>
                    <div className="space-y-2 text-gray-300">
                      <p>
                        <span className="font-medium">Durée estimée:</span>{' '}
                        {formData.timeline === 'urgent' ? '2-4 semaines' : 
                         formData.timeline === 'normal' ? '6-12 semaines' : 
                         '12+ semaines'}
                      </p>
                      <p>
                        <span className="font-medium">Budget indicatif:</span>{' '}
                        {selectedService?.priceRange}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold mb-3">Fonctionnalités Sélectionnées</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-gray-300">
                          <span className="text-secondary">•</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={() => window.location.href = "mailto:contact@m-ia.com?subject=Nouveau Projet"}
                  className="px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors w-full md:w-auto"
                >
                  Planifier un Appel de Consultation
                </button>
                <p className="text-gray-400 text-sm">
                  Nous vous répondrons dans les 24 heures pour organiser un appel et discuter des détails
                </p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Agence</h1>
          <p className="text-xl text-gray-300">
            {step === 1 ? "Choisissez votre service" :
             step === 2 ? "Détaillez votre projet" :
             "Votre proposition personnalisée"}
          </p>
        </motion.div>

        {renderStep()}
      </div>
    </div>
  );
};

export default Agency;
