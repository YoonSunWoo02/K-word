document.addEventListener('DOMContentLoaded', () => {
    
    // 🔥 [필수] 본인의 Pixabay API 키를 입력하세요
    const API_KEY = '54407874-ab38c3c61a6b68f3cbab3daf1'; 

    // 🌟 [업데이트] 단어 데이터 대폭 추가 (약 100개 이상)
    const wordData = {
        easy: [
            // [기초 사물/자연/신체] - 총 40개
            {ko:"사람",en:"person"}, {ko:"집",en:"house"}, {ko:"물",en:"water"}, 
            {ko:"밥",en:"rice"}, {ko:"나무",en:"tree"}, {ko:"돈",en:"money"}, 
            {ko:"차",en:"car"}, {ko:"옷",en:"clothes"}, {ko:"눈",en:"eye"}, 
            {ko:"비",en:"rain"}, {ko:"산",en:"mountain"}, {ko:"달",en:"moon"},
            {ko:"꽃",en:"flower"}, {ko:"손",en:"hand"}, {ko:"발",en:"foot"},
            {ko:"가방",en:"bag"}, {ko:"모자",en:"hat"}, {ko:"안경",en:"glasses"},
            {ko:"책상",en:"desk"}, {ko:"의자",en:"chair"},
            // (추가된 단어들)
            {ko:"사과",en:"apple"}, {ko:"빵",en:"bread"}, {ko:"우유",en:"milk"},
            {ko:"고기",en:"meat"}, {ko:"개",en:"dog"}, {ko:"고양이",en:"cat"},
            {ko:"새",en:"bird"}, {ko:"물고기",en:"fish"}, {ko:"해",en:"sun"},
            {ko:"별",en:"star"}, {ko:"구름",en:"cloud"}, {ko:"바다",en:"sea"},
            {ko:"강",en:"river"}, {ko:"얼굴",en:"face"}, {ko:"머리",en:"head"},
            {ko:"다리",en:"leg"}, {ko:"팔",en:"arm"}, {ko:"시계",en:"clock"},
            {ko:"전화기",en:"phone"}, {ko:"침대",en:"bed"}
        ],
        normal: [
            // [생활/장소/교통/직업] - 총 36개
            {ko:"학교",en:"school"}, {ko:"병원",en:"hospital"}, {ko:"회사",en:"company"},
            {ko:"시장",en:"market"}, {ko:"도서관",en:"library"}, {ko:"공원",en:"park"},
            {ko:"지하철",en:"subway"}, {ko:"버스",en:"bus"}, {ko:"비행기",en:"airplane"},
            {ko:"자전거",en:"bicycle"}, {ko:"친구",en:"friend"}, {ko:"가족",en:"family"},
            {ko:"선생님",en:"teacher"}, {ko:"경찰",en:"police"}, {ko:"의사",en:"doctor"},
            {ko:"김치",en:"kimchi"}, {ko:"라면",en:"ramen"}, {ko:"커피",en:"coffee"},
            // (추가된 단어들)
            {ko:"은행",en:"bank"}, {ko:"식당",en:"restaurant"}, {ko:"화장실",en:"bathroom"},
            {ko:"방",en:"room"}, {ko:"문",en:"door"}, {ko:"창문",en:"window"},
            {ko:"컴퓨터",en:"computer"}, {ko:"텔레비전",en:"television"}, {ko:"카메라",en:"camera"},
            {ko:"사진",en:"photo"}, {ko:"노래",en:"song"}, {ko:"영화",en:"movie"},
            {ko:"여름",en:"summer"}, {ko:"겨울",en:"winter"}, {ko:"아침",en:"morning"},
            {ko:"밤",en:"night"}, {ko:"사랑",en:"love"}, {ko:"꿈",en:"dream"}
        ],
        hard: [
            // [사회/추상/고급] - 총 30개
            {ko:"세계",en:"world"}, {ko:"정부",en:"government"}, {ko:"환경",en:"environment"},
            {ko:"우주",en:"universe"}, {ko:"대통령",en:"president"}, {ko:"전쟁",en:"war"},
            {ko:"평화",en:"peace"}, {ko:"결혼",en:"marriage"}, {ko:"신문",en:"newspaper"},
            {ko:"약",en:"medicine"}, {ko:"쓰레기",en:"garbage"}, {ko:"비밀",en:"secret"},
            {ko:"여권",en:"passport"}, {ko:"공항",en:"airport"}, {ko:"지갑",en:"wallet"},
            // (추가된 단어들)
            {ko:"경제",en:"economy"}, {ko:"문화",en:"culture"}, {ko:"역사",en:"history"},
            {ko:"미래",en:"future"}, {ko:"과거",en:"past"}, {ko:"성공",en:"success"},
            {ko:"실패",en:"failure"}, {ko:"법",en:"law"}, {ko:"예술",en:"art"},
            {ko:"과학",en:"science"}, {ko:"건강",en:"health"}, {ko:"안전",en:"safety"},
            {ko:"문제",en:"problem"}, {ko:"해결",en:"solution"}, {ko:"자유",en:"freedom"}
        ]
    };

    let currentWords = [];
    let currentIndex = 0;
    let score = 0;
    
    // 설정: 기본적으로 음성은 꺼짐(false)
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
    // 🎲 피셔-예이츠 셔플 (랜덤 섞기)
    // ---------------------------------------------
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

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
        if (!settings.isVoiceOn || !window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.0; 
        utterance.pitch = 1.1; 

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

    // 3. 보이스 모드 토글
    document.getElementById('toggle-voice-mode').onclick = function() {
        settings.isVoiceOn = !settings.isVoiceOn;
        this.classList.toggle('active');
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

    // 5. 정답 확인
    document.getElementById('submit-btn').onclick = checkAnswer;
    document.getElementById('answer-input').onkeypress = (e) => {
        if(e.key === 'Enter') checkAnswer();
    };
    
    imgArea.onclick = () => {
        if(settings.isBlurMode) imgArea.classList.remove('blurred');
        speakKorean(document.getElementById('korean-word').innerText);
    };

    document.getElementById('restart-btn').onclick = () => showScreen('main');


    // ---------------------------------------------
    // 게임 로직
    // ---------------------------------------------

    function startGame(level) {
        // 해당 레벨의 전체 단어를 복사
        const allWords = [...wordData[level]];
        
        // 🎲 무작위 셔플
        const shuffledWords = shuffleArray(allWords);
        
        // 설정된 문제 수만큼 자르기 (데이터보다 문제 수가 많으면 전체 사용)
        currentWords = shuffledWords.slice(0, settings.questionCount);
        if(currentWords.length === 0) currentWords = shuffledWords;

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

        speakKorean(word.ko);

        imgArea.classList.remove('blurred');
        if (settings.isBlurMode) imgArea.classList.add('blurred');

        imgEl.src = "https://via.placeholder.com/400x300?text=Loading...";

        try {
            // 이미지 검색
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
