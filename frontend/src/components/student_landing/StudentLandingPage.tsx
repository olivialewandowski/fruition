"use client";

import React, { useState } from "react";
import Header from "@/components/landing/Header";
import StudentHeroSection from "./StudentHeroSection";
import { Features } from "./Features";
import { Benefits } from "./Benefits";

const StudentLandingPage: React.FC = () => {
  const [universityEmail, setUniversityEmail] = useState("");

  const updateUniversityEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUniversityEmail(event.target.value);
  };

  return (
    <div 
      className="flex overflow-hidden flex-col items-center pt-24 pb-9 pr-4 font-montserrat text-white max-sm:py-5 max-sm:pr-2.5"
      style={{
        background: "radial-gradient(circle at center, #5D00AE 0%, #260048 100%)"
      }}
    >
      <Header />
      <StudentHeroSection universityEmail={universityEmail} updateUniversityEmail={updateUniversityEmail} />
      <Features />
      <Benefits />
      <div className="mt-40 mb-8 text-2xl text-center text-white font-montserrat max-md:mt-10 max-md:max-w-full">
        ©2025 Fruition. All rights reserved.
      </div>
    </div>
  );
};

export default StudentLandingPage;