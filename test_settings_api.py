#!/usr/bin/env python3
"""
Test the settings and user management API endpoints
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
        "username": f"settingstest_{suffix}",
        "email": f"settings_{suffix}@example.com",
        "password": "testpass123"
    }

def test_settings_functionality():
    """Test the complete settings functionality"""
    print("🧪 Testing Settings & User Management API")
    
    # Step 1: Register a new user
    user_data = generate_test_user()
    print(f"\n1️⃣ Registering user: {user_data['username']}")
    
    try:
        register_response = requests.post(f"{API_BASE}/auth/register", json=user_data)
        if register_response.status_code != 200:
            print(f"   ❌ Registration failed: {register_response.text}")
            return False
        print(f"   ✅ User registered successfully")
    except Exception as e:
        print(f"   ❌ Registration error: {e}")
        return False
    
    # Step 2: Login
    print(f"\n2️⃣ Logging in...")
    try:
        login_data = {"username": user_data["username"], "password": user_data["password"]}
        login_response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        if login_response.status_code != 200:
            print(f"   ❌ Login failed: {login_response.text}")
            return False
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"   ✅ Login successful")
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return False
    
    # Step 3: Test profile update
    print(f"\n3️⃣ Testing profile update...")
    try:
        new_username = f"updated_{user_data['username']}"
        new_email = f"updated_{user_data['email']}"
        
        profile_update = {
            "username": new_username,
            "email": new_email
        }
        
        profile_response = requests.put(f"{API_BASE}/users/profile", json=profile_update, headers=headers)
        print(f"   Profile update status: {profile_response.status_code}")
        
        if profile_response.status_code == 200:
            print(f"   ✅ Profile updated successfully")
            user_data["username"] = new_username  # Update for future tests
        else:
            print(f"   ❌ Profile update failed: {profile_response.text}")
    except Exception as e:
        print(f"   ❌ Profile update error: {e}")
    
    # Step 4: Test password change
    print(f"\n4️⃣ Testing password change...")
    try:
        new_password = "newpassword123"
        password_change = {
            "current_password": user_data["password"],
            "new_password": new_password
        }
        
        password_response = requests.put(f"{API_BASE}/users/password", json=password_change, headers=headers)
        print(f"   Password change status: {password_response.status_code}")
        
        if password_response.status_code == 200:
            print(f"   ✅ Password changed successfully")
            user_data["password"] = new_password  # Update for future tests
        else:
            print(f"   ❌ Password change failed: {password_response.text}")
    except Exception as e:
        print(f"   ❌ Password change error: {e}")
    
    # Step 5: Test login with new password
    print(f"\n5️⃣ Testing login with new password...")
    try:
        login_data = {"username": user_data["username"], "password": user_data["password"]}
        login_response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        
        if login_response.status_code == 200:
            print(f"   ✅ Login with new password successful")
            # Update headers with new token
            token = login_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
        else:
            print(f"   ❌ Login with new password failed: {login_response.text}")
    except Exception as e:
        print(f"   ❌ Login error: {e}")
    
    # Step 6: Test account deletion
    print(f"\n6️⃣ Testing account deletion...")
    try:
        delete_data = {"password": user_data["password"]}
        delete_response = requests.delete(f"{API_BASE}/users/account", json=delete_data, headers=headers)
        print(f"   Account deletion status: {delete_response.status_code}")
        
        if delete_response.status_code == 200:
            print(f"   ✅ Account deleted successfully")
        else:
            print(f"   ❌ Account deletion failed: {delete_response.text}")
    except Exception as e:
        print(f"   ❌ Account deletion error: {e}")
    
    # Step 7: Verify account is deleted (login should fail)
    print(f"\n7️⃣ Verifying account deletion...")
    try:
        login_data = {"username": user_data["username"], "password": user_data["password"]}
        login_response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        
        if login_response.status_code == 401:
            print(f"   ✅ Account deletion verified (login failed as expected)")
        else:
            print(f"   ❌ Account may not be deleted (login status: {login_response.status_code})")
    except Exception as e:
        print(f"   ❌ Verification error: {e}")
    
    print(f"\n🎉 Settings API testing completed!")
    return True

def test_error_cases():
    """Test error handling in settings endpoints"""
    print("\n🔧 Testing Error Cases...")
    
    # Test with invalid token
    invalid_headers = {"Authorization": "Bearer invalid_token"}
    
    endpoints_to_test = [
        ("PUT", "/users/profile", {"username": "test"}),
        ("PUT", "/users/password", {"current_password": "old", "new_password": "new"}),
        ("DELETE", "/users/account", {"password": "test"})
    ]
    
    for method, endpoint, data in endpoints_to_test:
        try:
            if method == "PUT":
                response = requests.put(f"{API_BASE}{endpoint}", json=data, headers=invalid_headers)
            elif method == "DELETE":
                response = requests.delete(f"{API_BASE}{endpoint}", json=data, headers=invalid_headers)
            
            print(f"   {method} {endpoint}: {response.status_code} (expected 401/403)")
            
            if response.status_code in [401, 403]:
                print(f"      ✅ Proper authentication required")
            else:
                print(f"      ⚠️  Unexpected status code")
                
        except Exception as e:
            print(f"      ❌ Error: {e}")

if __name__ == "__main__":
    test_settings_functionality()
    test_error_cases()