import React from "react";
import Image from "next/image";

export const Features: React.FC = () => {
  return (
    <section className="mb-24 mt-36 px-4">
      <h2 className="mb-16 text-4xl text-center text-white max-sm:text-3xl">
        What
        <span className="italic text-white font-montserrat-alternates text-[40px]">&nbsp;fruition</span>
        &nbsp;does:
      </h2>
      <div className="flex gap-8 mx-auto my-0 max-w-[1028px] max-lg:flex-col max-lg:items-center max-lg:px-4">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/1f276206b7115161830aa4edd91da74d402666e3"
          className="rounded-3xl h-[375px] w-[475px] max-lg:w-[400px] max-lg:h-[315px] max-sm:w-[85%] max-sm:h-auto"
          alt="Student researching"
        />
        <div className="flex flex-col gap-11 justify-center w-full max-lg:max-w-full max-lg:mt-8">
          <p className="text-2xl text-white max-sm:text-xl px-2 flex items-start break-words w-full">
            <span className="inline-block w-2 h-2 bg-purple-300 rounded-full mt-3 mr-3 flex-shrink-0"></span>
            <span className="pr-4 min-w-0 w-full">
              <span className="inline-block w-full">Centralizes</span>
              <strong>&nbsp;active</strong>
              <span>&nbsp;research positions in one place</span>
            </span>
          </p>
          <p className="text-2xl text-white max-sm:text-xl px-2 flex items-start break-words w-full">
            <span className="inline-block w-2 h-2 bg-purple-300 rounded-full mt-3 mr-3 flex-shrink-0"></span>
            <span className="pr-4 min-w-0 w-full">
              <span className="inline-block w-full">Recommends positions</span>
              <strong>&nbsp;tailored&nbsp;</strong>
              <span>to your skill and interests</span>
            </span>
          </p>
          <p className="text-2xl text-white max-sm:text-xl px-2 flex items-start break-words w-full">
            <span className="inline-block w-2 h-2 bg-purple-300 rounded-full mt-3 mr-3 flex-shrink-0"></span>
            <span className="pr-4 min-w-0 w-full">
              <strong className="inline-block w-full">Ensures&nbsp;</strong>
              <span>applications reach faculty 100% of the time</span>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};