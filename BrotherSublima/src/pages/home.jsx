// Este archivo está en: src/pages/Home.jsx (probablemente)
import React, { useEffect, useState } from "react";
import Header from "../components/Header"; // 👈 Aquí se usa el componente Header
import HeroSection from "../components/HeroSection";
import CategoriesSection from "../components/CategoriesSection";
import FeaturedProducts from "../components/FeaturedProducts";
import WhyChooseUs from "../components/WhyChooseUs";
import Footer from "../components/Footer";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("pos_user");
    if (token && user) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="font-sans text-gray-800">
      <Header isLoggedIn={isLoggedIn} />{" "}
      {/* ✅ Aquí se pasa la info al Header */}
      <main>
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
}
