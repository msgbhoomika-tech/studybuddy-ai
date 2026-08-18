import streamlit as st
from google import genai
from google.genai import types
import pypdf
from PIL import Image
from gtts import gTTS
import io
import base64
import sqlite3
import datetime
import json
import urllib.parse
import time

# 1. PAGE CONFIGURATION
st.set_page_config(page_title="StudyBuddy ✨", page_icon="🔮", layout="wide")

# ----------------------------------------------------
# HIGH-CONTRAST DARK PASTEL & GLOWING LILAC THEME
# ----------------------------------------------------
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');
    
    html, body, [class*="css"], .stApp {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background-color: #13111c !important;
        color: #f1f5f9 !important;
    }
    
    .stApp {
        background: radial-gradient(circle at 50% 0%, #231d38 0%, #151221 60%, #0d0b14 100%) !important;
    }
    
    p, span, label, .stMarkdown {
        color: #f1f5f9 !important;
    }
    
    .hero-container {
        background: linear-gradient(135deg, #4c1d95 0%, #6b21a8 50%, #9d174d 100%);
        padding: 30px 35px;
        border-radius: 24px;
        color: #ffffff !important;
        margin-bottom: 25px;
        box-shadow: 0 15px 35px rgba(107, 33, 168, 0.4);
        border: 1px solid rgba(216, 180, 254, 0.25);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
    }
    
    .hero-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 32px;
        font-weight: 700;
        margin: 0;
        color: #ffffff !important;
        letter-spacing: -0.5px;
    }
    
    .hero-badge {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .glass-card {
        background: #201a33 !important;
        border: 1.5px solid #433363 !important;
        border-radius: 20px;
        padding: 22px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        margin-bottom: 20px;
    }
    
    .glass-card h3 {
        color: #e9d5ff !important;
    }
    
    .glass-card p {
        color: #cbd5e1 !important;
    }
    
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background-color: #1b162b !important;
        padding: 8px;
        border-radius: 16px;
        border: 1.5px solid #3b2d59 !important;
    }
    
    .stTabs [data-baseweb="tab"] {
        height: 42px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        color: #c084fc !important;
        padding: 0 16px;
    }
    
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 14px rgba(147, 51, 234, 0.4) !important;
    }
    
    .stButton > button {
        background: linear-gradient(135deg, #8b5cf6 0%, #c026d3 100%) !important;
        color: #ffffff !important;
        font-weight: 700;
        border: none !important;
        border-radius: 14px;
        padding: 12px 24px;
        transition: all 0.25s ease;
        box-shadow: 0 6px 18px rgba(139, 92, 246, 0.4);
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(192, 38, 211, 0.55);
        color: #ffffff !important;
    }
    
    .stTextInput input, .stTextArea textarea, .stSelectbox > div {
        background-color: #211c33 !important;
        color: #ffffff !important;
        border-radius: 14px !important;
        border: 1.5px solid #4c3870 !important;
    }
    
    .stTextInput input:focus, .stTextArea textarea:focus {
        border-color: #a855f7 !important;
        box-shadow: 0 0 10px rgba(168, 85, 247, 0.3) !important;
    }
    
    .stProgress > div > div > div > div {
        background: linear-gradient(90deg, #a855f7 0%, #ec4899 100%);
        border-radius: 10px;
    }
</style>
""", unsafe_allow_html=True)

# Aesthetic Hero Header
st.markdown("""
<div class="hero-container">
    <div>
        <div class="hero-badge">✨ AI STUDY OS • DARK PASTEL EDITION</div>
        <h1 class="hero-title" style="margin-top: 8px;">StudyBuddy ✨</h1>
        <p style="margin: 6px 0 0 0; color: #f3e8ff !important; font-size: 15px;">Your high-yield university exam prep, live doubt solver & Feynman voice companion.</p>
    </div>
    <div style="text-align: right; margin-top: 10px;">
        <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 12px; font-weight: 700; color: #ffffff;">⚡ 100% Exam Locked-In</span>
    </div>
</div>
""", unsafe_allow_html=True)

# ----------------------------------------------------
# DATABASE INITIALIZATION & GAMIFICATION (SQLite)
# ----------------------------------------------------
def init_db():
    conn = sqlite3.connect("study_tracker.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS quiz_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT,
            topic TEXT,
            score INTEGER,
            total INTEGER,
            timestamp TEXT
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS user_gamification (
            id INTEGER PRIMARY KEY,
            xp INTEGER,
            last_active_date TEXT,
            current_streak INTEGER
        )
    """)
    c.execute("SELECT COUNT(*) FROM user_gamification")
    if c.fetchone()[0] == 0:
        today_str = datetime.datetime.now().strftime("%Y-%m-%d")
        c.execute("INSERT INTO user_gamification (id, xp, last_active_date, current_streak) VALUES (1, 0, ?, 1)", (today_str,))
    conn.commit()
    conn.close()

def add_xp(points_to_add):
    conn = sqlite3.connect("study_tracker.db")
    c = conn.cursor()
    c.execute("SELECT xp, last_active_date, current_streak FROM user_gamification WHERE id = 1")
    row = c.fetchone()
    current_xp, last_date, streak = row[0], row[1], row[2]
    
    today = datetime.datetime.now().date()
    last_active = datetime.datetime.strptime(last_date, "%Y-%m-%d").date() if last_date else today
    
    diff_days = (today - last_active).days
    if diff_days == 1:
        streak += 1
    elif diff_days > 1:
        streak = 1
        
    new_xp = current_xp + points_to_add
    c.execute("""
        UPDATE user_gamification
        SET xp = ?, last_active_date = ?, current_streak = ?
        WHERE id = 1
    """, (new_xp, today.strftime("%Y-%m-%d"), streak))
    conn.commit()
    conn.close()

def get_gamification_stats():
    conn = sqlite3.connect("study_tracker.db")
    c = conn.cursor()
    c.execute("SELECT xp, last_active_date, current_streak FROM user_gamification WHERE id = 1")
    row = c.fetchone()
    conn.close()
    if not row:
        return 0, 1, 1, 0, "Novice Scholar"
    
    xp = row[0]
    streak = row[2]
    level = 1 + (xp // 100)
    xp_in_level = xp % 100
    
    if level == 1:
        rank = "🌱 Novice Scholar"
    elif level == 2:
        rank = "📖 Dedicated Learner"
    elif level == 3:
        rank = "⚡ Exam Tactician"
    elif level == 4:
        rank = "🧠 Concept Master"
    else:
        rank = "👑 Master of Academia"
        
    return xp, level, streak, xp_in_level, rank

def save_quiz_score(subject, topic, score, total):
    conn = sqlite3.connect("study_tracker.db")
    c = conn.cursor()
    c.execute("""
        INSERT INTO quiz_records (subject, topic, score, total, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (subject, topic, score, total, datetime.datetime.now().strftime("%Y-%m-%d %H:%M")))
    conn.commit()
    conn.close()
    
    earned_xp = 50 + (50 if score == total else (score * 10))
    add_xp(earned_xp)
    return earned_xp

def get_all_records():
    conn = sqlite3.connect("study_tracker.db")
    c = conn.cursor()
    c.execute("SELECT subject, topic, score, total, timestamp FROM quiz_records ORDER BY id DESC")
    rows = c.fetchall()
    conn.close()
    return rows

init_db()

# 2. SIDEBAR API KEY & HIGH-CONTRAST STATS DISPLAY
api_key = st.sidebar.text_input("🔑 Enter Gemini API Key:", type="password")

if not api_key:
    st.info("👈 Enter your Gemini API Key in the sidebar to start studying ✨")
    st.stop()

total_xp, user_lvl, user_streak, xp_prog, user_rank = get_gamification_stats()
st.sidebar.markdown(f"""
<div style="background: #251d38; padding: 18px; border-radius: 18px; border: 1.5px solid #5a3d8a; margin-top: 10px;">
    <span style="font-size: 11px; font-weight: 800; color: #c084fc; letter-spacing: 1px;">STUDENT PROFILE</span>
    <h3 style="margin: 4px 0 0 0; color: #f8fafc; font-size: 18px;">Level {user_lvl} • {user_rank}</h3>
    <p style="font-size: 13px; color: #e2e8f0; margin: 4px 0 10px 0;">🔥 <b>{user_streak} Day Streak</b> • ⭐ <b>{total_xp} XP</b></p>
</div>
""", unsafe_allow_html=True)
st.sidebar.progress(xp_prog / 100)
st.sidebar.caption(f"{xp_prog}/100 XP to Level {user_lvl + 1}")

client = genai.Client(api_key=api_key)

# Resilient AI Engine with Automatic High-Demand / 503 Retries & Fallback
def generate_ai_content(contents, json_mime=False):
    models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"]
    config = types.GenerateContentConfig(response_mime_type="application/json") if json_mime else None
    
    last_error = None
    for model_name in models:
        for attempt in range(2):
            try:
                return client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config
                )
            except Exception as e:
                err_str = str(e)
                last_error = e
                if "503" in err_str or "UNAVAILABLE" in err_str:
                    time.sleep(1.5)  # brief pause for Google server traffic spike
                    continue
                else:
                    break
    raise last_error

# Session States
if "current_study_guide" not in st.session_state:
    st.session_state.current_study_guide = None
if "current_study_raw_text" not in st.session_state:
    st.session_state.current_study_raw_text = ""
if "inline_quiz_data" not in st.session_state:
    st.session_state.inline_quiz_data = None
if "inline_doubt_history" not in st.session_state:
    st.session_state.inline_doubt_history = []
if "standalone_doubt_history" not in st.session_state:
    st.session_state.standalone_doubt_history = []
if "quiz_submission_result" not in st.session_state:
    st.session_state.quiz_submission_result = None
if "video_query_index" not in st.session_state:
    st.session_state.video_query_index = 0

def render_mermaid(diagram_code):
    html_code = f"""
    <div class="mermaid" style="background:#ffffff; padding: 20px; border-radius: 16px; border: 1.5px solid #8b5cf6; display:flex; justify-content:center;">
        {diagram_code}
    </div>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({{ startOnLoad: true, theme: 'default' }});
    </script>
    """
    st.components.v1.html(html_code, height=350, scrolling=True)

def extract_input_data(input_method_key):
    st.markdown("##### 📥 Input Source (Upload notes or let AI generate from scratch)")
    choice = st.radio(
        "Choose input style:",
        ["No File (Let AI Generate from Syllabus)", "Paste Text / Notes", "Upload PDF", "Upload Blackboard Photo / Diagram"],
        horizontal=True,
        key=f"method_{input_method_key}"
    )
    text_content = ""
    image_content = None
    
    if choice == "Paste Text / Notes":
        text_content = st.text_area("Paste notes here:", height=130, key=f"text_{input_method_key}")
    elif choice == "Upload PDF":
        pdf_file = st.file_uploader("Upload PDF file", type=["pdf"], key=f"pdf_{input_method_key}")
        if pdf_file:
            reader = pypdf.PdfReader(pdf_file)
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    text_content += t + "\n"
            st.success(f"✨ Extracted {len(reader.pages)} page(s) successfully!")
    elif choice == "Upload Blackboard Photo / Diagram":
        img_file = st.file_uploader("Upload photo / diagram", type=["png", "jpg", "jpeg"], key=f"img_{input_method_key}")
        if img_file:
            image_content = Image.open(img_file)
            st.image(image_content, caption="Uploaded Material", width=250)
            
    return text_content, image_content

# 3. TABS
tab1, tab2, tab3, tab4, tab5, tab6, tab7, tab8, tab9 = st.tabs([
    "📚 Study Flow",
    "⏱️ Focus Timer",
    "⚡ Visuals & Cheats",
    "🏛️ Exam PYQ Bank",
    "🎮 XP Mastery",
    "👩‍🏫 Doubt Hub",
    "⏳ 2-Hr Cram", 
    "🧑‍🏫 Feynman Mode", 
    "🎧 Commute Audio"
])

# ----------------------------------------------------
# TAB 1: STUDY GUIDE & QUIZ
# ----------------------------------------------------
with tab1:
    st.markdown("""
    <div class="glass-card">
        <h3 style="margin:0; color:#e9d5ff;">📚 Intelligent Study Guide & Instant Quiz</h3>
        <p style="margin:4px 0 0 0; color:#cbd5e1; font-size:14px;">Generate structured exam answers, YouTube video links, doubts & auto-graded quizzes.</p>
    </div>
    """, unsafe_allow_html=True)
    
    col_sub1, col_sub2 = st.columns(2)
    with col_sub1:
        current_subject = st.text_input("Subject Name:", value="Data Structures & Algorithms", key="study_subject")
    with col_sub2:
        current_topic = st.text_input("Topic Name:", value="Binary Search", key="study_topic")
        
    text_data_1, img_data_1 = extract_input_data("tab1")

    col1, col2 = st.columns(2)
    with col1:
        mode = st.selectbox("Select Learning Mode:", [
            "Simplified Concept (Easy English for Beginners)",
            "10-Mark University Exam Structured Answer (Headings, Diagram Outlines, Key Points)",
            "3-Bullet High-Yield Summary"
        ])
    with col2:
        include_quiz = st.checkbox("Generate Interactive Quiz below summary", value=True)

    if st.button("✨ Cook My Study Guide", key="btn_tab1"):
        if current_subject.strip() and current_topic.strip():
            with st.spinner("Prof. Lara is crafting your study pack..."):
                try:
                    contents = []
                    if img_data_1:
                        contents.append(img_data_1)
                    if text_data_1:
                        contents.append(f"Student's Uploaded Notes/Text:\n{text_data_1}\n")
                    
                    context_instruction = (
                        "Use the provided uploaded notes/image as reference." 
                        if (text_data_1 or img_data_1) 
                        else f"No notes uploaded. Teach the most high-yield exam concepts for '{current_topic}' in '{current_subject}' from scratch."
                    )
                    
                    prompt = f"""
                    Act as Prof. Lara, a friendly, top-rated university professor.
                    Subject: {current_subject}
                    Topic: {current_topic}
                    {context_instruction}
                    Style requirement: {mode}.
                    Structure your explanation with clear key points, intuitive intuition, and exam-focused takeaways.
                    """
                    contents.append(prompt)
                    response = generate_ai_content(contents)
                    
                    st.session_state.current_study_guide = response.text
                    st.session_state.current_study_raw_text = text_data_1 if text_data_1 else f"{current_subject} - {current_topic}"
                    st.session_state.inline_doubt_history = []
                    st.session_state.quiz_submission_result = None
                    st.session_state.video_query_index = 0
                    
                    if include_quiz:
                        quiz_prompt = f"""
                        Based on the topic '{current_topic}' in '{current_subject}' and this lesson:
                        {response.text}
                        Generate a 3-question multiple choice practice quiz.
                        Return ONLY valid JSON array with schema:
                        [
                            {{
                                "question": "question text",
                                "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"],
                                "answer": "A) opt1",
                                "explanation": "Brief reason why A is correct..."
                            }}
                        ]
                        """
                        raw_quiz = generate_ai_content(quiz_prompt, json_mime=True)
                        st.session_state.inline_quiz_data = {
                            "subject": current_subject,
                            "topic": current_topic,
                            "questions": json.loads(raw_quiz.text)
                        }
                    else:
                        st.session_state.inline_quiz_data = None
                        
                    st.rerun()
                except Exception as e:
                    st.error(f"Error processing: {e}")
        else:
            st.warning("Please enter both Subject Name and Topic Name!")

    if st.session_state.current_study_guide:
        st.markdown("---")
        st.markdown("### 📝 Generated Study Pack")
        st.write(st.session_state.current_study_guide)
        
        st.download_button(
            label="📥 Download Study Pack (.txt)",
            data=st.session_state.current_study_guide,
            file_name="study_pack.txt",
            mime="text/plain"
        )
        
        st.markdown("---")
        st.markdown("### 🎥 Recommended YouTube Video")
        
        video_queries = [
            f"{current_topic} {current_subject} detailed explanation",
            f"{current_topic} visual animation tutorial",
            f"{current_topic} one shot revision in 10 minutes"
        ]
        
        selected_search = video_queries[st.session_state.video_query_index % len(video_queries)]
        yt_search_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(selected_search)}"
        
        col_v1, col_v2 = st.columns([3, 1])
        with col_v1:
            st.info(f"🔍 Recommended Search: **{selected_search}**")
            st.link_button("▶️ Open YouTube Tutorial", yt_search_url)
        with col_v2:
            if st.button("🔄 Next Video Angle"):
                st.session_state.video_query_index += 1
                st.rerun()

        # Inline Doubt
        st.markdown("---")
        st.markdown("""
        <div style="background: #251d38; padding: 18px; border-radius: 16px; border-left: 5px solid #a855f7; margin-bottom: 15px;">
            <h4 style="margin: 0; color: #f8fafc;">💬 Got a Doubt? Ask Prof. Lara before the Quiz (+10 XP)</h4>
            <p style="margin: 4px 0 0 0; color: #cbd5e1; font-size: 13px;">Clear any confusion right now.</p>
        </div>
        """, unsafe_allow_html=True)
        
        inline_query = st.text_input("Type your doubt:", placeholder="e.g., Can you explain point 2 with a simpler real-world example?", key="inline_doubt_input")
        
        if st.button("🙋‍♀️ Clear My Doubt", key="btn_inline_doubt"):
            if inline_query.strip():
                with st.spinner("Prof. Lara is thinking..."):
                    try:
                        doubt_prompt = f"""
                        You are Prof. Lara. A student is studying:
                        {st.session_state.current_study_guide}
                        The student asks: "{inline_query.strip()}"
                        Provide a clear, encouraging, friendly explanation with an exam pro-tip.
                        """
                        doubt_resp = generate_ai_content(doubt_prompt)
                        st.session_state.inline_doubt_history.append({"q": inline_query.strip(), "a": doubt_resp.text})
                        add_xp(10)
                        st.rerun()
                    except Exception as e:
                        st.error(f"Error: {e}")
                        
        if st.session_state.inline_doubt_history:
            for item in reversed(st.session_state.inline_doubt_history):
                with st.chat_message("user", avatar="🎓"):
                    st.write(item["q"])
                with st.chat_message("assistant", avatar="👩‍🏫"):
                    st.write(item["a"])

        # Quiz
        if st.session_state.inline_quiz_data:
            st.markdown("---")
            q_info = st.session_state.inline_quiz_data
            st.markdown(f"### 🎯 Practice Quiz: {q_info['topic']} (Earn +100 XP)")
            
            with st.form("inline_quiz_form"):
                user_selections = {}
                for idx, q in enumerate(q_info["questions"]):
                    st.markdown(f"**Q{idx+1}: {q['question']}**")
                    user_selections[idx] = st.radio(f"Option for Q{idx+1}:", q["options"], key=f"inline_q_{idx}")
                    st.write("")
                
                submitted = st.form_submit_button("✅ Submit Answers & Claim XP")
                if submitted:
                    score = 0
                    results_breakdown = []
                    for idx, q in enumerate(q_info["questions"]):
                        user_ans = user_selections[idx]
                        is_correct = (user_ans == q["answer"])
                        if is_correct:
                            score += 1
                        results_breakdown.append({
                            "question": q["question"],
                            "user_answer": user_ans,
                            "correct_answer": q["answer"],
                            "is_correct": is_correct,
                            "explanation": q.get("explanation", "Review the concept notes above.")
                        })
                    
                    total = len(q_info["questions"])
                    xp_earned = save_quiz_score(q_info["subject"], q_info["topic"], score, total)
                    
                    st.session_state.quiz_submission_result = {
                        "score": score,
                        "total": total,
                        "xp_earned": xp_earned,
                        "breakdown": results_breakdown
                    }
                    st.rerun()
                    
            if st.session_state.quiz_submission_result:
                res = st.session_state.quiz_submission_result
                pct = int((res["score"] / res["total"]) * 100)
                
                st.markdown("### 📋 Quiz Corrections Breakdown")
                if res["score"] == res["total"]:
                    st.balloons()
                    st.success(f"🌟 Perfect Score! You got {res['score']}/{res['total']} ({pct}%). Claimed **+{res['xp_earned']} XP**!")
                else:
                    st.info(f"📊 Final Score: **{res['score']} / {res['total']} ({pct}%)** — Earned **+{res['xp_earned']} XP**!")
                
                for idx, item in enumerate(res["breakdown"]):
                    if item["is_correct"]:
                        st.success(f"**Q{idx+1}: {item['question']}**\n\n✅ **Your Answer:** {item['user_answer']}\n\n💡 *{item['explanation']}*")
                    else:
                        st.error(f"**Q{idx+1}: {item['question']}**\n\n❌ **Your Answer:** {item['user_answer']}\n\n🟢 **Correct Answer:** {item['correct_answer']}\n\n💡 **Explanation:** *{item['explanation']}*")

# ----------------------------------------------------
# TAB 2: DEEP FOCUS TIMER
# ----------------------------------------------------
with tab2:
    st.markdown("""
    <div class="glass-card">
        <h3 style="margin:0; color:#e9d5ff;">⏱️ Pomodoro Focus Companion</h3>
        <p style="margin:4px 0 0 0; color:#cbd5e1; font-size:14px;">Lock in for deep study blocks. Receive milestone GIF badges and claim <b>+50 XP</b> upon completion.</p>
    </div>
    """, unsafe_allow_html=True)
    
    col_t_set1, col_t_set2 = st.columns([1, 2])
    with col_t_set1:
        target_subject_timer = st.text_input("Study Task / Topic:", value="Operating Systems Revision", key="timer_task")
        focus_minutes = st.number_input("Duration (Minutes):", min_value=1, max_value=120, value=25, step=5)
    
    with col_t_set2:
        st.markdown("""
        <div style="background: #251d38; border-left: 5px solid #d946ef; padding: 18px; border-radius: 14px; margin-top: 25px;">
            <p style="color: #f8fafc !important; font-size: 14px; margin: 0; font-weight: 600;">
                ✨ <b>Deep Flow Mode:</b> No tab-hopping, no phone notifications. Let the dynamic companion guide your sprint!
            </p>
        </div>
        """, unsafe_allow_html=True)
        
    start_timer_btn = st.button("🚀 Start Deep Flow Session", key="btn_start_focus")
    
    if start_timer_btn:
        total_seconds = int(focus_minutes * 60)
        start_time = time.time()
        
        timer_placeholder = st.empty()
        sticker_placeholder = st.empty()
        progress_placeholder = st.empty()
        quote_placeholder = st.empty()
        
        while True:
            elapsed = time.time() - start_time
            remaining = total_seconds - elapsed
            
            if remaining <= 0:
                break
                
            fraction_done = elapsed / total_seconds
            mins_left = int(remaining // 60)
            secs_left = int(remaining % 60)
            time_display = f"{mins_left:02d}:{secs_left:02d}"
            
            if fraction_done < 0.30:
                stage_gif = "https://media.giphy.com/media/LmN8OYiY4m0X85al0A/giphy.gif"
                stage_badge = "🚀 STAGE 1: GETTING INTO THE FLOW"
                stage_grad = "linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)"
                motivation_msg = f"✨ Setting the vibe for '{target_subject_timer}'! Lock in."
            elif fraction_done < 0.80:
                stage_gif = "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
                stage_badge = "🔥 STAGE 2: UNSTOPPABLE FLOW STATE"
                stage_grad = "linear-gradient(135deg, #be185d 0%, #e11d48 100%)"
                motivation_msg = "⚡ Halfway mark! You're turning tough concepts into permanent memory."
            else:
                stage_gif = "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif"
                stage_badge = "⚡ STAGE 3: THE FINAL COUNTDOWN"
                stage_grad = "linear-gradient(135deg, #047857 0%, #0d9488 100%)"
                motivation_msg = "🏁 Almost done! Finish strong and claim your +50 XP!"
                
            timer_placeholder.markdown(f"""
            <div style="text-align: center; background: {stage_grad}; color: white; padding: 28px; border-radius: 24px; margin: 15px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                <span style="font-size: 13px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; color: #ffffff !important;">{stage_badge}</span>
                <h1 style="font-size: 72px; margin: 10px 0; color: #ffffff !important; font-family: 'Space Grotesk', monospace; font-weight: 700;">{time_display}</h1>
                <p style="font-size: 16px; margin: 0; color: #ffffff !important;">Currently Mastering: <b>{target_subject_timer}</b></p>
            </div>
            """, unsafe_allow_html=True)
            
            sticker_placeholder.markdown(f"""
            <div style="text-align: center; margin: 10px 0;">
                <img src="{stage_gif}" style="border-radius: 20px; max-height: 200px; box-shadow: 0 8px 20px rgba(0,0,0,0.3);" />
            </div>
            """, unsafe_allow_html=True)
            
            progress_placeholder.progress(min(fraction_done, 1.0))
            quote_placeholder.info(motivation_msg)
            
            time.sleep(1)
            
        timer_placeholder.empty()
        sticker_placeholder.empty()
        progress_placeholder.empty()
        quote_placeholder.empty()
        
        st.balloons()
        add_xp(50)
        st.success(f"🎉 **Sprint Completed!** You finished {focus_minutes} mins on '{target_subject_timer}'. **+50 XP** added to your profile!")
        st.markdown("""
        <div style="text-align: center; margin-top: 15px;">
            <img src="https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif" style="border-radius: 20px; max-height: 220px;" />
            <h3 style="color: #c084fc; margin-top: 10px;">Hydrate, stretch for 5 minutes, and come back whenever you're ready!</h3>
        </div>
        """, unsafe_allow_html=True)

# ----------------------------------------------------
# TAB 3: VISUALS, TRACE TABLES & CHEAT SHEETS
# ----------------------------------------------------
with tab3:
    st.markdown("""
    <div class="glass-card">
        <h3 style="margin:0; color:#e9d5ff;">⚡ Visual Diagrams, Trace Tables & Cheat Sheets</h3>
        <p style="margin:4px 0 0 0; color:#cbd5e1; font-size:14px;">Generate interactive Mermaid diagrams, algorithm dry-run tables, and 15-minute formula cheat sheets.</p>
    </div>
    """, unsafe_allow_html=True)
    
    toolkit_choice = st.radio(
        "Choose generation mode:",
        [
            "📐 Exam Flowchart & Architecture Diagram",
            "⚡ 15-Minute Last-Minute Cheat Sheet",
            "🧪 Algorithm / Code Step-by-Step Dry-Run Table"
        ],
        horizontal=True
    )
    
    col_t1, col_t2 = st.columns(2)
    with col_t1:
        tk_subject = st.text_input("Subject:", value="Data Structures & Algorithms", key="tk_sub")
    with col_t2:
        tk_topic = st.text_input("Topic / Algorithm:", value="Binary Search Tree Insertion", key="tk_top")
        
    tk_text, tk_img = extract_input_data("toolkit_tab")
    
    if st.button("✨ Generate Visual / Tabular Asset", key="btn_toolkit_generate"):
        if tk_subject.strip() and tk_topic.strip():
            with st.spinner("Rendering exam asset..."):
                try:
                    contents = []
                    if tk_img:
                        contents.append(tk_img)
                    if tk_text:
                        contents.append(f"Reference Notes/Code:\n{tk_text}\n")
                        
                    if "Diagram" in toolkit_choice:
                        prompt = f"""
                        Subject: {tk_subject}
                        Topic: {tk_topic}
                        Provide:
                        1. A clean, valid Mermaid.js flowchart or architecture diagram code block inside ```mermaid ``` fences.
                        2. An ASCII text-box diagram (easy to copy and draw on physical exam paper with a pencil).
                        3. A 3-bullet description of key components to label.
                        """
                    elif "Cheat Sheet" in toolkit_choice:
                        prompt = f"""
                        Subject: {tk_subject}
                        Topic: {tk_topic}
                        Generate a high-density, no-fluff "15-Minute Exam Hall Survival Sheet".
                        Format with:
                        - 📊 Markdown Table: Core Definitions & High-Yield Keywords
                        - 🧮 Markdown Table: Key Formulas / Equations / Time & Space Complexities
                        - ⚠️ Top 3 Traps & Exam Mistakes to Avoid
                        - 💡 One-Line Golden Summary
                        """
                    else:
                        prompt = f"""
                        Subject: {tk_subject}
                        Topic / Algorithm / Code: {tk_topic}
                        Generate a comprehensive, step-by-step dry run trace table.
                        Format with:
                        1. Sample input.
                        2. Markdown Trace Table with columns: (Step / Iteration | Variables State | Condition Evaluated | Action Taken).
                        3. Final Output & Time/Space Complexity.
                        """
                        
                    contents.append(prompt)
                    tk_res = generate_ai_content(contents)
                    
                    st.markdown("---")
                    if "```mermaid" in tk_res.text:
                        try:
                            mermaid_code = tk_res.text.split("```mermaid")[1].split("```")[0].strip()
                            st.markdown("### 🎨 Interactive Mermaid Architecture")
                            render_mermaid(mermaid_code)
                        except Exception:
                            pass
                        
                    st.markdown("### 📜 Full Exam Output")
                    st.write(tk_res.text)
                    
                    st.download_button(
                        label="📥 Download Asset (.txt)",
                        data=tk_res.text,
                        file_name=f"{tk_topic}_Asset.txt",
                        mime="text/plain"
                    )
                except Exception as e:
                    st.error(f"Error: {e}")
        else:
            st.warning("Please enter Subject and Topic!")

# ----------------------------------------------------
# TAB 4: UNIVERSITY PYQ HUB
# ----------------------------------------------------
with tab4:
    st.markdown("""
    <div class="glass-card">
        <h3 style="margin:0; color:#e9d5ff;">🏛️ University Exam Bank & Module-wise PYQ Hub</h3>
        <p style="margin:4px 0 0 0; color:#cbd5e1; font-size:14px;">Generate high-probability 2, 5, and 10-mark questions with complete point-wise model answers.</p>
    </div>
    """, unsafe_allow_html=True)
    
    col_u1, col_u2, col_u3, col_u4 = st.columns(4)
    with col_u1:
        univ_name = st.selectbox("University Pattern:", ["VTU Scheme", "Autonomous College Scheme", "Anna University", "Mumbai University", "General Engineering"])
    with col_u2:
        sem_num = st.selectbox("Semester:", [f"Semester {i}" for i in range(1, 9)])
    with col_u3:
        target_subject = st.text_input("Subject:", value="Operating Systems", key="pyq_subj")
    with col_u4:
        target_module = st.selectbox("Module:", ["Module 1", "Module 2", "Module 3", "Module 4", "Module 5", "Entire Syllabus (Full Mock)"], key="pyq_mod")
        
    pyq_topics = st.text_area("Keywords / Topics in Module:", placeholder="e.g., Process Scheduling, Semaphores, Banker's Algorithm", key="pyq_topics_box")
    pyq_text, pyq_img = extract_input_data("pyq_tab")
    
    if st.button("🎯 Generate Predicted Exam Paper", key="btn_pyq"):
        if target_subject.strip():
            with st.spinner("Generating university exam paper & marking scheme..."):
                try:
                    contents = []
                    if pyq_img:
                        contents.append(pyq_img)
                    if pyq_text:
                        contents.append(f"Notes:\n{pyq_text}\n")
                        
                    pyq_prompt = f"""
                    You are a university exam paper setter for {univ_name}, {sem_num}.
                    Subject: {target_subject}
                    Module: {target_module}
                    Topics: {pyq_topics if pyq_topics.strip() else 'Standard syllabus'}
                    
                    Generate predicted exam questions with model answers:
                    - ⭐ High-Yield Exam Trends
                    - 📌 Section A: 3 x 2-Mark Questions (Crisp Definitions)
                    - 📌 Section B: 2 x 5-Mark Questions (Comparisons & Mechanisms)
                    - 📌 Section C: 2 x 10-Mark Questions (Comprehensive with headings & diagram notes)
                    """
                    contents.append(pyq_prompt)
                    pyq_res = generate_ai_content(contents)
                    
                    st.markdown("---")
                    st.write(pyq_res.text)
                    st.download_button("📥 Download PYQ Paper (.txt)", pyq_res.text, file_name=f"{target_subject}_PYQs.txt")
                except Exception as e:
                    st.error(f"Error: {e}")
        else:
            st.warning("Please enter Subject Name!")

# ----------------------------------------------------
# TAB 5: GAMIFIED MASTERY & PROGRESS
# ----------------------------------------------------
with tab5:
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #4c1d95 0%, #701a75 100%); color: white; padding: 26px; border-radius: 20px; margin-bottom: 20px; border: 1.5px solid #5a3d8a; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; color: #ffffff;">ACTIVE SCHOLAR</span>
                <h2 style="margin: 6px 0 0 0; color: #ffffff !important; font-family: 'Space Grotesk';">Level {user_lvl} — {user_rank}</h2>
                <p style="margin: 4px 0 0 0; color: #e2e8f0 !important;">Total Score: <b>{total_xp} XP</b> • Next Rank at <b>{(user_lvl * 100)} XP</b></p>
            </div>
            <div style="text-align: right; background: rgba(0,0,0,0.25); padding: 12px 22px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                <h3 style="margin: 0; color: #fde047; font-size: 24px;">🔥 {user_streak} Day Streak</h3>
                <span style="font-size: 13px; color: #cbd5e1 !important;">Consistency Score: 100%</span>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown(f"**XP Progress ({xp_prog} / 100 XP to Level {user_lvl + 1}):**")
    st.progress(xp_prog / 100)
    
    records = get_all_records()
    subject_stats = {}
    for sub, top, sc, tot, ts in records:
        if sub not in subject_stats:
            subject_stats[sub] = {"score": 0, "total": 0, "attempts": 0}
        subject_stats[sub]["score"] += sc
        subject_stats[sub]["total"] += tot
        subject_stats[sub]["attempts"] += 1
        
    st.markdown("---")
    if subject_stats:
        st.markdown("### 🎯 Subject Mastery Analytics")
        cols = st.columns(min(len(subject_stats), 3))
        col_idx = 0
        for sub, data in subject_stats.items():
            pct = int((data["score"] / data["total"]) * 100) if data["total"] > 0 else 0
            with cols[col_idx % len(cols)]:
                status_icon = "🟢" if pct >= 75 else ("🟡" if pct >= 50 else "🔴")
                st.metric(label=f"{sub}", value=f"{pct}% {status_icon}", delta=f"{data['attempts']} quizzes taken")
                st.progress(pct / 100)
            col_idx += 1
            
        st.markdown("---")
        st.markdown("### 📜 Recent Quiz History")
        history_data = [{"Date": ts, "Subject": sub, "Topic": top, "Score": f"{sc}/{tot} ({int(sc/tot*100)}%)"} for sub, top, sc, tot, ts in records]
        st.table(history_data[:6])
    else:
        st.info("👋 Take your first quiz in **Study Flow** to earn +50 XP and start tracking your analytics.")

# ----------------------------------------------------
# TAB 6: STANDALONE DOUBT SOLVER
# ----------------------------------------------------
with tab6:
    st.markdown("""
    <div style="background: linear-gradient(135deg, #3730a3 0%, #581c87 100%); color: white; padding: 22px; border-radius: 18px; margin-bottom: 20px; border: 1.5px solid #4f46e5;">
        <h3 style="margin: 0; color: #ffffff !important;">👩‍🏫 Meet Prof. Lara — 24/7 Doubt Hub</h3>
        <p style="margin: 4px 0 0 0; color: #e0e7ff !important; font-size: 14px;">Ask any question or upload an error screenshot for instant breakdown with analogies.</p>
    </div>
    """, unsafe_allow_html=True)
    
    col_d1, col_d2 = st.columns([2, 1])
    with col_d1:
        doubt_query = st.text_area("Type your question:", height=100, placeholder="e.g., Explain dynamic programming vs greedy approach with a simple analogy.")
    with col_d2:
        doubt_image_file = st.file_uploader("Upload error/code screenshot", type=["png", "jpg", "jpeg"], key="doubt_img_hub")
        doubt_img = None
        if doubt_image_file:
            doubt_img = Image.open(doubt_image_file)
            st.image(doubt_img, caption="Screenshot Attached", width=160)
            
    col_btn1, col_btn2 = st.columns([1, 4])
    with col_btn1:
        ask_btn = st.button("🙋‍♀️ Ask Lara", key="btn_ask_doubt_hub")
    with col_btn2:
        if st.button("🧹 Clear Chat", key="btn_clear_chat_hub"):
            st.session_state.standalone_doubt_history = []
            st.rerun()
            
    if ask_btn:
        if doubt_query.strip() or doubt_img is not None:
            with st.spinner("Prof. Lara is analyzing..."):
                try:
                    contents = []
                    if doubt_img:
                        contents.append(doubt_img)
                    if doubt_query.strip():
                        contents.append(doubt_query.strip())
                        
                    contents.append("You are Prof. Lara. Answer with: 1) Direct explanation, 2) Simple analogy, 3) Exam tip.")
                    response = generate_ai_content(contents)
                    
                    st.session_state.standalone_doubt_history.append({
                        "user": doubt_query if doubt_query.strip() else "[Uploaded screenshot]",
                        "bot": response.text
                    })
                    add_xp(10)
                except Exception as e:
                    st.error(f"Error: {e}")
        else:
            st.warning("Please type a doubt or upload an image!")
            
    if st.session_state.standalone_doubt_history:
        st.markdown("---")
        for chat in reversed(st.session_state.standalone_doubt_history):
            with st.chat_message("user", avatar="🎓"):
                st.write(chat["user"])
            with st.chat_message("assistant", avatar="👩‍🏫"):
                st.write(chat["bot"])

# ----------------------------------------------------
# TAB 7: 2-HOUR EMERGENCY CRAM
# ----------------------------------------------------
with tab7:
    st.markdown("""
    <div class="glass-card">
        <h3 style="margin:0; color:#e9d5ff;">⏳ 2-Hour Emergency Exam Cram Strategy</h3>
        <p style="margin:4px 0 0 0; color:#cbd5e1; font-size:14px;">High-yield triage: Minute-by-minute breakdown of what to study and what to skip to pass.</p>
    </div>
    """, unsafe_allow_html=True)
    
    col_c1, col_c2 = st.columns(2)
    with col_c1:
        subject = st.text_input("Subject Name:", placeholder="e.g., Operating Systems")
        hours_left = st.slider("Time Left Until Exam (Hours):", min_value=1, max_value=8, value=2)
    with col_c2:
        st.write("Syllabus / notes input below:")
    
    cram_text, cram_img = extract_input_data("cram")
        
    if st.button("⚡ Generate Cram Survival Schedule", key="btn_cram"):
        if subject:
            with st.spinner("Generating optimal triage plan..."):
                try:
                    contents = []
                    if cram_img:
                        contents.append(cram_img)
                    if cram_text:
                        contents.append(cram_text)
                    
                    contents.append(f"""
                    Exam on '{subject}' in {hours_left} hours.
                    Provide:
                    1. Minute-by-minute survival schedule.
                    2. Top 3 highest-yield predicted questions.
                    3. High-density cheat sheet.
                    4. What to SKIP to maximize marks.
                    """)
                    cram_res = generate_ai_content(contents)
                    st.markdown("---")
                    st.write(cram_res.text)
                except Exception as e:
                    st.error(f"Error: {e}")
        else:
            st.warning("Please enter Subject Name!")

# ----------------------------------------------------
# TAB 8: FEYNMAN VOICE LEARNING MODE
# ----------------------------------------------------
with tab8:
    st.markdown("""
    <div class="glass-card">
        <h3 style="margin:0; color:#e9d5ff;">🧑‍🏫 Teach Prof. Lara (Feynman Technique)</h3>
        <p style="margin:4px 0 0 0; color:#cbd5e1; font-size:14px;">Speak or type your conceptual explanation. AI listens, identifies knowledge gaps, and scores you out of 10.</p>
    </div>
    """, unsafe_allow_html=True)
    
    concept_topic = st.text_input("Topic Name (Optional):", placeholder="e.g., Binary Search")
    teach_mode = st.radio("Input mode:", ["🎙️ Voice (Speak into Mic)", "⌨️ Type Text"], horizontal=True)
    
    audio_data = None
    text_explanation = ""
    if teach_mode == "🎙️ Voice (Speak into Mic)":
        audio_data = st.audio_input("Record explanation out loud:")
    else:
        text_explanation = st.text_area("Type your explanation:", height=140)
        
    if st.button("🧑‍🏫 Grade My Explanation (+30 XP)", key="btn_feynman"):
        has_audio = audio_data is not None
        has_text = bool(text_explanation.strip())
        
        if has_audio or has_text:
            with st.spinner("Prof. Lara is analyzing your understanding..."):
                try:
                    contents = []
                    if has_audio:
                        audio_bytes = audio_data.read()
                        contents.append(types.Part.from_bytes(data=audio_bytes, mime_type="audio/wav"))
                    elif has_text:
                        contents.append(f"Explanation: {text_explanation}")
                        
                    contents.append(f"""
                    Topic: '{concept_topic}'
                    Evaluate student's explanation:
                    1. 🌟 What You Understood Correctly
                    2. ⚠️ Knowledge Gaps & Misconceptions
                    3. 💡 Better Analogy
                    4. 🎯 Concept Mastery Score (out of 10)
                    """)
                    feynman_res = generate_ai_content(contents)
                    add_xp(30)
                    st.markdown("---")
                    st.write(feynman_res.text)
                except Exception as e:
                    st.error(f"Error: {e}")
        else:
            st.warning("Please record your voice or type an explanation first!")

# ----------------------------------------------------
# TAB 9: COMMUTE AUDIO MODE
# ----------------------------------------------------
with tab9:
    st.markdown("""
    <div class="glass-card">
        <h3 style="margin:0; color:#e9d5ff;">🎧 Commute Audio Mode (Lara's Spoken Lessons)</h3>
        <p style="margin:4px 0 0 0; color:#cbd5e1; font-size:14px;">Generate friendly audio lectures with speed controls ($0.75\times - 2.0\times$) for revising during daily travel.</p>
    </div>
    """, unsafe_allow_html=True)
    
    audio_text, audio_img = extract_input_data("audio_tab")
    
    col_s1, col_s2 = st.columns([1, 1])
    with col_s1:
        speed_choice = st.select_slider("Audio Playback Speed:", options=[0.75, 1.0, 1.25, 1.5, 2.0], value=1.0, format_func=lambda x: f"{x}x Speed")
    
    if st.button("🎙️ Generate Spoken Lesson", key="btn_audio"):
        with st.spinner("Prof. Lara is recording your spoken audio brief..."):
            try:
                contents = []
                if audio_img:
                    contents.append(audio_img)
                if audio_text:
                    contents.append(audio_text)
                
                contents.append("You are Prof. Lara. Explain this topic enthusiastically out loud in a friendly, conversational audio lecture for a student on their commute.")
                script_res = generate_ai_content(contents)
                
                st.markdown("### 📜 Spoken Lesson Script")
                st.write(script_res.text)
                
                tts = gTTS(text=script_res.text, lang='en', slow=False)
                audio_bytes_io = io.BytesIO()
                tts.write_to_fp(audio_bytes_io)
                b64_audio = base64.b64encode(audio_bytes_io.getvalue()).decode()
                
                st.markdown("### 🔊 Listen to Prof. Lara:")
                audio_html = f"""
                <div style="background: #251d38; padding: 18px; border-radius: 16px; margin: 10px 0; border: 1.5px solid #8b5cf6;">
                    <audio id="teacher_audio" controls style="width: 100%;">
                        <source src="data:audio/mp3;base64,{b64_audio}" type="audio/mp3">
                    </audio>
                </div>
                <script>
                    var audio = document.getElementById("teacher_audio");
                    if (audio) {{ audio.playbackRate = {speed_choice}; }}
                </script>
                """
                st.components.v1.html(audio_html, height=90)
            except Exception as e:
                st.error(f"Error: {e}")