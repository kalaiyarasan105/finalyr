import requests

# First, login to get a token
print("1. Logging in...")
login_response = requests.post('http://localhost:8000/auth/login', json={
    'username': 'test_user',
    'password': 'test123'
})

if login_response.status_code != 200:
    print(f"   ❌ Login failed: {login_response.status_code}")
    print(f"   Creating test user...")
    register_response = requests.post('http://localhost:8000/auth/register', json={
        'username': 'test_user',
        'email': 'test@example.com',
        'password': 'test123'
    })
    if register_response.status_code == 200:
        print("   ✓ User created, logging in again...")
        login_response = requests.post('http://localhost:8000/auth/login', json={
            'username': 'test_user',
            'password': 'test123'
        })

if login_response.status_code == 200:
    token = login_response.json()['access_token']
    print(f"   ✓ Logged in successfully")
    
    # Test recommendations endpoint
    print("\n2. Testing recommendations endpoint...")
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test anger/quotes
    print("   Testing: /api/recommendations/anger/quotes")
    response = requests.get('http://localhost:8000/api/recommendations/anger/quotes', headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success! Found {data.get('count', 0)} recommendations")
        if data.get('recommendations'):
            print(f"   First recommendation: {data['recommendations'][0].get('english_translation', 'N/A')[:50]}...")
    else:
        print(f"   ❌ Error: {response.text}")
    
    # Test anger/music
    print("\n   Testing: /api/recommendations/anger/music")
    response = requests.get('http://localhost:8000/api/recommendations/anger/music', headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success! Found {data.get('count', 0)} recommendations")
        if data.get('recommendations'):
            print(f"   First track: {data['recommendations'][0].get('title', 'N/A')}")
    else:
        print(f"   ❌ Error: {response.text}")
else:
    print(f"   ❌ Login failed: {login_response.text}")
