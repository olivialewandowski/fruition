// FeatureCard.tsx
import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  number: string;
  alignment: 'left' | 'right';
  content: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, number, alignment, content }) => {
  return (
    <div className="overflow-hidden px-16 py-24 mt-16 max-w-full bg-white rounded-3xl w-[1173px] max-md:px-5 max-md:mt-10 max-sm:px-5 max-sm:py-8 max-sm:mt-5 transform scale-100 max-md:scale-90 max-sm:scale-75">
      <div className="flex gap-5 max-md:flex-col">
        <div className={`flex flex-col w-6/12 max-md:ml-0 max-md:w-full ${alignment === 'right' ? 'order-2' : ''}`}>
          <div className="flex flex-col max-md:mt-10 max-md:max-w-full">
            <div className="flex flex-col">
              <div 
                className={`${alignment === 'left' ? 'self-start ml-0' : 'self-end mr-0'} flex items-center justify-center text-5xl font-bold text-white w-16 h-16 mb-4 rounded-full max-md:text-4xl`}
                style={{
                  background: 'radial-gradient(circle at center, #5D00AE 0%, #260048 100%)'
                }}
              >
                {number}
              </div>
              <div className={`text-3xl ${alignment === 'left' ? 'text-left' : 'text-right'} text-black font-montserrat`}>
                <span className="text-4xl font-extrabold">{title.split(' ')[0]}</span>{' '}
                <span className="font-semibold">{title.split(' ').slice(1).join(' ')}</span>
                <br />
                <br />
                <span className="text-3xl font-light">{description}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={`flex flex-col ml-5 w-6/12 max-md:ml-0 max-md:w-full ${alignment === 'right' ? 'order-1' : ''} justify-center transform-none`}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;