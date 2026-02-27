from database import engine
from sqlalchemy import text

conn = engine.connect()

# Check Siddha remedies
print("=== SIDDHA REMEDIES ===")
result = conn.execute(text('SELECT id, name_tamil, name_english, description FROM siddha_remedies LIMIT 3'))
for row in result:
    print(f"ID: {row[0]}")
    print(f"Tamil: {row[1]}")
    print(f"English: {row[2]}")
    print(f"Description: {row[3][:100] if row[3] else 'NONE'}...")
    print()

# Check Tamil idioms
print("\n=== TAMIL IDIOMS ===")
result = conn.execute(text('SELECT id, idiom_tamil, idiom_english, meaning FROM tamil_idioms LIMIT 2'))
for row in result:
    print(f"ID: {row[0]}")
    print(f"Tamil: {row[1]}")
    print(f"English: {row[2]}")
    print(f"Meaning: {row[3][:100] if row[3] else 'NONE'}...")
    print()

conn.close()
