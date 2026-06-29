/**
 * Enterprise CRM Database & Model Schema Verification Script
 * 
 * This script connects to the local/configured MongoDB database,
 * performs validation on User and Lead Mongoose schemas,
 * tests password hashing, and verifies CRUD operations.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const User = require('./models/User');
const Lead = require('./models/Lead');

const runVerification = async () => {
  console.log('--------------------------------------------------');
  console.log('🚀 Initiating Apex CRM Schema Validation Engine');
  console.log('--------------------------------------------------');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise-crm';
  console.log(`📡 Connecting to DB: ${mongoUri}`);

  try {
    // 1. Connect
    await mongoose.connect(mongoUri);
    console.log('✅ Connection to MongoDB: SUCCESSFUL\n');

    // Clean up any old test records
    await User.deleteMany({ email: 'test_verify@example.com' });
    
    // 2. Create User (Test Rep)
    console.log('⚙️ Phase 1: Validating User Model Creation & Password Hashing...');
    const testUser = await User.create({
      name: 'Verification Officer',
      email: 'test_verify@example.com',
      password: 'verification_secured_password_123',
      role: 'Rep',
    });

    console.log(`✅ User Document Created: ${testUser._id}`);
    console.log(`🔑 Role Assigned: ${testUser.role}`);
    
    // Test password hashing pre-save hook
    const fetchedUser = await User.findOne({ email: 'test_verify@example.com' }).select('+password');
    console.log(`🔒 Hashed Password Saved in DB: ${fetchedUser.password}`);
    const isMatch = await fetchedUser.matchPassword('verification_secured_password_123');
    const isBadMatch = await fetchedUser.matchPassword('incorrect_pwd');
    
    if (isMatch && !isBadMatch) {
      console.log('✅ Pre-save Password BCRYPT Hashing: VALIDATED');
    } else {
      throw new Error('❌ Bcrypt password comparison failed!');
    }
    console.log('');

    // 3. Create Lead
    console.log('⚙️ Phase 2: Validating Lead Creation & Activity Logging...');
    const testLead = await Lead.create({
      name: 'Corporate Executive',
      company: 'Megatech Conglomerate',
      email: 'exec@megatech.org',
      phone: '+1 (555) 987-6543',
      value: 125000,
      stage: 'New',
      assignedTo: testUser._id,
    });

    console.log(`✅ Lead Document Created: ${testLead._id}`);
    console.log(`💼 Deal Value: $${testLead.value}`);
    console.log(`📊 Initial Stage: ${testLead.stage}`);
    console.log(`📝 Default Activity logs count: ${testLead.activities.length}`);

    // Update Lead Stage & Add Activity Log
    testLead.stage = 'Contacted';
    testLead.activities.push({
      type: 'Call',
      description: 'First screening call. Executive showed high interest in CRM scaling.',
      createdBy: testUser._id,
      creatorName: testUser.name,
    });

    const savedLead = await testLead.save();
    console.log(`✅ Lead Stage Updated: ${savedLead.stage}`);
    console.log(`📝 Total Activity logs: ${savedLead.activities.length}`);
    console.log(`💬 Latest Activity Log: "${savedLead.activities[savedLead.activities.length - 1].description}"`);
    console.log('');

    // 4. Cleanup Validation data
    console.log('⚙️ Phase 3: Clearing Validation Test Records...');
    await Lead.findByIdAndDelete(testLead._id);
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Temporary Verification Records deleted: CLEANED');

    console.log('\n--------------------------------------------------');
    console.log('🎉 APEX CRM VERIFICATION COMPLETE: ALL MODELS STABLE');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('\n❌ VERIFICATION ERROR:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Database connection closed.');
  }
};

runVerification();
