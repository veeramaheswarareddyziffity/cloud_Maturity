document.addEventListener("alpine:init", () => {
    Alpine.data("quizData", () => ({
      questions: null,
      responses: {},
      page: null,
      score: 0,
      showScore: false,
      errorMessage: "",
      handleSubmit() {
        const unansweredQuestions = this.questions.questions.filter(
          (question) => !this.responses[question.id]
        );
        
        if (unansweredQuestions.length > 0) {
          this.errorMessage = "Please answer all questions.";
          return;
        }

        fetch("http://localhost:7000/api/questionnaire/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            response: this.responses,
            currentPage: this.page,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            const updatedQuestions = data.questions;
            const nextPage = data.nextPage;
            const totalScore = data.currentScore;
            this.score = totalScore;

            if (nextPage !== null) {
              this.questions = updatedQuestions;
              this.page = nextPage;
              this.responses = {};
              this.errorMessage = "";
              console.log("Response from backend:", data);
            } else {
              this.showScore = true;
            }
          })
          .catch((error) =>
            console.error("Error submitting responses:", error)
          );
      },
    }));
  });