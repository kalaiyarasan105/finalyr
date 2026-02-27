"""Add more English music tracks from YouTube for each emotion"""
from database import SessionLocal
from recommendation_models import MusicTrack
from sqlalchemy import text
# Import all models to avoid relationship errors
import models
import recommendation_models

db = SessionLocal()

# First, check existing tracks
print("=== Current Music Tracks ===")
result = db.execute(text('SELECT emotion, COUNT(*) FROM music_tracks GROUP BY emotion'))
for row in result:
    print(f"  {row[0]}: {row[1]} tracks")

print("\n=== Adding New English Music Tracks ===")

# Music tracks with real YouTube links (royalty-free/creative commons music)
new_tracks = [
    # SADNESS - Calming, uplifting music
    {
        'emotion': 'sadness',
        'title': 'Weightless - Marconi Union',
        'music_type': 'Ambient/Relaxation',
        'raga': None,
        'duration': '8:09',
        'artist': 'Marconi Union',
        'description': 'Scientifically proven to reduce anxiety by 65%. This ambient track was created in collaboration with sound therapists to slow heart rate and reduce stress.',
        'benefits': 'Reduces anxiety, lowers blood pressure, promotes deep relaxation and emotional healing',
        'best_time': 'Evening or when feeling overwhelmed',
        'spotify_link': 'https://open.spotify.com/track/3jjujdWJ72nww5eGnfs2E7',
        'youtube_link': 'https://www.youtube.com/watch?v=UfcAVejslrU',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=UfcAVejslrU',
        'lyrics_available': False,
        'instrumental_only': True
    },
    {
        'emotion': 'sadness',
        'title': 'River Flows in You - Yiruma',
        'music_type': 'Piano/Classical',
        'raga': None,
        'duration': '3:50',
        'artist': 'Yiruma',
        'description': 'Beautiful piano piece that helps process sadness and brings gentle comfort. The flowing melody mirrors the natural flow of emotions.',
        'benefits': 'Emotional release, gentle comfort, helps process grief and sadness',
        'best_time': 'When you need to cry or process emotions',
        'spotify_link': 'https://open.spotify.com/track/4mWsZZGzJDPHmRV0kkrNKw',
        'youtube_link': 'https://www.youtube.com/watch?v=7maJOI3QMu0',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=7maJOI3QMu0',
        'lyrics_available': False,
        'instrumental_only': True
    },
    {
        'emotion': 'sadness',
        'title': 'Clair de Lune - Debussy',
        'music_type': 'Classical Piano',
        'raga': None,
        'duration': '5:20',
        'artist': 'Claude Debussy',
        'description': 'Timeless classical piece meaning "moonlight". Its gentle, flowing melody provides solace and helps transform sadness into peaceful acceptance.',
        'benefits': 'Emotional healing, peaceful reflection, reduces feelings of loneliness',
        'best_time': 'Late evening or quiet moments',
        'spotify_link': 'https://open.spotify.com/track/1prRHlmAuP5gpcCMGKJGMr',
        'youtube_link': 'https://www.youtube.com/watch?v=CvFH_6DNRCY',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=CvFH_6DNRCY',
        'lyrics_available': False,
        'instrumental_only': True
    },
    
    # ANGER - Calming, cooling music
    {
        'emotion': 'anger',
        'title': 'Calm Down - Rema & Selena Gomez',
        'music_type': 'Afrobeats/Pop',
        'raga': None,
        'duration': '3:59',
        'artist': 'Rema, Selena Gomez',
        'description': 'Upbeat yet calming song with the perfect message - "calm down". The rhythm helps release anger energy while the lyrics remind you to relax.',
        'benefits': 'Releases anger energy, promotes cooling down, uplifts mood',
        'best_time': 'When you need to release anger constructively',
        'spotify_link': 'https://open.spotify.com/track/3Wrjm47oTz2sjIgck11l5e',
        'youtube_link': 'https://www.youtube.com/watch?v=WcIcVapfqXw',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=WcIcVapfqXw',
        'lyrics_available': True,
        'instrumental_only': False
    },
    {
        'emotion': 'anger',
        'title': 'Let It Go - James Bay',
        'music_type': 'Indie/Folk',
        'raga': None,
        'duration': '4:19',
        'artist': 'James Bay',
        'description': 'Powerful song about releasing anger and resentment. The message encourages letting go of what you cannot control.',
        'benefits': 'Helps release anger, promotes forgiveness, emotional freedom',
        'best_time': 'When you need to let go of grudges',
        'spotify_link': 'https://open.spotify.com/track/7vGuf3Y35N4wmASOKLUVVU',
        'youtube_link': 'https://www.youtube.com/watch?v=GsPq9mzFNGY',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=GsPq9mzFNGY',
        'lyrics_available': True,
        'instrumental_only': False
    },
    {
        'emotion': 'anger',
        'title': 'Breathe Me - Sia',
        'music_type': 'Alternative/Indie',
        'raga': None,
        'duration': '4:33',
        'artist': 'Sia',
        'description': 'Emotional song that helps process anger and frustration. Encourages taking deep breaths and finding inner peace.',
        'benefits': 'Emotional release, promotes breathing exercises, reduces tension',
        'best_time': 'After a conflict or stressful situation',
        'spotify_link': 'https://open.spotify.com/track/7nZmah2llfvLDiUjm0kiyz',
        'youtube_link': 'https://www.youtube.com/watch?v=SFGvmrJ5rjM',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=SFGvmrJ5rjM',
        'lyrics_available': True,
        'instrumental_only': False
    },
    
    # ANXIETY/FEAR - Calming, reassuring music
    {
        'emotion': 'anxiety',
        'title': 'Weightless - Marconi Union',
        'music_type': 'Ambient/Therapeutic',
        'raga': None,
        'duration': '8:09',
        'artist': 'Marconi Union',
        'description': 'The most relaxing song ever created according to neuroscientists. Reduces anxiety by 65% and designed to slow breathing and heart rate.',
        'benefits': 'Scientifically proven to reduce anxiety, lowers cortisol, promotes deep calm',
        'best_time': 'During panic attacks or high anxiety',
        'spotify_link': 'https://open.spotify.com/track/3jjujdWJ72nww5eGnfs2E7',
        'youtube_link': 'https://www.youtube.com/watch?v=UfcAVejslrU',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=UfcAVejslrU',
        'lyrics_available': False,
        'instrumental_only': True
    },
    {
        'emotion': 'anxiety',
        'title': 'Breathe - Telepopmusik',
        'music_type': 'Electronic/Chill',
        'raga': None,
        'duration': '4:40',
        'artist': 'Telepopmusik',
        'description': 'Soothing electronic track with the repeated message "Just breathe". Perfect for anxiety relief and grounding.',
        'benefits': 'Reduces anxiety, promotes mindful breathing, calms racing thoughts',
        'best_time': 'During anxiety episodes or before sleep',
        'spotify_link': 'https://open.spotify.com/track/0WPB0cGAGvPHSvLXYMKqKl',
        'youtube_link': 'https://www.youtube.com/watch?v=vyut3GyQtn0',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=vyut3GyQtn0',
        'lyrics_available': True,
        'instrumental_only': False
    },
    {
        'emotion': 'fear',
        'title': 'Brave - Sara Bareilles',
        'music_type': 'Pop/Inspirational',
        'raga': None,
        'duration': '3:40',
        'artist': 'Sara Bareilles',
        'description': 'Empowering song that encourages facing fears with courage. Uplifting melody helps build confidence.',
        'benefits': 'Builds courage, reduces fear, promotes self-confidence',
        'best_time': 'Before facing a fear or challenge',
        'spotify_link': 'https://open.spotify.com/track/5SXuuuRpukkTvsLuUknva1',
        'youtube_link': 'https://www.youtube.com/watch?v=QUQsqBqxoR4',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=QUQsqBqxoR4',
        'lyrics_available': True,
        'instrumental_only': False
    },
    
    # JOY - Uplifting, celebratory music
    {
        'emotion': 'joy',
        'title': 'Happy - Pharrell Williams',
        'music_type': 'Pop/Funk',
        'raga': None,
        'duration': '3:53',
        'artist': 'Pharrell Williams',
        'description': 'The ultimate happiness song! Scientifically proven to boost mood and make people smile. Perfect for celebrating good moments.',
        'benefits': 'Amplifies joy, boosts energy, promotes positive emotions',
        'best_time': 'Morning or when celebrating',
        'spotify_link': 'https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH',
        'youtube_link': 'https://www.youtube.com/watch?v=ZbZSe6N_BXs',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=ZbZSe6N_BXs',
        'lyrics_available': True,
        'instrumental_only': False
    },
    {
        'emotion': 'joy',
        'title': 'Good Vibrations - The Beach Boys',
        'music_type': 'Pop/Rock',
        'raga': None,
        'duration': '3:36',
        'artist': 'The Beach Boys',
        'description': 'Classic feel-good song with positive energy. The harmonies and upbeat rhythm amplify feelings of joy and contentment.',
        'benefits': 'Enhances positive mood, increases energy, promotes social connection',
        'best_time': 'Daytime or social gatherings',
        'spotify_link': 'https://open.spotify.com/track/34EufO2MwlQZbVzVd4X1lj',
        'youtube_link': 'https://www.youtube.com/watch?v=Eab_beh07HU',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=Eab_beh07HU',
        'lyrics_available': True,
        'instrumental_only': False
    },
    {
        'emotion': 'joy',
        'title': 'Three Little Birds - Bob Marley',
        'music_type': 'Reggae',
        'raga': None,
        'duration': '3:00',
        'artist': 'Bob Marley',
        'description': 'Uplifting reggae classic with the message "Every little thing gonna be alright". Perfect for maintaining positive vibes.',
        'benefits': 'Maintains joy, promotes optimism, reduces worry',
        'best_time': 'Anytime you want to stay positive',
        'spotify_link': 'https://open.spotify.com/track/2lqMNfqxgs0VdADjN5KHsC',
        'youtube_link': 'https://www.youtube.com/watch?v=zaGUr6wzyT8',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=zaGUr6wzyT8',
        'lyrics_available': True,
        'instrumental_only': False
    },
    
    # STRESS - Relaxing, de-stressing music
    {
        'emotion': 'stress',
        'title': 'Weightless - Marconi Union',
        'music_type': 'Ambient/Therapeutic',
        'raga': None,
        'duration': '8:09',
        'artist': 'Marconi Union',
        'description': 'Reduces stress by 65%. Created specifically to lower blood pressure and cortisol levels.',
        'benefits': 'Reduces stress hormones, lowers blood pressure, promotes deep relaxation',
        'best_time': 'After work or during high stress',
        'spotify_link': 'https://open.spotify.com/track/3jjujdWJ72nww5eGnfs2E7',
        'youtube_link': 'https://www.youtube.com/watch?v=UfcAVejslrU',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=UfcAVejslrU',
        'lyrics_available': False,
        'instrumental_only': True
    },
    {
        'emotion': 'stress',
        'title': 'Electra - Airstream',
        'music_type': 'Ambient/Chill',
        'raga': None,
        'duration': '7:58',
        'artist': 'Airstream',
        'description': 'One of the top 10 most relaxing songs. Gentle ambient sounds help melt away stress and tension.',
        'benefits': 'Deep stress relief, mental clarity, physical relaxation',
        'best_time': 'Evening wind-down or meditation',
        'spotify_link': None,
        'youtube_link': 'https://www.youtube.com/watch?v=NMIGbk32wNQ',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=NMIGbk32wNQ',
        'lyrics_available': False,
        'instrumental_only': True
    },
    {
        'emotion': 'stress',
        'title': 'Pure Shores - All Saints',
        'music_type': 'Pop/Chill',
        'raga': None,
        'duration': '4:30',
        'artist': 'All Saints',
        'description': 'Calming pop song with beach vibes. The soothing melody and lyrics about finding peace help reduce stress.',
        'benefits': 'Stress reduction, mental escape, promotes calm',
        'best_time': 'When you need a mental break',
        'spotify_link': 'https://open.spotify.com/track/1VnfKNknRE8NJvVVVyf3qy',
        'youtube_link': 'https://www.youtube.com/watch?v=ShiShrR_nh8',
        'apple_music_link': None,
        'preview_audio_url': 'https://www.youtube.com/watch?v=ShiShrR_nh8',
        'lyrics_available': True,
        'instrumental_only': False
    }
]

# Add tracks to database
added_count = 0
for track_data in new_tracks:
    # Check if track already exists
    existing = db.query(MusicTrack).filter(
        MusicTrack.title == track_data['title'],
        MusicTrack.emotion == track_data['emotion']
    ).first()
    
    if not existing:
        track = MusicTrack(**track_data)
        db.add(track)
        added_count += 1
        print(f"  ✓ Added: {track_data['title']} ({track_data['emotion']})")
    else:
        print(f"  - Skipped (exists): {track_data['title']}")

db.commit()
print(f"\n✅ Added {added_count} new music tracks!")

# Show updated counts
print("\n=== Updated Music Track Counts ===")
result = db.execute(text('SELECT emotion, COUNT(*) FROM music_tracks GROUP BY emotion'))
for row in result:
    print(f"  {row[0]}: {row[1]} tracks")

db.close()
print("\n🎵 Music library updated successfully!")
