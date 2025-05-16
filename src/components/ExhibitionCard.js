import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const ExhibitionCard = ({ exhibition }) => {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/exhibitions/${exhibition.id}`);
  };
  
  return (
    <div 
      onClick={handleClick}
      className="bg-black backdrop-blur-md rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/20 hover:bg-black/80"
    >
      <div className="relative h-48 w-full">
        <Image
          src={exhibition.imageUrl || '/images/exhibition-placeholder.jpg'}
          alt={exhibition.title}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-1">{exhibition.title}</h3>
        
        <div className="flex items-center text-sm text-gray-300 mb-2">
          <span className="inline-block bg-indigo-900 text-indigo-200 text-xs px-2 py-1 rounded-full">
            {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
          </span>
        </div>
        
        <p className="text-gray-300 text-sm line-clamp-2">
          {exhibition.description}
        </p>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="font-medium text-indigo-400">
            {exhibition.price ? `$${exhibition.price.toFixed(2)}` : 'Free'}
          </span>
          
          <div className="text-xs text-gray-300">
            {exhibition.location}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionCard; 