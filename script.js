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
    let settings = {
        isBlurMode: false,
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
    // 이벤트 리스너
    // ---------------------------------------------

    // 1. 난이도 선택
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const level = btn.getAttribute('data-level');
            startGame(level);
        });
    });

    // 2. 다크모드 & 블러모드 토글
    document.getElementById('toggle-dark-mode').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.classList.toggle('active');
    });

    document.getElementById('toggle-blur-mode').addEventListener('click', function() {
        settings.isBlurMode = !settings.isBlurMode;
        this.classList.toggle('active');
    });

    // 3. 문제 수 설정 (막대바 로직)
    const segmentBtns = document.querySelectorAll('.segment-btn');
    segmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 다른 버튼 active 제거
            segmentBtns.forEach(b => b.classList.remove('active'));
            // 클릭한 버튼 active 추가
            btn.classList.add('active');
            // 값 업데이트
            settings.questionCount = parseInt(btn.getAttribute('data-value'));
        });
    });

    // 4. 게임 진행 관련
    document.getElementById('submit-btn').addEventListener('click', checkAnswer);
    document.getElementById('answer-input').addEventListener('keypress', (e) => {
        if(e.key === 'Enter') checkAnswer();
    });
    
    imgArea.addEventListener('click', () => {
        if(settings.isBlurMode) imgArea.classList.remove('blurred');
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        showScreen('main');
    });


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