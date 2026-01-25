#!/usr/bin/env python3
"""
Backend API Test Suite for ServerListRank Blog Management
Tests blog management functionality in the admin panel
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

def print_test_result(test_name, success, details=""):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   Details: {details}")
    print()

def test_health_check():
    """Test basic API health check"""
    print("=== Testing API Health Check ===")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        success = response.status_code == 200
        details = f"Status: {response.status_code}, Response: {response.text[:100]}"
        print_test_result("API Health Check", success, details)
        return success
    except Exception as e:
        print_test_result("API Health Check", False, f"Exception: {str(e)}")
        return False

def test_robots_txt():
    """Test robots.txt endpoint"""
    print("=== Testing robots.txt ===")
    try:
        response = requests.get(f"{BASE_URL}/robots.txt", timeout=10)
        success = response.status_code == 200
        
        # Check if response contains expected robots directives
        content = response.text
        has_user_agent = "User-Agent:" in content or "User-agent:" in content or "user-agent:" in content
        has_disallow = "Disallow:" in content or "disallow:" in content
        has_sitemap = "Sitemap:" in content or "sitemap:" in content or "Host:" in content
        
        content_valid = has_user_agent and has_disallow and has_sitemap
        success = success and content_valid
        
        details = f"Status: {response.status_code}, Has User-agent: {has_user_agent}, Has Disallow: {has_disallow}, Has Sitemap: {has_sitemap}"
        print_test_result("robots.txt Generation", success, details)
        
        if response.status_code == 200:
            print(f"   Content preview: {content[:200]}...")
        
        return success
    except Exception as e:
        print_test_result("robots.txt Generation", False, f"Exception: {str(e)}")
        return False

def test_sitemap_xml():
    """Test sitemap.xml endpoint"""
    print("=== Testing sitemap.xml ===")
    try:
        response = requests.get(f"{BASE_URL}/sitemap.xml", timeout=10)
        success = response.status_code == 200
        
        # Check if response contains XML sitemap structure
        content = response.text
        has_xml_declaration = "<?xml" in content
        has_urlset = "<urlset" in content or "<sitemapindex" in content
        has_url_entries = "<url>" in content or "<sitemap>" in content
        
        content_valid = has_xml_declaration and has_urlset and has_url_entries
        success = success and content_valid
        
        details = f"Status: {response.status_code}, Has XML: {has_xml_declaration}, Has URLset: {has_urlset}, Has URLs: {has_url_entries}"
        print_test_result("sitemap.xml Generation", success, details)
        
        if response.status_code == 200:
            print(f"   Content preview: {content[:300]}...")
        
        return success
    except Exception as e:
        print_test_result("sitemap.xml Generation", False, f"Exception: {str(e)}")
        return False

def test_admin_blog_get():
    """Test GET /api/admin/blog - Should return blog posts list"""
    print("=== Testing GET /api/admin/blog ===")
    try:
        response = requests.get(f"{API_BASE}/admin/blog", timeout=10)
        
        # Since no DATABASE_URL is configured, we expect 503 or 403 (no auth)
        expected_statuses = [503, 403]
        success = response.status_code in expected_statuses
        
        details = f"Status: {response.status_code}"
        try:
            json_response = response.json()
            if response.status_code == 503:
                # Check for database not available message
                has_db_error = any(key in json_response for key in ['error', 'message']) 
                success = success and has_db_error
                details += f", Has DB error: {has_db_error}"
            elif response.status_code == 403:
                # Check for admin permission error
                has_auth_error = 'error' in json_response
                success = success and has_auth_error
                details += f", Has auth error: {has_auth_error}"
            details += f", Response: {json.dumps(json_response)[:100]}"
        except:
            details += ", Response: Non-JSON"
        
        print_test_result("GET /api/admin/blog endpoint exists", success, details)
        return success
    except Exception as e:
        print_test_result("GET /api/admin/blog endpoint exists", False, f"Exception: {str(e)}")
        return False

def test_admin_blog_post():
    """Test POST /api/admin/blog - Create blog post"""
    print("=== Testing POST /api/admin/blog ===")
    try:
        test_blog_data = {
            "title": "Test Blog Post",
            "content": "This is a test blog post content for testing purposes.",
            "excerpt": "Test excerpt",
            "tags": ["test", "blog", "api"],
            "blogType": "NEWS",
            "published": True
        }
        
        response = requests.post(
            f"{API_BASE}/admin/blog", 
            json=test_blog_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        # Since no DATABASE_URL is configured, we expect 503 or 403 (no auth)
        expected_statuses = [503, 403]
        success = response.status_code in expected_statuses
        
        details = f"Status: {response.status_code}"
        try:
            json_response = response.json()
            if response.status_code == 503:
                has_db_error = any(key in json_response for key in ['error', 'message'])
                success = success and has_db_error
                details += f", Has DB error: {has_db_error}"
            elif response.status_code == 403:
                has_auth_error = 'error' in json_response
                success = success and has_auth_error
                details += f", Has auth error: {has_auth_error}"
            details += f", Response: {json.dumps(json_response)[:100]}"
        except:
            details += ", Response: Non-JSON"
        
        print_test_result("POST /api/admin/blog endpoint exists", success, details)
        return success
    except Exception as e:
        print_test_result("POST /api/admin/blog endpoint exists", False, f"Exception: {str(e)}")
        return False

def test_admin_blog_put():
    """Test PUT /api/admin/blog - Update blog post"""
    print("=== Testing PUT /api/admin/blog ===")
    try:
        test_update_data = {
            "id": "test-blog-id-123",
            "title": "Updated Test Blog Post",
            "content": "This is updated content for the test blog post.",
            "tags": ["updated", "test", "blog"],
            "blogType": "GUIDE",
            "published": False
        }
        
        response = requests.put(
            f"{API_BASE}/admin/blog", 
            json=test_update_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        # Since no DATABASE_URL is configured, we expect 503 or 403 (no auth)
        expected_statuses = [503, 403]
        success = response.status_code in expected_statuses
        
        details = f"Status: {response.status_code}"
        try:
            json_response = response.json()
            if response.status_code == 503:
                has_db_error = any(key in json_response for key in ['error', 'message'])
                success = success and has_db_error
                details += f", Has DB error: {has_db_error}"
            elif response.status_code == 403:
                has_auth_error = 'error' in json_response
                success = success and has_auth_error
                details += f", Has auth error: {has_auth_error}"
            details += f", Response: {json.dumps(json_response)[:100]}"
        except:
            details += ", Response: Non-JSON"
        
        print_test_result("PUT /api/admin/blog endpoint exists", success, details)
        return success
    except Exception as e:
        print_test_result("PUT /api/admin/blog endpoint exists", False, f"Exception: {str(e)}")
        return False

def test_admin_blog_delete():
    """Test DELETE /api/admin/blog?id={postId} - Delete blog post"""
    print("=== Testing DELETE /api/admin/blog ===")
    try:
        test_post_id = "test-blog-id-123"
        response = requests.delete(
            f"{API_BASE}/admin/blog?id={test_post_id}",
            timeout=10
        )
        
        # Since no DATABASE_URL is configured, we expect 503 or 403 (no auth)
        expected_statuses = [503, 403]
        success = response.status_code in expected_statuses
        
        details = f"Status: {response.status_code}"
        try:
            json_response = response.json()
            if response.status_code == 503:
                has_db_error = any(key in json_response for key in ['error', 'message'])
                success = success and has_db_error
                details += f", Has DB error: {has_db_error}"
            elif response.status_code == 403:
                has_auth_error = 'error' in json_response
                success = success and has_auth_error
                details += f", Has auth error: {has_auth_error}"
            details += f", Response: {json.dumps(json_response)[:100]}"
        except:
            details += ", Response: Non-JSON"
        
        print_test_result("DELETE /api/admin/blog endpoint exists", success, details)
        return success
    except Exception as e:
        print_test_result("DELETE /api/admin/blog endpoint exists", False, f"Exception: {str(e)}")
        return False

def test_public_blog_get():
    """Test GET /api/blog - Public blog posts list"""
    print("=== Testing GET /api/blog (Public) ===")
    try:
        response = requests.get(f"{API_BASE}/blog", timeout=10)
        
        # Public blog endpoint should work even without database (returns empty data)
        success = response.status_code == 200
        
        details = f"Status: {response.status_code}"
        try:
            json_response = response.json()
            # Should return structure with posts, tags, typeCounts
            has_posts = 'posts' in json_response
            has_tags = 'tags' in json_response  
            has_type_counts = 'typeCounts' in json_response
            
            structure_valid = has_posts and has_tags and has_type_counts
            success = success and structure_valid
            
            details += f", Has posts: {has_posts}, Has tags: {has_tags}, Has typeCounts: {has_type_counts}"
            details += f", Response: {json.dumps(json_response)[:150]}"
        except:
            details += ", Response: Non-JSON"
            success = False
        
        print_test_result("GET /api/blog public endpoint", success, details)
        return success
    except Exception as e:
        print_test_result("GET /api/blog public endpoint", False, f"Exception: {str(e)}")
        return False

def test_blog_slug_get():
    """Test GET /api/blog/[slug] - Get specific blog post"""
    print("=== Testing GET /api/blog/[slug] ===")
    try:
        test_slug = "test-blog-post"
        response = requests.get(f"{API_BASE}/blog/{test_slug}", timeout=10)
        
        # Since no DATABASE_URL is configured, we expect 503 or 404
        expected_statuses = [503, 404]
        success = response.status_code in expected_statuses
        
        details = f"Status: {response.status_code}"
        try:
            json_response = response.json()
            if response.status_code == 503:
                has_db_error = any(key in json_response for key in ['error', 'message'])
                success = success and has_db_error
                details += f", Has DB error: {has_db_error}"
            elif response.status_code == 404:
                has_not_found = 'error' in json_response
                success = success and has_not_found
                details += f", Has not found error: {has_not_found}"
            details += f", Response: {json.dumps(json_response)[:100]}"
        except:
            details += ", Response: Non-JSON"
        
        print_test_result("GET /api/blog/[slug] endpoint exists", success, details)
        return success
    except Exception as e:
        print_test_result("GET /api/blog/[slug] endpoint exists", False, f"Exception: {str(e)}")
        return False

def run_all_tests():
    """Run all backend tests"""
    print("🚀 Starting Backend API Tests for Blog Management")
    print("=" * 60)
    print(f"Testing against: {BASE_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()
    
    test_results = []
    
    # Run all tests
    test_results.append(("Health Check", test_health_check()))
    test_results.append(("robots.txt", test_robots_txt()))
    test_results.append(("sitemap.xml", test_sitemap_xml()))
    test_results.append(("Admin Blog GET", test_admin_blog_get()))
    test_results.append(("Admin Blog POST", test_admin_blog_post()))
    test_results.append(("Admin Blog PUT", test_admin_blog_put()))
    test_results.append(("Admin Blog DELETE", test_admin_blog_delete()))
    test_results.append(("Public Blog GET", test_public_blog_get()))
    test_results.append(("Blog Slug GET", test_blog_slug_get()))
    
    # Summary
    print("=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print()
    print(f"Results: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed!")
        return True
    else:
        print("⚠️  Some tests failed - see details above")
        return False

if __name__ == "__main__":
    try:
        success = run_all_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n❌ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        sys.exit(1)