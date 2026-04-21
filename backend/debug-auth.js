import { assertSupabaseReady, isSupabaseEnabled } from './config/supabase.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

async function debugAuth() {
    console.log('🔍 Authentication Debugging Tool\n');
    
    // Check Supabase Configuration
    console.log('1️⃣  Supabase Configuration:');
    console.log(`   - Enabled: ${isSupabaseEnabled}`);
    console.log(`   - URL: ${process.env.SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   - Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configured' : '❌ Missing'}`);
    
    if (!isSupabaseEnabled) {
        console.log('   ⚠️  Supabase is disabled! Check USE_SUPABASE env variable');
        return;
    }
    
    try {
        const sb = assertSupabaseReady();
        console.log('   ✅ Supabase connection successful\n');
        
        // Check users table
        console.log('2️⃣  Checking Users Table:');
        const { data: users, error } = await sb.from('users').select('*').limit(5);
        
        if (error) {
            console.log(`   ❌ Error: ${error.message}`);
            console.log('   💡 Make sure the "users" table exists in Supabase\n');
            return;
        }
        
        console.log(`   ✅ Found ${users.length} user(s)`);
        if (users.length > 0) {
            console.log('   Sample user:');
            const user = users[0];
            console.log(`      - ID: ${user.id}`);
            console.log(`      - Email: ${user.email}`);
            console.log(`      - Name: ${user.name}`);
            console.log(`      - Password Hash: ${user.password ? '✅ Exists' : '❌ Missing'}\n`);
        }
        
        // Test password validation
        console.log('3️⃣  Password Validation Rules:');
        console.log('   Required: 8+ chars, uppercase, lowercase, number, special char (@$!%*?&)');
        const testPasswords = [
            'TestPassword123!',
            'Test@1234',
            'password',
            'Test123',
        ];
        
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        testPasswords.forEach(pwd => {
            console.log(`   - "${pwd}": ${regex.test(pwd) ? '✅ Valid' : '❌ Invalid'}`);
        });
        
        console.log('\n4️⃣  Test Login:');
        if (users.length > 0) {
            const testUser = users[0];
            console.log(`   Testing with email: ${testUser.email}`);
            console.log(`   Password hash exists: ${testUser.password ? '✅ Yes' : '❌ No'}`);
            
            // Try bcrypt comparison with a test password
            const testPwd = 'TestPassword123!';
            const isMatch = await bcrypt.compare(testPwd, testUser.password || '');
            console.log(`   Test password "${testPwd}" match: ${isMatch ? '✅ Match' : '❌ No match'}`);
        } else {
            console.log('   ℹ️  No users in database. Please sign up first!');
        }
        
        console.log('\n5️⃣  Debug Tips:');
        console.log('   • Make sure you\'ve signed up with a valid account first');
        console.log('   • Check that the password matches the validation rules');
        console.log('   • Verify email exists in the Supabase users table');
        console.log('   • Check that password is hashed (starts with $2a$, $2b$, or similar)');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   • Verify SUPABASE_URL is correct');
        console.log('   • Verify SUPABASE_SERVICE_ROLE_KEY is valid');
        console.log('   • Check Supabase project is active');
    }
}

debugAuth().catch(console.error);
