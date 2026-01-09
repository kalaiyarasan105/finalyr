#!/usr/bin/env python3
"""
Test the analytics API endpoints
"""

import requests
import json

API_BASE = "http://localhost:8003"

def test_analytics_endpoints():
    """Test analytics endpoints without authentication first"""
    print("🧪 Testing Analytics API Endpoints...")
    
    # Test health endpoint first
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        return
    
    # Test analytics endpoints (these should return 401 without auth)
    endpoints = [
        "/analytics/overview?days=30",
        "/analytics/insights",
        "/analytics/emotions"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{API_BASE}{endpoint}")
            print(f"📊 {endpoint}: Status {response.status_code}")
            if response.status_code == 401:
                print(f"   ✅ Endpoint exists (requires authentication)")
            elif response.status_code == 404:
                print(f"   ❌ Endpoint not found")
            else:
                print(f"   ⚠️  Unexpected status: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")

def test_with_mock_data():
    """Test analytics service directly with mock data"""
    print("\n🔧 Testing Analytics Service Directly...")
    
    try:
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        
        from analytics import analytics_service
        from database import get_db
        
        # Test with empty data (should not crash)
        db = next(get_db())
        result = analytics_service.get_user_analytics(db, user_id=999, days=30)
        
        print("✅ Analytics service working")
        print(f"   Overview: {result['overview']}")
        print(f"   Insights count: {len(result['insights'])}")
        
    except Exception as e:
        print(f"❌ Analytics service error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_analytics_endpoints()
    test_with_mock_data()