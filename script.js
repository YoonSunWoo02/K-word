document.addEventListener('DOMContentLoaded', () => {
    
    // 🔥 [필수] Pixabay API 키 입력
    const API_KEY = '54407874-ab38c3c61a6b68f3cbab3daf1'; 

    const wordData = {
        easy: [
            {ko:"사과",en:"apple"}, {ko:"개",en:"dog"}, {ko:"고양이",en:"cat"}, 
            {ko:"물",en:"water"}, {ko:"집",en:"house"}, {ko:"차",en:"car"}, 
            {ko:"나무",en:"tree"}, {ko:"책",en:"book"}, {ko:"돈",en:"money"},
            {ko:"별",en:"star"}, {ko:"달",en:"moon"}, {ko:"해",en:"sun"}
        ],
        normal: [
            {ko:"학교",en:"school"}, {ko:"친구",en:"friend"}, {ko:"가족",en:"family"}, 
            {ko:"여름",en:"summer"}, {ko:"겨울",en:"winter"}, {ko:"음악",en:"music"}, 
            {ko:"시간",en:"time"}, {ko:"공원",en:"park"}, {ko:"지하철",en:"subway"},
            {ko:"비행기",en:"airplane"}, {ko:"도서관",en:"library"}
        ],
        hard: [
            {ko:"우주",en:"universe"}, {ko:"경제",en:"economy"}, {ko:"자유",en:"freedom"}, 
            {ko:"과학",en:"science"}, {ko:"환경",en:"environment"}, {ko:"전통",en:"tradition"}, 
            {ko:"정부",en:"government"}, {ko:"책임",en:"responsibility"},
            {ko:"감정",en:"emotion"}, {ko:"기억",en:"memory"}
        ]
    };

    let currentWords = [];
    let currentIndex = 0;
    let score = 0;
    
    // 🌟 설정: 기본적으로 음성은 꺼짐(false)
    let settings = {
        isBlurMode: false,
        isVoiceOn: false, 
        questionCount: 10
    };

    // UI 요소
    const screens = {
        main: document.getElementById('main-screen'),
        quiz: document.getElementById('quiz-screen'),
        result: document.getElementById('result-screen')
    };
    const imgArea = document.getElementById('image-area');
    const imgEl = document.getElementById('word-image');

    // ---------------------------------------------
    // 🔊 음성(TTS) 로직
    // ---------------------------------------------
    let voices = [];

    function loadVoices() {
        voices = window.speechSynthesis.getVoices();
    }
    
    if (window.speechSynthesis) {
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    function speakKorean(text) {
        // 설정이 꺼져있으면 소리 안 냄
        if (!settings.isVoiceOn || !window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.0; 
        utterance.pitch = 1.1; // 약간 높은 톤 (젊은 여성 느낌)

        // Google 한국어 음성이 있으면 그것을 사용
        const targetVoice = voices.find(v => v.lang === 'ko-KR' && v.name.includes('Google')) 
                         || voices.find(v => v.lang === 'ko-KR');

        if (targetVoice) {
            utterance.voice = targetVoice;
        }

        window.speechSynthesis.cancel(); 
        window.speechSynthesis.speak(utterance);
    }


    // ---------------------------------------------
    // 이벤트 리스너
    // ---------------------------------------------

    // 1. 난이도 선택
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const level = btn.getAttribute('data-level');
            startGame(level);
        });
    });

    // 2. 다크모드 & 블러모드
    document.getElementById('toggle-dark-mode').onclick = function() {
        document.body.classList.toggle('dark-mode');
        this.classList.toggle('active');
    };

    document.getElementById('toggle-blur-mode').onclick = function() {
        settings.isBlurMode = !settings.isBlurMode;
        this.classList.toggle('active');
    };

    // 🌟 3. 보이스 모드 토글 (기본 OFF -> 클릭 시 ON)
    document.getElementById('toggle-voice-mode').onclick = function() {
        settings.isVoiceOn = !settings.isVoiceOn;
        this.classList.toggle('active');
        // 텍스트 변경: 켜지면 "Voice", 꺼지면 "Mute"
        this.innerText = settings.isVoiceOn ? "🔊 Voice" : "🔇 Mute";
    };

    // 4. 문제 수 설정
    document.querySelectorAll('.segment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.questionCount = parseInt(btn.getAttribute('data-value'));
        });
    });

    // 5. 게임 진행
    document.getElementById('submit-btn').onclick = checkAnswer;
    document.getElementById('answer-input').onkeypress = (e) => {
        if(e.key === 'Enter') checkAnswer();
    };
    
    // 이미지 클릭
    imgArea.onclick = () => {
        if(settings.isBlurMode) imgArea.classList.remove('blurred');
        speakKorean(document.getElementById('korean-word').innerText);
    };

    document.getElementById('restart-btn').onclick = () => showScreen('main');


    // ---------------------------------------------
    // 게임 로직
    // ---------------------------------------------

    function startGame(level) {
        const allWords = [...wordData[level]].sort(() => Math.random() - 0.5);
        currentWords = allWords.slice(0, settings.questionCount);
        if(currentWords.length === 0) currentWords = allWords;

        currentIndex = 0;
        score = 0;
        
        document.getElementById('level-badge').innerText = level.toUpperCase();
        document.getElementById('total-q').innerText = currentWords.length;

        showScreen('quiz');
        loadQuestion();
    }

    async function loadQuestion() {
        const word = currentWords[currentIndex];

        document.getElementById('current-q').innerText = currentIndex + 1;
        document.getElementById('korean-word').innerText = word.ko;
        document.getElementById('answer-input').value = "";
        document.getElementById('feedback').innerText = "";
        document.getElementById('answer-input').focus();

        // 설정이 켜져있을 때만 읽음
        speakKorean(word.ko);

        imgArea.classList.remove('blurred');
        if (settings.isBlurMode) imgArea.classList.add('blurred');

        imgEl.src = "https://via.placeholder.com/400x300?text=Loading...";

        try {
            const res = await fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(word.en)}&image_type=photo&safesearch=true`);
            const data = await res.json();
            
            if (data.hits && data.hits.length > 0) {
                imgEl.src = data.hits[0].webformatURL;
            } else {
                imgEl.src = `https://via.placeholder.com/400x300?text=${word.en}`;
            }
        } catch (e) {
            console.error("Error:", e);
        }
    }

    function checkAnswer() {
        const inputEl = document.getElementById('answer-input');
        const feedbackEl = document.getElementById('feedback');
        const userAns = inputEl.value.toLowerCase().trim();
        const correctAns = currentWords[currentIndex].en.toLowerCase();

        if (userAns === correctAns) {
            score++;
            feedbackEl.innerText = "Correct! 🎉";
            feedbackEl.style.color = "#2ecc71";
            imgArea.classList.remove('blurred');
        } else {
            feedbackEl.innerText = `Wrong! Answer: ${correctAns}`;
            feedbackEl.style.color = "#e74c3c";
        }

        setTimeout(() => {
            currentIndex++;
            if (currentIndex < currentWords.length) {
                loadQuestion();
            } else {
                finishGame();
            }
        }, 1500);
    }

    function finishGame() {
        showScreen('result');
        document.getElementById('final-score').innerText = score;
        document.getElementById('final-total').innerText = currentWords.length;
        
        const msg = document.getElementById('result-message');
        const percent = (score / currentWords.length) * 100;
        
        if(percent === 100) msg.innerText = "Perfect! Amazing! 🏆";
        else if(percent >= 70) msg.innerText = "Great Job! 🔥";
        else msg.innerText = "Try Again! 💪";
    }

    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        if(screens[screenName]) screens[screenName].classList.add('active');
    }
});
