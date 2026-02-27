from database import engine
from sqlalchemy import text

conn = engine.connect()

print("=== SIDDHA REMEDIES SCHEMA ===")
result = conn.execute(text('PRAGMA table_info(siddha_remedies)'))
for row in result:
    print(f"  {row[1]} ({row[2]})")

print("\n=== TAMIL IDIOMS SCHEMA ===")
result = conn.execute(text('PRAGMA table_info(tamil_idioms)'))
for row in result:
    print(f"  {row[1]} ({row[2]})")

conn.close()
