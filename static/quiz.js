
document.addEventListener("DOMContentLoaded", function () {

    // Get quiz data from sessionStorage
    let quizData;

    try {
        quizData = JSON.parse(sessionStorage.getItem("edumateQuiz"));
    } catch (error) {
        quizData = null;
    }

    const purpose = sessionStorage.getItem("edumatePurpose") || "learn";

    // Select HTML elements
    const purposeText = document.getElementById("quiz-purpose");
    const progressText = document.getElementById("progress-text");
    const progressFill = document.getElementById("progress-fill");

    const questionText = document.getElementById("question-text");
    const optionsArea = document.getElementById("options-area");

    const previousBtn = document.getElementById("previous-btn");
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-btn");

    const resultArea = document.getElementById("result");
    const questionArea = document.getElementById("question-area");
    const quizButtons = document.getElementById("quiz-buttons");

    // Check whether quiz data exists
    if (
        !quizData ||
        !Array.isArray(quizData.questions) ||
        quizData.questions.length === 0
    ) {
        questionText.textContent =
            "No quiz data found. Please upload a PDF again.";

        optionsArea.innerHTML = "";
        quizButtons.style.display = "none";
        progressText.textContent = "";
        progressFill.style.width = "0%";
        return;
    }

    const questions = quizData.questions;

    let currentQuestion = 0;
    let userAnswers = new Array(questions.length).fill(null);
    let submitted = false;

    // Set quiz heading
    purposeText.textContent =
        purpose === "test"
            ? "Test your knowledge with an AI-generated test."
            : "Learn and practise with AI-generated questions.";

    // Display a question
    function showQuestion() {

        const question = questions[currentQuestion];

        progressText.textContent =
            `Question ${currentQuestion + 1} of ${questions.length}`;

        progressFill.style.width =
            `${((currentQuestion + 1) / questions.length) * 100}%`;

        questionText.textContent = question.question;

        optionsArea.innerHTML = "";

        // Display options A, B, C and D
        Object.entries(question.options).forEach(function ([key, value]) {

            const label = document.createElement("label");
            label.className = "option";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "answer";
            radio.value = key;

            if (userAnswers[currentQuestion] === key) {
                radio.checked = true;
            }

            radio.addEventListener("change", function () {
                userAnswers[currentQuestion] = key;
            });

            label.appendChild(radio);
            label.appendChild(document.createTextNode(key + ". " + value));

            optionsArea.appendChild(label);
        });

        // Previous button
        previousBtn.disabled = currentQuestion === 0;

        // Show Next or Submit
        if (currentQuestion === questions.length - 1) {
            nextBtn.classList.add("hidden");
            submitBtn.classList.remove("hidden");
        } else {
            nextBtn.classList.remove("hidden");
            submitBtn.classList.add("hidden");
        }
    }

    // Next question
    nextBtn.addEventListener("click", function () {

        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion();
        }

    });

    // Previous question
    previousBtn.addEventListener("click", function () {

        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion();
        }

    });

    // Submit quiz
    submitBtn.addEventListener("click", function () {

        if (submitted) return;

        submitted = true;

        let score = 0;
        let resultHTML = "";

        questions.forEach(function (question, index) {

            const selectedAnswer = userAnswers[index];
            const correctAnswer = question.correct_answer;

            if (selectedAnswer === correctAnswer) {
                score++;
            }

            resultHTML += `
                <div style="margin-bottom:20px; padding:15px;
                            border:1px solid #ddd; border-radius:8px;">

                    <h3>Question ${index + 1}</h3>

                    <p>${escapeHTML(question.question)}</p>

                    <p>Your answer: ${escapeHTML(
                        selectedAnswer || "Not answered"
                    )}</p>

                    <p>Correct answer: ${escapeHTML(correctAnswer)}</p>

                    <p>Explanation: ${escapeHTML(
                        question.explanation || "No explanation available."
                    )}</p>

                </div>
            `;
        });

        // Display final score
        resultHTML =
            `<h2>Your Score: ${score} / ${questions.length}</h2>` +
            resultHTML;

        resultArea.innerHTML = resultHTML;

        questionArea.style.display = "none";
        quizButtons.style.display = "none";

        progressText.textContent = "Quiz completed!";
        progressFill.style.width = "100%";

    });

    // Escape AI-generated text before inserting it into result HTML
    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    // Start quiz
    showQuestion();

});
