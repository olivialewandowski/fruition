'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNavigation from '@/components/dashboard/TopNavigation';
import ProjectSection from '@/components/dashboard/ProjectSection';

interface UserData {
  role: string;
  firstName: string;
  lastName: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const yourProjects = [
    {
      title: "Predicting Housing Prices Using Advanced Machine Learning Models",
      description: "This project explores the application of machine learning techniques to predict housing prices based on features such as location, square footage, and neighborhood amenities. The project involves cleaning and preprocessing real-world datasets, implementing and fine-tuning algorithms such as gradient boosting and neural networks, and comparing their performance metrics. A key focus is on interpretability, with the use of SHAP values to provide insights into the factors influencing predictions."
    }
  ];

  const facultyProjects = [
    {
      title: "Modeling Climate Change Impact on Regional Crop Yields",
      description: "This project examines how climate change variables—temperature, precipitation, and CO₂ levels—affect crop yields. Using time-series analysis and geospatial modeling, the project incorporates large-scale agricultural datasets and satellite imagery. Responsibilities include pre-processing geospatial data, training predictive models using Python and TensorFlow, and collaborating on drafting research findings for publication."
    }
  ];

  const peerProjects = [
    {
      title: "Optimizing Traffic Flow with Reinforcement Learning Algorithms",
      description: "This advanced research project investigates the use of reinforcement learning to optimize traffic light timings in urban areas. The student assists in developing simulation environments using SUMO (Simulation of Urban Mobility) and implementing algorithms such as deep Q-networks (DQN) to minimize congestion. Tasks include debugging RL models, analyzing performance metrics, and conducting sensitivity analyses to evaluate the system's robustness under varying traffic conditions."
    }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        if (!auth.currentUser) {
          router.push('/development/login');
          return;
        }

        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/development/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-yellow-100 p-4 text-yellow-800 text-center">
        Development Environment
      </div>
      <div className="flex overflow-hidden bg-white border border-solid border-neutral-200">
        <Sidebar />
        <div className="flex flex-col grow shrink-0 self-start basis-0 w-fit max-md:max-w-full">
          <TopNavigation />
          <div className="flex flex-col items-start px-5 mt-6 w-full max-md:max-w-full">
            <div className="flex flex-wrap gap-5 justify-between self-stretch mr-6 ml-3.5 w-full font-bold text-center max-w-[1050px] max-md:mr-2.5 max-md:max-w-full">
              <div className="my-auto text-3xl text-black">Your Projects</div>
              <button className="px-9 py-2.5 text-3xl text-white bg-violet-800 rounded-[30px] max-md:px-5">
                New Project +
              </button>
            </div>
            {userData?.role === 'student' ? (
              <>
                <ProjectSection title="Your Projects" projects={yourProjects} />
                <ProjectSection title="Faculty Projects" projects={facultyProjects} />
                <ProjectSection title="Peer Projects" projects={peerProjects} />
              </>
            ) : (
              <>
                <ProjectSection title="Your Projects" projects={facultyProjects} />
                <ProjectSection title="Student Projects" projects={yourProjects} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}