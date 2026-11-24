
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. SELECT HTML ELEMENTS
    // =====================================

    const learnButton = document.getElementById("learn-btn");
    const testButton = document.getElementById("startTest");

    const pdfInput = document.getElementById("pdfFile");
    const testPdfInput = document.getElementById("testPdf");

    const pdfInfo = document.getElementById("pdfInfo");
    const testPdfInfo = document.getElementById("testpdfInfo");


    // =====================================
    // 2. PDF VALIDATION
    // =====================================

    function validatePDF(file) {

        if (!file) {
            return "Please select a PDF file first!";
        }

        const isPDF =
            file.type === "application/pdf" &&
            file.name.toLowerCase().endsWith(".pdf");

        if (!isPDF) {
            return "Invalid file! Please select a PDF.";
        }

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            return "File is too large! Maximum size is 10 MB.";
        }

        return null;
    }


    // =====================================
    // 3. DISPLAY PDF INFORMATION
    // =====================================

    function showPDFInfo(file, infoElement) {

        const fileSize = (file.size / (1024 * 1024)).toFixed(2);

        infoElement.textContent =
            "PDF selected successfully!\n" +
            "File Name: " + file.name + "\n" +
            "File Size: " + fileSize + " MB";
    }


    // =====================================
    // 4. HANDLE PDF SELECTION
    // =====================================

    function handlePDFSelection(input, infoElement) {

        const file = input.files[0];

        if (!file) {
            infoElement.textContent = "No PDF selected.";
            return;
        }

        const error = validatePDF(file);

        if (error) {
            alert(error);
            input.value = "";
            infoElement.textContent = "Please select a valid PDF.";
            return;
        }

        showPDFInfo(file, infoElement);

        alert("PDF selected successfully!\n\n" + file.name);
    }


    // =====================================
    // 5. TEST NOW - GENERATE QUIZ
    // =====================================

    async function uploadPDF(file, purpose) {

        const formData = new FormData();

        formData.append("pdf", file);
        formData.append("purpose", purpose);

        try {

            const response = await fetch("/upload", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "PDF upload failed!"
                );
            }

            if (
                !result.quiz ||
                !Array.isArray(result.quiz.questions) ||
                result.quiz.questions.length === 0
            ) {
                throw new Error("AI questions were not received!");
            }

            sessionStorage.setItem(
                "edumateQuiz",
                JSON.stringify(result.quiz)
            );

            sessionStorage.setItem(
                "edumatePurpose",
                purpose
            );

            alert(result.message);

            window.location.href = "/quiz";

            return true;

        } catch (error) {

            alert("Error: " + error.message);

            return false;
        }
    }


    // =====================================
    // 6. LEARN NOW - UPLOAD PDF
    // =====================================

    async function uploadPDFForLearning(file) {

        const formData = new FormData();

        formData.append("pdf", file);

        try {

            const response = await fetch("/upload-learn", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "PDF upload failed!"
                );
            }

            alert(result.message);

            window.location.href = result.redirect;

            return true;

        } catch (error) {

            alert("Error: " + error.message);

            return false;
        }
    }


    // =====================================
    // 7. LEARN PDF SELECTION
    // =====================================

    pdfInput.addEventListener("change", function () {

        handlePDFSelection(pdfInput, pdfInfo);

    });


    // =====================================
    // 8. TEST PDF SELECTION
    // =====================================

    testPdfInput.addEventListener("change", function () {

        handlePDFSelection(testPdfInput, testPdfInfo);

    });


    // =====================================
    // 9. LEARN NOW BUTTON
    // =====================================

    learnButton.addEventListener("click", async function () {

        const file = pdfInput.files[0];

        const error = validatePDF(file);

        if (error) {
            alert(error);
            return;
        }

        learnButton.disabled = true;
        learnButton.textContent = "Uploading PDF...";

        await uploadPDFForLearning(file);

        learnButton.disabled = false;
        learnButton.textContent = "Let's Learn";

    });


    // =====================================
    // 10. START TEST BUTTON
    // =====================================

    testButton.addEventListener("click", async function () {

        const file = testPdfInput.files[0];

        const error = validatePDF(file);

        if (error) {
            alert(error);
            return;
        }

        testButton.disabled = true;
        testButton.textContent = "Generating Test...";

        await uploadPDF(file, "test");

        testButton.disabled = false;
        testButton.textContent = "Start Test";

    });

});
