import uvicorn
import sys
import os

if __name__ == "__main__":
    print("🚀 Starting Emotion Recognition API Server...")
    print("📍 Server will be available at: http://localhost:8003")
    print("📖 API Documentation: http://localhost:8003/docs")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8003,
            reload=False,  # Disable reload to avoid issues
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)