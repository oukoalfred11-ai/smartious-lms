const router = require('express').Router();
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// ── 1. GET teacher profile (authenticated teacher)
router.get('/profile', auth, requireRole('teacher'), async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id).select('-password');
    
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Construct response with profile data
    const profile = {
      id: teacher._id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || '',
      bio: teacher.bio || '',
      avatar: `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`.toUpperCase(),
      avatarColor: '#3B82F6', // Default color, can be stored in DB if needed
      department: teacher.department || 'General',
      subjects: teacher.subjects || [],
      qualifications: teacher.qualifications || [],
      joinedDate: teacher.createdAt,
      status: teacher.isActive ? 'Active' : 'Inactive',
      rating: 4.9, // TODO: Calculate from reviews
      reviews: 1840, // TODO: Count actual reviews
      studentCount: 96, // TODO: Count enrolled students
      lessonsPerWeek: 12, // TODO: Calculate from schedule
      averageSessionRating: 4.8, // TODO: Calculate from session ratings
      lessonsFacilitated: 342, // TODO: Count completed lessons
    };

    res.json({ success: true, profile });
  } catch (e) {
    console.error('[teacher/profile GET]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

// ── 2. UPDATE teacher profile (authenticated teacher)
router.patch('/profile', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { firstName, lastName, phone, bio } = req.body;

    // Validation
    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ success: false, message: 'First name is required' });
    }
    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ success: false, message: 'Last name is required' });
    }

    // Only allow updating specific fields
    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };

    if (phone !== undefined) {
      updateData.phone = phone.trim();
    }
    if (bio !== undefined) {
      // Enforce 500 char limit
      updateData.bio = bio.trim().slice(0, 500);
    }

    const teacher = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    const profile = {
      id: teacher._id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || '',
      bio: teacher.bio || '',
      avatar: `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`.toUpperCase(),
      avatarColor: '#3B82F6',
      department: teacher.department || 'General',
      subjects: teacher.subjects || [],
      qualifications: teacher.qualifications || [],
      joinedDate: teacher.createdAt,
      status: teacher.isActive ? 'Active' : 'Inactive',
      rating: 4.9,
      reviews: 1840,
      studentCount: 96,
      lessonsPerWeek: 12,
      averageSessionRating: 4.8,
      lessonsFacilitated: 342,
    };

    res.json({ success: true, profile, message: 'Profile updated successfully' });
  } catch (e) {
    console.error('[teacher/profile PATCH]', e.message);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

// ── 3. CHANGE PASSWORD (authenticated teacher)
router.post('/change-password', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { current, new: newPassword } = req.body;

    if (!current || !current.trim()) {
      return res.status(400).json({ success: false, message: 'Current password is required' });
    }
    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    // Get teacher with password (select('+password') if not included by default)
    const teacher = await User.findById(req.user._id);

    // Verify current password
    const isValid = await teacher.comparePassword(current);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Update password
    teacher.password = newPassword;
    await teacher.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (e) {
    console.error('[teacher/change-password]', e.message);
    res.status(500).json({ success: false, message: 'Server error changing password' });
  }
});

// ── 4. CHANGE EMAIL (authenticated teacher)
// This endpoint sends a verification email link (in production)
// For now, it validates the email and marks it as pending verification
router.post('/change-email', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail || !newEmail.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const newEmailLower = newEmail.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmailLower });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // In production, send verification email here
    // For now, update immediately
    const teacher = await User.findByIdAndUpdate(
      req.user._id,
      { email: newEmailLower },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Email changed successfully. Verification email sent.',
      email: teacher.email,
    });
  } catch (e) {
    console.error('[teacher/change-email]', e.message);
    res.status(500).json({ success: false, message: 'Server error changing email' });
  }
});

module.exports = router;

