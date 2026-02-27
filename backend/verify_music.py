"""Verify the new English music tracks"""
from database import engine
from sqlalchemy import text

conn = engine.connect()

print("=== NEW ENGLISH MUSIC TRACKS ===\n")

# Show some of the new tracks with YouTube links
result = conn.execute(text('''
    SELECT title, artist, emotion, youtube_link, duration 
    FROM music_tracks 
    WHERE artist IN ('Marconi Union', 'Pharrell Williams', 'Sara Bareilles', 'Yiruma')
    ORDER BY emotion, title
'''))

for row in result:
    print(f"🎵 {row[0]}")
    print(f"   Artist: {row[1]}")
    print(f"   Emotion: {row[2]}")
    print(f"   Duration: {row[4]}")
    print(f"   YouTube: {row[3]}")
    print()

conn.close()
