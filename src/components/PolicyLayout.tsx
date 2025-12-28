import React, { useState } from 'react';
import { MdExpandMore } from 'react-icons/md';

interface Section {
  title: string;
  content: string | React.ReactNode;
  id?: string;
}

interface PolicyLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  introduction: string | React.ReactNode;
  sections: Section[];
  footerNote?: string | React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

const PolicyLayout: React.FC<PolicyLayoutProps> = ({
  title,
  subtitle,
  lastUpdated,
  introduction,
  sections,
  footerNote,
  icon: Icon,
}) => {
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setActiveSection(activeSection === index ? null : index);
  };

  const scrollToSection = (index: number) => {
    setActiveSection(index);
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-cyan-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {Icon && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <Icon className="w-8 h-8" />
              </div>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">{title}</h1>
            {subtitle && <p className="text-xl md:text-2xl text-cyan-100 mb-4">{subtitle}</p>}
            <p className="text-sm text-cyan-200">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Table of Contents - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 bg-gradient-to-br from-gray-50 to-cyan-50 rounded-2xl p-6 shadow-lg">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Table of Contents</h2>
                <nav className="space-y-2">
                  {sections.map((section, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToSection(index)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                        activeSection === index
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Introduction */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-cyan-600">
                <div className="text-lg text-gray-700 leading-relaxed">
                  {introduction}
                </div>
              </div>

              {/* Sections */}
              {sections.map((section, index) => (
                <div
                  key={index}
                  id={`section-${index}`}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-left">
                      {section.title}
                    </h2>
                    <MdExpandMore
                      className={`w-6 h-6 text-cyan-600 flex-shrink-0 ml-4 transition-transform ${
                        activeSection === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      activeSection === index
                        ? 'max-h-[2000px] opacity-100'
                        : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
                  >
                    <div className="px-6 pb-6">
                      <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Footer Note */}
              {footerNote && (
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border-l-4 border-cyan-600 shadow-lg">
                  <div className="text-gray-700 leading-relaxed">
                    {footerNote}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyLayout;
