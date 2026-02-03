// server/seed-comprehensive-data.js
import { db } from './config/firebase.js';

/**
 * Seed comprehensive university profiles
 */
const seedUniversities = async () => {
  const universities = [
    {
      basicInfo: {
        name: 'Harvard University',
        country: 'United States',
        city: 'Cambridge',
        address: 'Massachusetts Hall, Cambridge, MA 02138, United States',
        website: 'https://www.harvard.edu',
        phone: '+1-617-495-1000',
        email: 'info@harvard.edu'
      },
      academics: {
        ranking: { world: 5, national: 2, source: 'QS World University Rankings', year: 2024 },
        accreditations: ['NEASC', 'AACSB', 'ABA'],
        totalStudents: 23000,
        internationalStudents: 5500,
        facultyCount: 2400,
        studentFacultyRatio: '7:1'
      },
      facilities: {
        campusSize: '5450 acres',
        library: true,
        sportsFacilities: true,
        dormitories: true,
        diningFacilities: true,
        medicalCenter: true,
        wifiCampus: true,
        description: 'Harvard University is renowned for its academic excellence and rich history.'
      },
      programs: {
        undergraduate: ['Computer Science', 'Business', 'Engineering', 'Law', 'Medicine'],
        postgraduate: ['MBA', 'PhD in Computer Science', 'Master of Public Health'],
        phd: ['Computer Science', 'Business Administration', 'Engineering'],
        totalPrograms: 150
      },
      fees: {
        undergraduate: { min: 55000, max: 60000, currency: 'USD' },
        postgraduate: { min: 45000, max: 80000, currency: 'USD' },
        applicationFee: 75,
        currency: 'USD'
      },
      admission: {
        requirements: [
          'High school diploma or equivalent',
          'SAT/ACT scores',
          'TOEFL/IELTS for international students',
          'Letters of recommendation',
          'Personal statement'
        ],
        englishProficiency: ['TOEFL: 100+', 'IELTS: 7.0+'],
        deadlines: { fall: 'January 1', spring: 'November 1', summer: 'March 1' },
        applicationProcess: 'Common Application or Coalition Application'
      },
      partnerships: {
        isPartnered: true,
        agreementType: 'Strategic Partnership',
        commissionRate: 0.15,
        specialBenefits: ['Priority admission', 'Scholarship opportunities', 'Dedicated support'],
        contactPerson: 'Dr. Sarah Johnson'
      },
      media: {
        logo: 'https://example.com/harvard-logo.png',
        bannerImage: 'https://example.com/harvard-banner.jpg',
        gallery: ['https://example.com/harvard-1.jpg', 'https://example.com/harvard-2.jpg'],
        virtualTour: 'https://example.com/harvard-tour',
        videos: ['https://example.com/harvard-video.mp4']
      },
      settings: {
        isActive: true,
        isFeatured: true,
        featuredPriority: 1,
        tags: ['Ivy League', 'Research University', 'Top Ranked'],
        targetCountries: ['China', 'India', 'South Korea', 'Brazil'],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    },
    {
      basicInfo: {
        name: 'University of Toronto',
        country: 'Canada',
        city: 'Toronto',
        address: '27 King\'s College Cir, Toronto, ON M5S, Canada',
        website: 'https://www.utoronto.ca',
        phone: '+1-416-978-2011',
        email: 'ask@utoronto.ca'
      },
      academics: {
        ranking: { world: 21, national: 1, source: 'QS World University Rankings', year: 2024 },
        accreditations: ['AACSB', 'ABET', 'CACREP'],
        totalStudents: 95000,
        internationalStudents: 20000,
        facultyCount: 4800,
        studentFacultyRatio: '20:1'
      },
      facilities: {
        campusSize: '200 acres',
        library: true,
        sportsFacilities: true,
        dormitories: true,
        diningFacilities: true,
        medicalCenter: true,
        wifiCampus: true,
        description: 'Canada\'s top university with world-class research and teaching excellence.'
      },
      programs: {
        undergraduate: ['Engineering', 'Business', 'Computer Science', 'Life Sciences'],
        postgraduate: ['Master of Engineering', 'MBA', 'PhD Programs'],
        phd: ['Engineering', 'Computer Science', 'Business', 'Medicine'],
        totalPrograms: 700
      },
      fees: {
        undergraduate: { min: 35000, max: 45000, currency: 'CAD' },
        postgraduate: { min: 25000, max: 55000, currency: 'CAD' },
        applicationFee: 90,
        currency: 'CAD'
      },
      admission: {
        requirements: [
          'High school diploma',
          'Academic transcripts',
          'English proficiency test',
          'Personal statement',
          'Reference letters'
        ],
        englishProficiency: ['TOEFL: 93+', 'IELTS: 7.0+'],
        deadlines: { fall: 'January 15', spring: 'September 15', summer: 'May 15' },
        applicationProcess: 'Ontario Universities Application Centre'
      },
      partnerships: {
        isPartnered: true,
        agreementType: 'Study Abroad Partnership',
        commissionRate: 0.12,
        specialBenefits: ['Guaranteed admission pathway', 'Credit transfer agreements'],
        contactPerson: 'Prof. Michael Chen'
      },
      media: {
        logo: 'https://example.com/utoronto-logo.png',
        bannerImage: 'https://example.com/utoronto-banner.jpg',
        gallery: ['https://example.com/utoronto-1.jpg', 'https://example.com/utoronto-2.jpg'],
        virtualTour: 'https://example.com/utoronto-tour',
        videos: ['https://example.com/utoronto-video.mp4']
      },
      settings: {
        isActive: true,
        isFeatured: true,
        featuredPriority: 2,
        tags: ['Public University', 'Research Intensive', 'Diverse Community'],
        targetCountries: ['India', 'China', 'Nigeria', 'Pakistan'],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    }
  ];

  console.log('🌱 Seeding comprehensive university profiles...');
  for (const university of universities) {
    try {
      const docRef = await db.collection('universities').add(university);
      console.log(`✅ Created university: ${university.basicInfo.name} (${docRef.id})`);
    } catch (error) {
      console.error(`❌ Failed to create university ${university.basicInfo.name}:`, error.message);
    }
  }
};

/**
 * Seed comprehensive program profiles
 */
const seedPrograms = async () => {
  const programs = [
    {
      basicInfo: {
        name: 'Master of Computer Science',
        universityId: 'harvard-1', // This would be the actual ID from the created university
        universityName: 'Harvard University',
        degree: 'master',
        field: 'Computer Science',
        subfield: 'Artificial Intelligence',
        duration: '2 years',
        language: 'English',
        description: 'Advanced program in computer science with focus on AI and machine learning.'
      },
      academics: {
        credits: 64,
        curriculum: {
          courses: [
            'Advanced Algorithms',
            'Machine Learning',
            'Computer Vision',
            'Natural Language Processing',
            'Deep Learning',
            'AI Ethics'
          ],
          specializations: ['AI/ML', 'Data Science', 'Cybersecurity', 'Software Engineering'],
          learningOutcomes: [
            'Design and implement complex software systems',
            'Apply machine learning techniques to real-world problems',
            'Conduct research in computer science'
          ]
        },
        accreditation: ['ABET', 'AACSB'],
        ranking: 5
      },
      admission: {
        requirements: {
          academic: ['Bachelor\'s degree in CS or related field', 'GPA 3.5+', 'Mathematics background'],
          english: ['TOEFL: 100+', 'IELTS: 7.0+'],
          documents: ['Transcripts', 'CV', 'Statement of Purpose', 'Recommendation Letters'],
          experience: 'Research experience preferred'
        },
        deadlines: { fall: 'December 15', spring: 'September 15', summer: 'April 15' },
        process: 'Online application through university portal',
        interviews: true
      },
      fees: {
        tuition: { amount: 65000, currency: 'USD', frequency: 'year' },
        scholarships: [
          { name: 'Merit Scholarship', amount: 15000, currency: 'USD' },
          { name: 'Research Assistantship', amount: 25000, currency: 'USD' }
        ],
        additionalFees: [
          { name: 'Technology Fee', amount: 2000, currency: 'USD' },
          { name: 'Health Insurance', amount: 3000, currency: 'USD' }
        ]
      },
      career: {
        jobProspects: ['Software Engineer', 'Data Scientist', 'AI Researcher', 'Product Manager'],
        averageSalary: { amount: 120000, currency: 'USD', period: 'year' },
        industries: ['Technology', 'Finance', 'Healthcare', 'Consulting'],
        employers: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple']
      },
      settings: {
        isActive: true,
        isFeatured: true,
        priority: 1,
        tags: ['STEM', 'Research', 'AI Focus', 'High Demand'],
        targetStudents: ['Undergraduates', 'Working Professionals'],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    },
    {
      basicInfo: {
        name: 'Bachelor of Business Administration',
        universityId: 'utoronto-1', // This would be the actual ID from the created university
        universityName: 'University of Toronto',
        degree: 'bachelor',
        field: 'Business',
        subfield: 'International Business',
        duration: '4 years',
        language: 'English',
        description: 'Comprehensive business education with global perspective.'
      },
      academics: {
        credits: 120,
        curriculum: {
          courses: [
            'Principles of Marketing',
            'Financial Accounting',
            'Managerial Economics',
            'International Business',
            'Strategic Management',
            'Business Ethics'
          ],
          specializations: ['Finance', 'Marketing', 'International Business', 'Entrepreneurship'],
          learningOutcomes: [
            'Analyze business problems using quantitative methods',
            'Communicate effectively in business contexts',
            'Understand global business environment'
          ]
        },
        accreditation: ['AACSB'],
        ranking: 15
      },
      admission: {
        requirements: {
          academic: ['High school diploma', 'Strong academic record', 'Mathematics proficiency'],
          english: ['TOEFL: 93+', 'IELTS: 7.0+'],
          documents: ['High school transcripts', 'Personal statement', 'Reference letters'],
          experience: 'Leadership experience preferred'
        },
        deadlines: { fall: 'January 15', spring: 'September 15', summer: 'Not available' },
        process: 'Ontario Universities Application Centre',
        interviews: false
      },
      fees: {
        tuition: { amount: 42000, currency: 'CAD', frequency: 'year' },
        scholarships: [
          { name: 'Entrance Scholarship', amount: 5000, currency: 'CAD' },
          { name: 'International Student Award', amount: 10000, currency: 'CAD' }
        ],
        additionalFees: [
          { name: 'Ancillary Fees', amount: 1500, currency: 'CAD' },
          { name: 'Health Insurance', amount: 800, currency: 'CAD' }
        ]
      },
      career: {
        jobProspects: ['Business Analyst', 'Marketing Coordinator', 'Financial Analyst', 'Management Consultant'],
        averageSalary: { amount: 65000, currency: 'CAD', period: 'year' },
        industries: ['Finance', 'Consulting', 'Retail', 'Technology'],
        employers: ['RBC', 'TD Bank', 'Shopify', 'Deloitte', 'PwC']
      },
      settings: {
        isActive: true,
        isFeatured: true,
        priority: 2,
        tags: ['Business', 'International', 'Career Focused'],
        targetStudents: ['High School Graduates', 'Transfer Students'],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    }
  ];

  console.log('🌱 Seeding comprehensive program profiles...');
  for (const program of programs) {
    try {
      const docRef = await db.collection('studyAbroadPrograms').add(program);
      console.log(`✅ Created program: ${program.basicInfo.name} (${docRef.id})`);
    } catch (error) {
      console.error(`❌ Failed to create program ${program.basicInfo.name}:`, error.message);
    }
  }
};

/**
 * Seed sample applications
 */
const seedApplications = async () => {
  const applications = [
    {
      applicant: {
        userId: 'sample-user-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        dateOfBirth: '1998-05-15',
        nationality: 'Canada',
        passportNumber: 'P123456789'
      },
      university: {
        id: 'harvard-1',
        name: 'Harvard University',
        country: 'United States',
        applicationFee: 75,
        currency: 'USD'
      },
      program: {
        name: 'Master of Computer Science',
        degree: 'master',
        intakePeriod: 'Fall 2024',
        startDate: '2024-09-01'
      },
      academics: {
        currentEducation: 'Bachelor of Computer Science',
        gpa: 3.8,
        graduationYear: 2023,
        previousInstitution: 'University of Toronto',
        englishProficiency: { test: 'TOEFL', score: 110, date: '2023-10-15' }
      },
      payment: {
        amount: 75,
        currency: 'USD',
        status: 'paid',
        transactionId: 'TXN-001',
        paymentDate: '2024-01-15T10:30:00Z',
        method: 'credit_card'
      },
      workflow: {
        status: 'document_review',
        currentStep: 'document_review',
        priority: 'medium',
        assignedTo: null,
        deadline: '2024-03-01T00:00:00Z',
        submittedAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z'
      },
      communications: [],
      timeline: [{
        id: 'timeline-1',
        action: 'Application Submitted',
        description: 'Application submitted successfully',
        timestamp: '2024-01-15T09:00:00Z',
        performedBy: 'sample-user-1',
        metadata: {}
      }],
      analytics: {
        timeToReview: 0,
        documentsVerified: 0,
        totalDocuments: 6,
        communicationsCount: 0
      }
    }
  ];

  console.log('🌱 Seeding sample applications...');
  for (const application of applications) {
    try {
      const docRef = await db.collection('applications').add(application);
      console.log(`✅ Created application for: ${application.applicant.firstName} ${application.applicant.lastName} (${docRef.id})`);
    } catch (error) {
      console.error(`❌ Failed to create application:`, error.message);
    }
  }
};

/**
 * Main seeding function
 */
const seedAllData = async () => {
  try {
    console.log('🚀 Starting comprehensive data seeding...');

    await seedUniversities();
    await seedPrograms();
    await seedApplications();

    console.log('🎉 All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeding
seedAllData();




