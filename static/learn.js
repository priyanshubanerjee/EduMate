
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. SELECT HTML ELEMENTS
    // =====================================

    const chatBox = document.getElementById("chat-box");
    const questionInput = document.getElementById("question-input");
    const askButton = document.getElementById("ask-button");
    const chatStatus = document.getElementById("chat-status");

    if (!chatBox || !questionInput || !askButton || !chatStatus) {
        console.error("EduMate: Required chat elements were not found.");
        return;
    }


    // =====================================
    // 2. MARKDOWN FORMATTER
    // =====================================

    function formatMarkdown(message) {

        if (typeof marked === "undefined") {
            console.error("Marked.js is not loaded.");
            return null;
        }

        if (typeof DOMPurify === "undefined") {
            console.error("DOMPurify is not loaded.");
            return null;
        }

        marked.setOptions({
            gfm: true,
            breaks: true
        });

        const formattedHTML = marked.parse(message);

        return DOMPurify.sanitize(formattedHTML);
    }


    // =====================================
    // 3. ADD MESSAGE TO CHAT
    // =====================================

    function addMessage(message, sender) {

        const messageDiv = document.createElement("div");

        messageDiv.classList.add(sender + "-message");

        // BOT MESSAGE
        if (sender === "bot") {

            messageDiv.classList.add("bot-welcome");

            // Robot image
            const robotImage = document.createElement("img");

            robotImage.src = "/static/robot.png";
            robotImage.alt = "EduMate";

            messageDiv.appendChild(robotImage);

            // Answer container
            const answerContent = document.createElement("div");

            answerContent.classList.add("bot-answer");

            const formattedHTML = formatMarkdown(message);

            if (formattedHTML !== null) {

                answerContent.innerHTML = formattedHTML;

            } else {

                answerContent.textContent = message;

            }

            messageDiv.appendChild(answerContent);

        }

        // USER MESSAGE
        else {

            messageDiv.textContent = message;

        }

        chatBox.appendChild(messageDiv);

        // Automatically scroll to latest message
        chatBox.scrollTop = chatBox.scrollHeight;
    }


    // =====================================
    // 4. SHOW LOADING MESSAGE
    // =====================================

    function showLoading() {

        chatStatus.textContent = "EduMate is thinking...";

        chatStatus.style.display = "block";
    }


    // =====================================
    // 5. ASK DOUBT FUNCTION
    // =====================================

    async function askDoubt() {

        const question = questionInput.value.trim();

        // Empty question validation
        if (question === "") {

            chatStatus.textContent = "Please enter your question!";

            return;
        }

        // Prevent multiple requests
        if (askButton.disabled) {
            return;
        }

        // Disable button
        askButton.disabled = true;

        askButton.textContent = "Thinking...";

        // Show loading
        showLoading();

        // Display user question
        addMessage(question, "user");

        // Clear input
        questionInput.value = "";


        try {

            // =====================================
            // SEND REQUEST TO FLASK
            // =====================================

            const response = await fetch("/ask-doubt", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: question
                })

            });


            // =====================================
            // GET SERVER RESPONSE
            // =====================================

            const result = await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error || "Something went wrong!"
                );

            }


            // =====================================
            // DISPLAY AI ANSWER
            // =====================================

            if (result.answer) {

                addMessage(result.answer, "bot");

            } else {

                throw new Error("EduMate returned an empty answer.");

            }

            chatStatus.textContent = "";


        } catch (error) {

            // =====================================
            // ERROR HANDLING
            // =====================================

            console.error("EduMate error:", error);

            addMessage(
                "Sorry! " + error.message,
                "bot"
            );

            chatStatus.textContent = "";


        } finally {

            // =====================================
            // RESET BUTTON
            // =====================================

            askButton.disabled = false;

            askButton.textContent = "Ask EduMate";

            questionInput.focus();

        }

    }


    // =====================================
    // 6. BUTTON CLICK EVENT
    // =====================================

    askButton.addEventListener("click", askDoubt);


    // =====================================
    // 7. KEYBOARD EVENT
    // =====================================

    questionInput.addEventListener("keydown", function (event) {

        // Enter sends the question
        if (event.key === "Enter" && !event.shiftKey) {

            event.preventDefault();

            askDoubt();

        }

    });


    // =====================================
    // 8. INITIALIZATION
    // =====================================

    console.log("EduMate Learn.js loaded successfully.");

});
