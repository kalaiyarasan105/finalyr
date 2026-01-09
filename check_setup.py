#!/usr/bin/env python3
"""
Setup verification script for Emotion Recognition App
"""
import sys
import subprocess
import importlib
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ required. Current version:", sys.version)
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True

def check_package(package_name, import_name=None):
    """Check if a Python package is installed"""
    if import_name is None:
        import_name = package_name
    
    try:
        importlib.import_module(import_name)
        print(f"✅ {package_name}")
        return True
    except ImportError:
        print(f"❌ {package_name} not installed")
        return False

def check_node():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ Node.js not found")
    return False

def check_npm():
    """Check if npm is installed"""
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ npm not found")
    return False

def check_files():
    """Check if required files exist"""
    required_files = [
        'backend/app.py',
        'backend/requirements.txt',
        'frontend/package.json',
        'frontend/src/App.js'
    ]
    
    all_exist = True
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} missing")
            all_exist = False
    
    return all_exist

def main():
    print("🔍 Checking Emotion Recognition App Setup...\n")
    
    print("📋 System Requirements:")
    python_ok = check_python_version()
    node_ok = check_node()
    npm_ok = check_npm()
    
    print("\n📁 File Structure:")
    files_ok = check_files()
    
    print("\n📦 Python Packages (Backend):")
    packages_to_check = [
        ('fastapi', 'fastapi'),
        ('uvicorn', 'uvicorn'),
        ('sqlalchemy', 'sqlalchemy'),
        ('transformers', 'transformers'),
        ('torch', 'torch'),
        ('PIL', 'PIL'),
    ]
    
    packages_ok = True
    for package, import_name in packages_to_check:
        if not check_package(package, import_name):
            packages_ok = False
    
    print("\n📊 Summary:")
    if all([python_ok, node_ok, npm_ok, files_ok]):
        print("✅ All system requirements met!")
        if packages_ok:
            print("✅ All Python packages installed!")
            print("\n🚀 Ready to run the application!")
            print("\nNext steps:")
            print("1. Backend: cd backend && python start.py")
            print("2. Frontend: cd frontend && npm start")
        else:
            print("⚠️  Some Python packages missing. Run: pip install -r backend/requirements.txt")
    else:
        print("❌ Some requirements not met. Please install missing components.")
        
    print("\n📚 For detailed setup instructions, see README.md")

if __name__ == "__main__":
    main()