#!/usr/bin/env python3
"""
Test the complete flow: register -> login -> analytics
"""

import requests
import json
import random
import string

API_BASE = "http://localhost:8003"

def generate_test_user():
    """Generate a unique test user"""
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return {
        "username": f"testuser_{suffix}",
        "email": f"test_{suffix}@example.com",
        "password": "testpass123"
    }

def test_complete_flow():
    """Test the complete authentication and analytics flow"""
    print("🧪 Testing Complete Flow: Register -> Login -> Analytics")
    
    # Step 1: Register a new user
    user_data = generate_test_user()
    print(f"\n1️⃣ Registering user: {user_data['username']}")
    
    try:
        register_response = requests.post(f"{API_BASE}/auth/register", json=user_data)
        print(f"   Registration status: {register_response.status_code}")
        
        if register_response.status_code != 200:
            print(f"   Registration failed: {register_response.text}")
            return False
        
        print(f"   ✅ User registered successfully")
        
    except Exception as e:
        print(f"   ❌ Registration error: {e}")
        return False
    
    # Step 2: Login with the new user
    print(f"\n2️⃣ Logging in as: {user_data['username']}")
    
    try:
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        login_response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        print(f"   Login status: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"   Login failed: {login_response.text}")
            return False
        
        token_data = login_response.json()
        token = token_data["access_token"]
        print(f"   ✅ Login successful, token: {token[:20]}...")
        
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return False
    
    # Step 3: Test auth/me endpoint
    print(f"\n3️⃣ Testing auth/me endpoint")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get(f"{API_BASE}/auth/me", headers=headers)
        print(f"   Auth/me status: {me_response.status_code}")
        
        if me_response.status_code != 200:
            print(f"   Auth/me failed: {me_response.text}")
            return False
        
        user_info = me_response.json()
        print(f"   ✅ Auth working, user: {user_info['username']}")
        
    except Exception as e:
        print(f"   ❌ Auth/me error: {e}")
        return False
    
    # Step 4: Test analytics endpoints
    print(f"\n4️⃣ Testing analytics endpoints")
    
    analytics_endpoints = [
        "/analytics/overview?days=30",
        "/analytics/insights",
        "/analytics/emotions"
    ]
    
    for endpoint in analytics_endpoints:
        try:
            analytics_response = requests.get(f"{API_BASE}{endpoint}", headers=headers)
            print(f"   {endpoint}: {analytics_response.status_code}")
            
            if analytics_response.status_code == 200:
                data = analytics_response.json()
                print(f"      ✅ Success - Data keys: {list(data.keys())}")
            else:
                print(f"      ❌ Failed: {analytics_response.text}")
                
        except Exception as e:
            print(f"      ❌ Error: {e}")
    
    print(f"\n🎉 Test completed!")
    return True

if __name__ == "__main__":
    test_complete_flow()