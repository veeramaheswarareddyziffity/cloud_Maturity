import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Questions = () => {
  const [questions, setQuestions] = useState(null);
  const [responses, setResponses] = useState({});
  const [page, SetPage] = useState(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/questionnaire')
      .then(response => {
        setQuestions(response.data);
        SetPage(response.data.page_no);
      })
      .catch(error => {
        console.error('Error fetching questionnaire:', error);
      });
  }, []);

  const handleInputChange = (questionId, optionText) => {
    setResponses({
      ...responses,
      [questionId]: optionText
    });
  };

  const handleSubmit = () => {

    const unansweredQuestions = questions.questions.filter(question => !responses[question.id]);

    if (unansweredQuestions.length > 0) {
      setErrorMessage('Please answer all questions.');
      return;
    }

    axios.post('http://localhost:8000/api/questionnaire/responses', { "response": responses, "currentPage": page })
      .then(response => {
        const upadtedQuestions = response.data.questions;
        const nextPage = response.data.nextPage;
        const totalScore = response.data.currentScore;
        setScore(totalScore);
        if (nextPage !== null) {
          setQuestions(upadtedQuestions);
          SetPage(nextPage);
          setResponses({});
          setErrorMessage('');
          console.log('Response from backend:', response.data);
        } else {
          setShowScore(true);
        }
      })
      .catch(error => {
        console.error('Error submitting responses:', error);
      });
  };

  if (!questions) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      {showScore ? (
        <div id="scoreDetails">
          <h2> Quiz is Completed!</h2>
          <h3>Your Score: {score}</h3>
        </div>
      ) :
        <div>
          <h1>Cloud Maturity Questionnaire</h1>
          <h2>{questions.page_name}</h2>
          {questions.questions && questions.questions.map(question => (
            <div key={question.id}>
              <h3>{question.question_text}</h3>
              <form>
                {questions.options
                  .filter((option) => option.question_id === question.id)
                  .map((option) => (
                    <div id="options" key={option.option_id}>
                      <input
                        type="radio"
                        id={option.option_id}
                        name={`question_${question.id}_options`}
                        value={option.option_id}
                        onClick={() => handleInputChange(question.id, option.option_text)}
                      />
                      <label htmlFor={option.option_id}>{option.option_text}</label>
                    </div>
                  ))}
              </form>
            </div>
          ))}
          {errorMessage && <div className="error-message"> <p style={{ color: 'red' }}>{errorMessage}</p></div>}
          <button onClick={handleSubmit}>Submit</button>
        </div>
      }
    </div>
  );
}
export default Questions;
