"""Update existing conversations with titles from their first user message"""
from database import SessionLocal
from models import Conversation, Message
from sqlalchemy import text

db = SessionLocal()

print("=== Updating Conversation Titles ===\n")

# Get all conversations
conversations = db.query(Conversation).all()

updated_count = 0
for conv in conversations:
    # Skip if already has a meaningful title (not "New Conversation")
    if conv.title and conv.title != "New Conversation":
        print(f"  ✓ Skipped: '{conv.title}' (already has title)")
        continue
    
    # Get first user message
    first_message = db.query(Message).filter(
        Message.conversation_id == conv.id,
        Message.is_user_message == True
    ).order_by(Message.created_at.asc()).first()
    
    if first_message and first_message.content:
        # Create title from first message
        title_text = first_message.content.strip()
        
        # Skip if it's just an image placeholder
        if title_text == "[Image]":
            title_text = "Image conversation"
        
        # Limit to 50 characters
        if len(title_text) > 50:
            title_text = title_text[:47] + "..."
        
        # Update conversation title
        conv.title = title_text
        updated_count += 1
        print(f"  ✓ Updated: Conversation {conv.id} → '{title_text}'")
    else:
        print(f"  - Skipped: Conversation {conv.id} (no user messages)")

db.commit()
print(f"\n✅ Updated {updated_count} conversation titles!")

db.close()
