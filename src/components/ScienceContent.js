import React from 'react';

const ScienceContent = () => {
  const scienceFacts = [
    {
      title: 'The Structure of Atoms',
      content: 'All matter is made up of atoms, which consist of a nucleus (containing protons and neutrons) and electrons orbiting around it. Despite being the building blocks of everything we see, atoms are mostly empty space!',
      icon: '⚛️'
    },
    {
      title: 'Quantum Mechanics',
      content: 'At the quantum level, particles can exist in multiple states simultaneously (superposition) and can be entangled with each other regardless of distance. This counterintuitive behavior is the foundation of quantum computing.',
      icon: '🔬'
    },
    {
      title: 'Dark Matter and Dark Energy',
      content: 'About 95% of the universe consists of dark matter and dark energy, which we cannot directly observe. Dark matter holds galaxies together, while dark energy is accelerating the expansion of the universe.',
      icon: '🌌'
    }
  ];

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-center mb-10 text-white">Fascinating Science Facts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {scienceFacts.map((fact, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-white/20">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-3">{fact.icon}</span>
              <h3 className="text-xl font-bold text-white">{fact.title}</h3>
            </div>
            <p className="text-gray-200">{fact.content}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-lg text-gray-200 max-w-3xl mx-auto">
          Explore our exhibitions to discover more about the wonders of science and how they shape our understanding of the universe.
        </p>
      </div>
    </div>
  );
};

export default ScienceContent; 