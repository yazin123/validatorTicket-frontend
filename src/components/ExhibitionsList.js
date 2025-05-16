import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ExhibitionCard from './ExhibitionCard';
import exhibitionService from '../lib/services/exhibition.service';

const ExhibitionsList = () => {
  const { data: exhibitiondata, isLoading, error } = useQuery({
    queryKey: ['exhibitions'],
    queryFn: exhibitionService.getExhibitions,
  });
  const exhibitions = exhibitiondata?.data;

  if (isLoading) {
    return (
      <div className="grid place-items-center py-10">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading exhibitions. Please try again later.</p>
      </div>
    );
  }

  if (!exhibitions || exhibitions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No exhibitions found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exhibitions?.map((exhibition) => (
        <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
      ))}
    </div>
  );
};

export default ExhibitionsList; 