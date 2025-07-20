#!/usr/bin/env python3
"""
API Compatibility Test Script
Tests all Django REST API endpoints to ensure compatibility with Next.js frontend
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "https://maath-mphepo.onrender.com"

class APITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.token = None
        self.test_results = []
        
    def log_test(self, endpoint, method, status_code, success, message=""):
        """Log test result"""
        result = {
            'endpoint': endpoint,
            'method': method,
            'status_code': status_code,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {method} {endpoint} - {status_code} - {message}")
    
    def authenticate(self):
        """Get authentication token"""
        try:
            response = self.session.post(
                f"{self.base_url}/api/auth/login/",
                json={"username": "admin", "password": "AdminPass123!"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.token = data['data']['access']
                    self.session.headers.update({'Authorization': f'Bearer {self.token}'})
                    self.log_test('/api/auth/login/', 'POST', 200, True, "Authentication successful")
                    return True
                    
            self.log_test('/api/auth/login/', 'POST', response.status_code, False, "Authentication failed")
            return False
            
        except Exception as e:
            self.log_test('/api/auth/login/', 'POST', 0, False, f"Exception: {str(e)}")
            return False
    
    def test_endpoint(self, endpoint, method='GET', data=None, auth_required=False):
        """Test a single endpoint"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method == 'GET':
                response = self.session.get(url, timeout=10)
            elif method == 'POST':
                response = self.session.post(url, json=data, timeout=10)
            elif method == 'PUT':
                response = self.session.put(url, json=data, timeout=10)
            elif method == 'DELETE':
                response = self.session.delete(url, timeout=10)
            else:
                self.log_test(endpoint, method, 0, False, "Unsupported method")
                return False
            
            # Check if response is successful
            success = 200 <= response.status_code < 300
            
            # For successful responses, check if it's valid JSON with expected structure
            if success:
                try:
                    json_data = response.json()
                    if isinstance(json_data, dict) and 'success' in json_data:
                        message = f"Valid API response structure"
                    else:
                        message = f"Response: {len(response.content)} bytes"
                except:
                    message = f"Non-JSON response: {len(response.content)} bytes"
            else:
                message = f"HTTP {response.status_code}"
            
            self.log_test(endpoint, method, response.status_code, success, message)
            return success
            
        except requests.exceptions.Timeout:
            self.log_test(endpoint, method, 0, False, "Request timeout")
            return False
        except Exception as e:
            self.log_test(endpoint, method, 0, False, f"Exception: {str(e)}")
            return False
    
    def run_tests(self):
        """Run all API compatibility tests"""
        print("🚀 Starting API Compatibility Tests")
        print("=" * 50)
        
        # Test authentication first
        if not self.authenticate():
            print("❌ Authentication failed - cannot continue with authenticated tests")
            return False
        
        # Test public endpoints
        public_endpoints = [
            '/api/blog/',
            '/api/blog/react-state-management-best-practices/',
            '/api/blog/tags/',
            '/api/projects/',
            '/api/skills/',
            '/api/contact/info/',
            '/api/testimonials/',
            '/api/config/',
            '/api/achievements/',
        ]
        
        print("\n📋 Testing Public Endpoints:")
        print("-" * 30)
        for endpoint in public_endpoints:
            self.test_endpoint(endpoint)
        
        # Test authenticated endpoints
        authenticated_endpoints = [
            ('/api/auth/verify/', 'GET'),
            ('/api/blog/react-state-management-best-practices/like/', 'POST'),
        ]
        
        print("\n🔐 Testing Authenticated Endpoints:")
        print("-" * 35)
        for endpoint, method in authenticated_endpoints:
            self.test_endpoint(endpoint, method, auth_required=True)
        
        # Test form submissions
        print("\n📝 Testing Form Submissions:")
        print("-" * 30)
        
        # Test newsletter subscription
        newsletter_data = {"email": "test@example.com"}
        self.test_endpoint('/api/contact/newsletter/subscribe/', 'POST', newsletter_data)
        
        # Generate summary
        self.generate_summary()
        
        return True
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['method']} {result['endpoint']}: {result['message']}")
        
        print("\n🎯 API Compatibility Status:")
        if failed_tests == 0:
            print("✅ ALL TESTS PASSED - Django API is fully compatible with Next.js frontend")
        elif failed_tests <= 2:
            print("⚠️  MOSTLY COMPATIBLE - Minor issues detected")
        else:
            print("❌ COMPATIBILITY ISSUES - Multiple endpoints failing")
        
        # Save detailed results
        with open('api_test_results.json', 'w') as f:
            json.dump(self.test_results, f, indent=2)
        print(f"\n📄 Detailed results saved to: api_test_results.json")


def main():
    """Main function"""
    print("Django REST API Compatibility Tester")
    print("Testing compatibility with Next.js frontend API expectations")
    print()
    
    tester = APITester()
    
    try:
        success = tester.run_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⏹️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
