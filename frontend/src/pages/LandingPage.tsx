import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import Screenshots from '../components/Screenshots';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <About />
      <Testimonials />
      <Screenshots />
      <Contact />
      <Footer />
    </div>
  );
};

export default LandingPage;