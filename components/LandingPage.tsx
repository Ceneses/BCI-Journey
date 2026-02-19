import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, HeroSection, SocialProof, FeaturesSection, BCILabShowcase, FAQSection, CTASection } from './landing';

const LandingPage: React.FC = () => {
   const navigate = useNavigate();

   return (
      <div className="min-h-screen bg-cyber-black text-white relative overflow-hidden flex flex-col font-sans">
         {/* Background effects */}
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 fixed"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-black/80 to-cyber-black fixed"></div>
         <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none fixed" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

         <Navbar navigate={navigate} />
         <HeroSection navigate={navigate} />
         <SocialProof />
         <FeaturesSection navigate={navigate} />
         <BCILabShowcase navigate={navigate} />
         <FAQSection />
         <CTASection navigate={navigate} />
      </div>
   );
};
export default LandingPage;