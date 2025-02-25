import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  return (
    <div className="flex overflow-hidden flex-col items-center pt-4 text-2xl text-center text-black whitespace-nowrap bg-purple-50 border border-solid border-neutral-200 pb-[506px] max-md:pb-24">
      <div className="text-4xl font-extrabold tracking-tighter text-black">
        fruition
      </div>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/a0ffbd24bcf8275aad9a29a351372268d870adcfecc59cefd8f0eb602d83ee81?placeholderIfAbsent=true&apiKey=2d8fdbce5bcb417799170ad0862fa2a8"
        className="object-contain mt-11 w-12 aspect-[1.45] max-md:mt-10"
        alt=""
      />
      <div className="mt-3.5">Inbox</div>
      <div className="flex flex-col items-center self-stretch px-1.5 mt-4">
        <Link href="/development/dashboard" className="w-full">
          <div className="flex flex-col self-stretch px-7 py-3 bg-violet-100 rounded-[30px] max-md:px-5">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e236698e6085e263953aa34568bd1bcfd846905c2c4d7355a9fd11d50351570f?placeholderIfAbsent=true&apiKey=2d8fdbce5bcb417799170ad0862fa2a8"
              className="object-contain self-center w-12 aspect-square"
              alt=""
            />
            <div className="self-start mt-1.5">Projects</div>
          </div>
        </Link>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/463e851a6990d3c1ce476265e639c5cf01661fdd32ae1ecaea5c7a92b7888523?placeholderIfAbsent=true&apiKey=2d8fdbce5bcb417799170ad0862fa2a8"
          className="object-contain mt-4 aspect-square w-[47px]"
          alt=""
        />
        <div className="mt-2.5">Forums</div>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/3aac59506df61091aecbb457176d9c9c753e2984e54ad5cb1dc3c30289e40b16?placeholderIfAbsent=true&apiKey=2d8fdbce5bcb417799170ad0862fa2a8"
          className="object-contain mt-6 aspect-[1.05] w-[59px]"
          alt=""
        />
        <div className="mt-1.5">Grants</div>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/66ee02818d0111ae12d7855224423d113a7b045510249abed25fb131f97160af?placeholderIfAbsent=true&apiKey=2d8fdbce5bcb417799170ad0862fa2a8"
          className="object-contain mt-7 aspect-[1.53] w-[58px]"
          alt=""
        />
        <div className="self-start mt-1.5 max-md:ml-1.5">Publications</div>
        <Link href="/development/connect" className="w-full flex flex-col items-center">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/94f9743ede2cbb4abf27b04e8ddd557190a0968fc7c7d188619a7bfd80869e0a?placeholderIfAbsent=true&apiKey=2d8fdbce5bcb417799170ad0862fa2a8"
            className="object-contain mt-7 aspect-square w-[55px]"
            alt=""
          />
          <div>Connect</div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;