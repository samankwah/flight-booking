// server/controllers/universityController.js
import { db } from '../config/firebase.js';

/**
 * Get all universities for public frontend display
 * @route GET /api/universities
 */
export const getAllUniversitiesPublic = async (req, res) => {
  try {
    const { country, featured, limit = 50, offset = 0 } = req.query;

    // Temporarily fetch all universities to avoid index requirements
    // TODO: Create proper Firestore indexes for production
    let query = db.collection('universities');
    let featuredFilter = featured === 'true';
    let countryFilter = country;

    const snapshot = await query.get();
    let universities = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        // Public display data
        name: data.basicInfo?.name || data.name || 'Unknown University',
        country: data.basicInfo?.country || data.country || '',
        city: data.basicInfo?.city || data.city || '',
        logo: data.media?.logo || data.logo || '',
        bannerImage: data.media?.bannerImage || data.bannerImage || '',
        website: data.basicInfo?.website || data.website || '',
        description: data.facilities?.description || data.description || '',
        ranking: data.academics?.ranking || data.ranking || {},
        totalStudents: data.academics?.totalStudents || data.totalStudents || 0,
        internationalStudents: data.academics?.internationalStudents || 0,
        applicationFee: data.fees?.applicationFee || data.applicationFee || 0,
        currency: data.fees?.currency || data.currency || 'USD',
        programs: data.programs || {},
        isFeatured: data.settings?.isFeatured || data.isFeatured || false,
        isPartnered: data.partnerships?.isPartnered || data.isPartnered || false,
        // Include all detailed data for rich frontend display
        ...data
      };
    });

    // Apply filters in memory
    if (countryFilter) {
      universities = universities.filter(uni => uni.country === countryFilter);
    }
    if (featuredFilter) {
      universities = universities.filter(uni => uni.isFeatured);
    }

    // Sort by created date in memory (descending)
    universities.sort((a, b) => {
      const dateA = new Date(a.settings?.createdAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.settings?.createdAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Apply pagination in memory
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedUniversities = universities.slice(startIndex, endIndex);

    res.json({
      success: true,
      universities: paginatedUniversities,
      total: universities.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get public universities error:', error);
    res.status(500).json({
      error: 'Failed to fetch universities',
      message: error.message
    });
  }
};

/**
 * Search universities for autocomplete and filtering
 * @route GET /api/universities/search
 */
export const searchUniversities = async (req, res) => {
  try {
    const { query, country, limit = 20 } = req.query;

    // Temporarily simplified query to avoid index requirements
    const firestoreQuery = db.collection('universities');
    let countryFilter = country;

    // Note: Firestore doesn't support text search natively
    // For production, consider using Algolia or Elasticsearch
    // For now, we'll fetch all and filter in memory
    const snapshot = await firestoreQuery.limit(parseInt(limit) * 2).get();

    let universities = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        schoolName: data.basicInfo?.name || data.name || '',
        name: data.basicInfo?.name || data.name || '',
        country: data.basicInfo?.country || data.country || '',
        city: data.basicInfo?.city || data.city || '',
        logo: data.media?.logo || data.logo || '',
        ranking: data.academics?.ranking || data.ranking || {},
        isFeatured: data.settings?.isFeatured || data.isFeatured || false,
        isActive: data.settings?.isActive !== false // Default to true
      };
    });

    // Filter by active status, country, and query if provided
    universities = universities.filter(uni => uni.isActive);

    if (countryFilter) {
      universities = universities.filter(uni => uni.country === countryFilter);
    }

    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      universities = universities.filter(uni =>
        uni.name.toLowerCase().includes(searchTerm) ||
        uni.country.toLowerCase().includes(searchTerm) ||
        uni.city.toLowerCase().includes(searchTerm)
      );
    }

    // Limit results
    universities = universities.slice(0, parseInt(limit));

    res.json({
      success: true,
      universities
    });
  } catch (error) {
    console.error('Search universities error:', error);
    res.status(500).json({
      error: 'Failed to search universities',
      message: error.message
    });
  }
};

/**
 * Get single university by ID for public display
 * @route GET /api/universities/:id
 */
export const getUniversityByIdPublic = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('universities').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'University not found'
      });
    }

    const data = doc.data();

    // Check if university is active
    if (!data.settings?.isActive) {
      return res.status(404).json({
        error: 'University not found'
      });
    }

    // Return public university data
    const university = {
      id: doc.id,
      name: data.basicInfo?.name || '',
      country: data.basicInfo?.country || '',
      city: data.basicInfo?.city || '',
      address: data.basicInfo?.address || '',
      website: data.basicInfo?.website || '',
      phone: data.basicInfo?.phone || '',
      email: data.basicInfo?.email || '',
      logo: data.media?.logo || '',
      bannerImage: data.media?.bannerImage || '',
      gallery: data.media?.gallery || [],
      virtualTour: data.media?.virtualTour || '',
      videos: data.media?.videos || [],
      description: data.facilities?.description || '',
      ranking: data.academics?.ranking || {},
      accreditations: data.academics?.accreditations || [],
      totalStudents: data.academics?.totalStudents || 0,
      internationalStudents: data.academics?.internationalStudents || 0,
      facultyCount: data.academics?.facultyCount || 0,
      studentFacultyRatio: data.academics?.studentFacultyRatio || '',
      facilities: data.facilities || {},
      programs: data.programs || {},
      fees: data.fees || {},
      admission: data.admission || {},
      isFeatured: data.settings?.isFeatured || false,
      isPartnered: data.partnerships?.isPartnered || false,
      // Include all detailed data
      ...data
    };

    res.json({
      success: true,
      university
    });
  } catch (error) {
    console.error('Get public university error:', error);
    res.status(500).json({
      error: 'Failed to fetch university',
      message: error.message
    });
  }
};
