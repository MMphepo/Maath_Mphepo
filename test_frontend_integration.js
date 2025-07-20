/**
 * Frontend Integration Test
 * Tests Next.js frontend integration with Django REST API backend
 */

const API_BASE_URL = 'https://maath-mphepo.onrender.com';

class FrontendIntegrationTester {
    constructor() {
        this.results = [];
    }

    async logTest(endpoint, method, success, message) {
        const result = {
            endpoint,
            method,
            success,
            message,
            timestamp: new Date().toISOString()
        };
        this.results.push(result);
        
        const status = success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${method} ${endpoint} - ${message}`);
    }

    async testEndpoint(endpoint, method = 'GET', data = null, headers = {}) {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            const responseData = await response.json();

            if (response.ok) {
                // Check if response has expected structure
                if (responseData && typeof responseData === 'object' && 'success' in responseData) {
                    await this.logTest(endpoint, method, true, `Valid API response structure`);
                    return { success: true, data: responseData };
                } else {
                    await this.logTest(endpoint, method, true, `Response received (${response.status})`);
                    return { success: true, data: responseData };
                }
            } else {
                await this.logTest(endpoint, method, false, `HTTP ${response.status}: ${responseData.detail || 'Unknown error'}`);
                return { success: false, error: responseData };
            }
        } catch (error) {
            await this.logTest(endpoint, method, false, `Network error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async authenticate() {
        console.log('🔐 Authenticating with Django backend...');
        const result = await this.testEndpoint('/api/auth/login/', 'POST', {
            username: 'admin',
            password: 'AdminPass123!'
        });

        if (result.success && result.data.success) {
            this.token = result.data.data.access;
            console.log('✅ Authentication successful');
            return true;
        } else {
            console.log('❌ Authentication failed');
            return false;
        }
    }

    async runIntegrationTests() {
        console.log('🚀 Starting Frontend Integration Tests');
        console.log('Testing Next.js frontend compatibility with Django REST API');
        console.log('=' * 60);

        // Test authentication
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
            console.log('❌ Cannot proceed without authentication');
            return false;
        }

        console.log('\n📋 Testing API endpoints that Next.js frontend uses:');
        console.log('-'.repeat(50));

        // Test endpoints that the Next.js frontend relies on
        const frontendEndpoints = [
            // Blog system endpoints
            { endpoint: '/api/blog/', method: 'GET', description: 'Blog posts list' },
            { endpoint: '/api/blog/tags/', method: 'GET', description: 'Blog tags' },
            { endpoint: '/api/blog/react-state-management-best-practices/', method: 'GET', description: 'Individual blog post' },
            
            // Portfolio endpoints
            { endpoint: '/api/projects/', method: 'GET', description: 'Projects list' },
            { endpoint: '/api/skills/', method: 'GET', description: 'Skills data' },
            { endpoint: '/api/contact/info/', method: 'GET', description: 'Contact information' },
            { endpoint: '/api/testimonials/', method: 'GET', description: 'Testimonials' },
            { endpoint: '/api/config/', method: 'GET', description: 'Site configuration' },
        ];

        let passedTests = 0;
        let totalTests = frontendEndpoints.length;

        for (const test of frontendEndpoints) {
            console.log(`\nTesting: ${test.description}`);
            const result = await this.testEndpoint(test.endpoint, test.method);
            if (result.success) {
                passedTests++;
                
                // Validate data structure for critical endpoints
                if (test.endpoint === '/api/blog/' && result.data.success) {
                    const posts = result.data.data.posts;
                    if (Array.isArray(posts) && posts.length > 0) {
                        console.log(`  📊 Found ${posts.length} blog posts`);
                    }
                }
                
                if (test.endpoint === '/api/projects/' && result.data.success) {
                    const projects = result.data.data.projects;
                    if (Array.isArray(projects) && projects.length > 0) {
                        console.log(`  📊 Found ${projects.length} projects`);
                    }
                }
                
                if (test.endpoint === '/api/skills/' && result.data.success) {
                    const skillsByCategory = result.data.data.skillsByCategory;
                    if (Array.isArray(skillsByCategory) && skillsByCategory.length > 0) {
                        console.log(`  📊 Found ${skillsByCategory.length} skill categories`);
                    }
                }
            }
        }

        // Test interactive features
        console.log('\n🎯 Testing Interactive Features:');
        console.log('-'.repeat(35));

        // Test blog reactions (requires authentication)
        const reactionResult = await this.testEndpoint(
            '/api/blog/react-state-management-best-practices/like/',
            'POST',
            null,
            { 'Authorization': `Bearer ${this.token}` }
        );

        if (reactionResult.success) {
            passedTests++;
            totalTests++;
            console.log('  ✅ Blog reactions working');
        } else {
            totalTests++;
            console.log('  ❌ Blog reactions failed');
        }

        // Test newsletter subscription
        const newsletterResult = await this.testEndpoint(
            '/api/contact/newsletter/subscribe/',
            'POST',
            { email: 'integration-test@example.com' }
        );

        if (newsletterResult.success) {
            passedTests++;
            totalTests++;
            console.log('  ✅ Newsletter subscription working');
        } else {
            totalTests++;
            console.log('  ❌ Newsletter subscription failed');
        }

        // Generate summary
        this.generateSummary(passedTests, totalTests);
        return passedTests === totalTests;
    }

    generateSummary(passed, total) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 FRONTEND INTEGRATION TEST SUMMARY');
        console.log('='.repeat(60));
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${total - passed} ❌`);
        console.log(`Success Rate: ${((passed/total)*100).toFixed(1)}%`);
        
        console.log('\n🎯 Integration Status:');
        if (passed === total) {
            console.log('✅ PERFECT INTEGRATION - Next.js frontend fully compatible with Django backend');
            console.log('🚀 Ready for production deployment!');
        } else if (passed >= total * 0.9) {
            console.log('⚠️  MOSTLY COMPATIBLE - Minor issues detected');
        } else {
            console.log('❌ INTEGRATION ISSUES - Multiple endpoints failing');
        }

        // Save results
        const fs = require('fs');
        fs.writeFileSync('frontend_integration_results.json', JSON.stringify(this.results, null, 2));
        console.log('\n📄 Detailed results saved to: frontend_integration_results.json');
    }
}

// Run the tests
async function main() {
    const tester = new FrontendIntegrationTester();
    
    try {
        const success = await tester.runIntegrationTests();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('\n💥 Unexpected error:', error.message);
        process.exit(1);
    }
}

// Check if running in Node.js environment
if (typeof require !== 'undefined' && require.main === module) {
    main();
}

module.exports = FrontendIntegrationTester;
