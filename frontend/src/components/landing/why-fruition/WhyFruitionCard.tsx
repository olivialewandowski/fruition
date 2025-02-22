import React from 'react';

interface WhyFruitionCardProps {
  title: string;
  description: string;
}

const WhyFruitionCard: React.FC<WhyFruitionCardProps> = ({ title, description }) => {
  const [firstSentence, ...restSentences] = description.split('.');
  const remainingSentences = restSentences.join('.').trim();

  return (
    <div className="flex flex-col w-[33%] max-md:ml-0 max-md:w-full max-md:scale-90 max-sm:scale-75">
      <div 
        className="flex flex-col grow px-6 py-8 text-black rounded-2xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] font-montserrat h-full"
        style={{
          background: 'linear-gradient(to bottom, #FFFFFF 0%, #C494FF 100%)'
        }}
      >
        <div className="text-4xl font-extrabold h-16 flex items-center">{title}</div>
        <div className="mt-5 w-full border border-black border-solid" />
        <div className="mt-5 text-2xl flex-grow">
          <p className="font-bold">{firstSentence}.</p>
          {remainingSentences && <p className="mt-2">{remainingSentences}</p>}
        </div>
      </div>
    </div>
  );
};

export default WhyFruitionCard;