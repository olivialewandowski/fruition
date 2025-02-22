import React from 'react';
import FeatureCard from './FeatureCard';

type Feature = {
  title: string;
  description: string;
  number: string;
  alignment: 'left' | 'right';
  content: React.ReactNode;
};

const FeatureSection: React.FC = () => {
  const features: Feature[] = [
    {
      title: "Discover Research Projects",
      description: "Students are recommended active research opportunities tailored to their interests.",
      number: "1",
      alignment: "left" as const,
      content: (
        <div className="flex flex-col px-4 py-3.5 mx-auto mt-4 w-full text-xs text-black rounded-3xl border border-solid bg-zinc-100 border-zinc-300 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] max-md:mt-10 max-md:max-w-full">
          <div className="text-base font-medium max-md:mr-2.5">
            Genomic and Metabolomic Profiling of Host-Microbe Interactions in the Gut Microbiome
          </div>
          <div className="shrink-0 mt-1 h-0.5 border border-solid border-neutral-500" />
          <div className="mt-1.5 text-sm font-light max-md:mr-2.5">
            This project focuses on the genomics and metabolic analysis of gut microbial species to identify their specific roles in influencing host health and disease. It involves computational analysis of metagenomic data, functional pathway mapping, and experimental validation using microbiome culturing techniques.
          </div>
          <div className="flex gap-2 self-start mt-6 font-medium text-black whitespace-nowrap">
            <div className="px-2.5 py-1 rounded-3xl bg-purple-950 text-white">Microbiology</div>
            <div className="px-2.5 py-1 rounded-3xl bg-purple-950 text-white">Genomics</div>
          </div>
          <div className="flex gap-5 justify-between items-start mt-1 text-black max-md:mr-1">
            <div className="px-3 py-1 font-medium rounded-3xl bg-purple-950 text-white">Host Health and Disease</div>
            <button className="px-3 py-1 mt-1 font-semibold whitespace-nowrap rounded-3xl bg-purple-950 text-white">Apply</button>
          </div>
        </div>
      )
    },
    {
      title: "Connect with a Team",
      description: "Project mentors seamlessly track and incoming applications and select the best student-project fit.",
      number: "2",
      alignment: "right" as const,
      content: (
        <div className="flex flex-col self-stretch px-5 pt-4 pb-7 m-auto w-full text-black rounded-3xl border border-solid bg-zinc-100 border-zinc-300 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] max-md:mt-10 max-md:max-w-full max-sm:px-3 max-sm:pt-3 max-sm:pb-4">
          <div className="flex gap-5 justify-between w-full font-medium text-center max-md:mr-1.5 max-md:ml-0.5">
            <div className="text-xl max-sm:text-base">Student Applications</div>
            <button className="flex gap-2 px-2.5 py-1.5 text-xs bg-purple-200 rounded-3xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
              <span>See All</span>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/341dabaf31d00a29b0398a3327db585dffa125d97d39a38559755a5266d7de8b?placeholderIfAbsent=true&apiKey=52d31c01194349e6a8f1e6e4f44a4e8b"
                className="object-contain shrink-0 self-start aspect-[2.08] w-[25px]"
                alt="See all icon"
              />
            </button>
          </div>
          <div className="shrink-0 mt-4 h-0.5 border border-solid border-neutral-500" />
          <div className="flex gap-10 self-start mt-7 max-md:ml-2">
            <div className="flex flex-col px-3 py-4 rounded-2xl bg-zinc-300 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] max-sm:px-2 max-sm:py-2.5">
              <div className="self-start text-sm text-center">John Snow</div>
              <div className="mt-4 text-xs max-sm:mt-2 max-sm:text-xs">
                <span className="font-bold">Excerpt:</span> My passion for microbiome research stems from my fascination with how microorganisms influence human health. During my internship at a clinical microbiology lab...
              </div>
            </div>
            <div className="flex flex-col px-2.5 py-3.5 rounded-2xl bg-zinc-300 shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
              <div className="self-start text-sm text-center">Katie Lee</div>
              <div className="mt-4 text-xs">
                <span className="font-bold">Excerpt:</span> The relationship between gut microbiota and host health fascinates me because it holds immense potential for solving critical health challenges. I developed...
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Manage Research Projects",
      description: "Update project dashboards with onboarding materials, team details, and announcements all in one place.",
      number: "3",
      alignment: "left" as const,
      content: (
        <div className="flex flex-col p-2.5 mx-auto mt-1.5 w-full rounded-3xl border border-solid bg-zinc-100 border-zinc-300 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] max-md:p-2.5 max-md:mt-10 max-md:max-w-full">
          <div className="flex gap-4 font-medium text-center text-black max-md:gap-4">
            <div className="flex-auto text-base w-[274px] max-md:text-base">Upload Onboarding Materials</div>
            <button className="px-3 pt-1.5 pb-3 text-xs bg-purple-200 rounded-3xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">Add Materials +</button>
          </div>
          <div className="shrink-0 mt-4 h-0.5 border border-solid border-neutral-500 max-md:max-w-full" />
          <div className="self-center mt-2.5 max-w-full w-[300px]">
            <div className="flex gap-5">
              <div className="flex flex-col w-[33%]">
                <div className="flex flex-col grow text-sm font-light text-black whitespace-nowrap">
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/56379bf16f1d4b26178e92725ad1255a8626022f7ec5c1c3477e4cdafb915d6e?placeholderIfAbsent=true&apiKey=52d31c01194349e6a8f1e6e4f44a4e8b"
                    className="object-contain w-20 aspect-[0.76]"
                    alt="Article icon 1"
                  />
                  <div className="self-center mt-1">article</div>
                </div>
              </div>
              <div className="flex flex-col w-[33%]">
                <div className="flex flex-col grow text-sm font-light text-black whitespace-nowrap">
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/48f26f1b8b7a4d573e5cefcada80eca07ee8f268b3b93c13591a5eac1d076682?placeholderIfAbsent=true&apiKey=52d31c01194349e6a8f1e6e4f44a4e8b"
                    className="object-contain w-20 aspect-[0.74]"
                    alt="Article icon 2"
                  />
                  <div className="self-center mt-1">article</div>
                </div>
              </div>
              <div className="flex flex-col w-[33%]">
                <div className="flex flex-col grow text-sm font-light text-black whitespace-nowrap">
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/e00d43429437bb3372226f16493e2644a51ad64a7649db8076364e350937109f?placeholderIfAbsent=true&apiKey=52d31c01194349e6a8f1e6e4f44a4e8b"
                    className="object-contain w-20 aspect-[0.76]"
                    alt="Article icon 3"
                  />
                  <div className="self-center mt-1">article</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="mt-32 ml-3 text-6xl font-bold text-center text-[white] max-md:mt-10 max-md:max-w-full max-md:text-4xl">
        Streamline Your Research Journey
      </div>
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </>
  );
};

export default FeatureSection;