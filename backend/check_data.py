from database import engine
from sqlalchemy import text

conn = engine.connect()

print("=== QUOTES BY EMOTION ===")
result = conn.execute(text('SELECT emotion, COUNT(*) FROM motivational_quotes GROUP BY emotion'))
for row in result:
    print(f"  {row[0]}: {row[1]}")

print("\n=== MUSIC BY EMOTION ===")
result = conn.execute(text('SELECT emotion, COUNT(*) FROM music_tracks GROUP BY emotion'))
for row in result:
    print(f"  {row[0]}: {row[1]}")

print("\n=== SAMPLE QUOTE ===")
result = conn.execute(text('SELECT emotion, english_translation, author FROM motivational_quotes LIMIT 1'))
for row in result:
    print(f"Emotion: {row[0]}")
    print(f"Quote: {row[1]}")
    print(f"Author: {row[2]}")

print("\n=== SAMPLE MUSIC ===")
result = conn.execute(text('SELECT emotion, title, artist FROM music_tracks LIMIT 1'))
for row in result:
    print(f"Emotion: {row[0]}")
    print(f"Title: {row[1]}")
    print(f"Artist: {row[2]}")

conn.close()
