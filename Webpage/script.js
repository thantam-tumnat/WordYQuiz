// script.js
//let mergedData = [];
let questions = [
	{
		prompt: `Inside which HTML 
				element do we put 
				the JavaScript?`,
		options: [
			"<javascript>",
			"<js>",
			"<script>",
			"<scripting>",
		],
		answer: "<script>",
	},

	{
		prompt: `How do you call a
				function named 
				myFunction?`,
		options: [
			"call myFunction()",
			"myFunction()",
			"call function myFunction",
			"Call.myFunction",
		],
		answer: "myFunction()",
	},

	{
		prompt: `How does a for loop
				start?`,
		options: [
			"for (i = 0; i <= 5; i++)",
			"for (i = 0; i <= 5)",
			"for i = 1 to 5",
			" for (i <= 5; i++)",
		],
		answer: "for (i = 0; i <= 5; i++)",
	},

	{
		prompt: `In JavaScript, which 
				of the following is 
				a logical operator?`,
		options: ["|", "&&", "%", "/"],
		answer: "&&",
	},

	{
		prompt: `A named element in a 
				JavaScript program that
				is used to store and 
				retrieve data is a _____.`,
		options: [
			"method",
			"assignment operator",
			"letiable",
			"string",
		],
		answer: "letiable",
	},
];

let mergedData = [
    {
        "id": 1,
        "word": "banana",
        "definition": "yellow thing"
    },
    {
        "id": 2,
        "word": "apple",
        "definition": "red thing"
    },
    {
        "id": 3,
        "word": "grape",
        "definition": "purple thing"
    },
    {
        "id": 4,
        "word": "orange",
        "definition": "orange thing"
    }
];

// Get Dom Elements

let questionsEl =
	document.querySelector(
		"#questions"
	);
let timerEl =
	document.querySelector("#timer");
let choicesEl =
	document.querySelector("#options");
let submitBtn = document.querySelector(
	"#submit-score"
);
let startBtn =
	document.querySelector("#start");
let nameEl =
	document.querySelector("#name");
let feedbackEl = document.querySelector(
	"#feedback"
);
let reStartBtn =
	document.querySelector("#restart");
let buttonOfchoices = document.querySelector("value");



// Quiz's initial state
let currentQuestionIndex = 0;
let time = 15;
let timerId;

// Start quiz and hide frontpage

async function quizStart() {
	timerId = setInterval(
		clockTick,
		1000
	);
	timerEl.textContent = time;
	let landingScreenEl =
		document.getElementById(
			"start-screen"
		);
	landingScreenEl.setAttribute(
		"class",
		"hide"
	);
	questionsEl.removeAttribute(
		"class"
	);
	getQuestion();
}




async function fetchAndMergeJSON() {
    //const mergedData = [];
    for (let i = 0; i <= 3; i++) {
      const url = `http://localhost:8000/volcabs/${getRandomNumberInRange(10)}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        mergedData[i] = data;
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
      }
    }
    console.log("merged data before getQuestion");
	console.log(mergedData);
    console.log("json first = " + mergedData[0].word); // Print the merged JSON data
    //console.log(questions);
  }
  
  

  function getRandomNumberInRange(max) {
    // Ensure max is a valid number
    if (typeof max !== 'number' || max <= 0) {
      throw new Error('Invalid input: max must be a positive number');
    }
  
    // Generate a random decimal between 0 (inclusive) and max (exclusive)
    const randomDecimal = Math.random() * max;
  
    // Round down to the nearest integer to get a random number within the range 1 to max
    return Math.floor(randomDecimal) + 1;
  }
  


function getRandomNumber1to4() {
  return Math.floor(Math.random() * 3) + 1;
}


async function getQuestion() {
	await fetchAndMergeJSON();
    let answer = getRandomNumber1to4();
    currentQuestionIndex = answer;
    console.log("currenQuestionIndex === " + currentQuestionIndex);
	/*let currentQuestion =
		questions[currentQuestionIndex];*/
	let currentQuestion =
		mergedData[currentQuestionIndex];
	let promptEl =
		document.getElementById(
			"question-words"
		);
	promptEl.textContent =
    //currentQuestion.prompt;
	
	currentQuestion.definition;
		//currentQuestion.definition;
	choicesEl.innerHTML = "";
	for (var i in mergedData) {		
		if (i >= 4) {
			break;
		}
		
			let choiceBtn =
				document.createElement(
					"button"
				);
			choiceBtn.setAttribute(
				"value",
				mergedData[i].word
			);
			choiceBtn.textContent =
				parseInt(i) + parseInt("1") + ". " + mergedData[i].word;
			choiceBtn.onclick =
				questionClick;
			choicesEl.appendChild(
				choiceBtn
			);
		
	  }		
	  console.log("merged data afer get question === ");
	  console.log(mergedData);
}



const delay = (delayInms) => {
	return new Promise(resolve => setTimeout(resolve, delayInms));
  };
  


// Check for right answers and deduct
// Time for wrong answer, go to next question
var score = 0;
var round = 0;
async function questionClick() {
	if (
		this.value !== // if value(answer) of the clicked button doesnt match with the index
		// it will end the quiz
		mergedData[currentQuestionIndex]
			.word
	) {
		/*if (round == 0) {
			score = 0;
		}*/
		console.log("currentQuestionIndex ====" + currentQuestionIndex);
		console.log("this.value ==== " + this.value);
		console.log("answer ====" + mergedData[currentQuestionIndex]
		.word);
		console.log(mergedData);
		console.log("json second = " + mergedData[0].word);
		
		if (time < 0) {
			time = 0;
		}
		console.log("value isssssssssssssss " + this.value);
		//clickedButton = document.getElementById(this.value)

		timerEl.textContent = time;
		feedbackEl.textContent = `Wrong! The correct answer was 
		${mergedData[currentQuestionIndex].word}.`;
		feedbackEl.style.color = "red";
		//choiceButtons.style.color = "red"; //ทำให้ปุ่มที่กดเป็นสีแดงถ้าผิด
		feedbackEl.setAttribute(
			"class",
			"feedback"
		);
		let delayres = await delay(2000);
		quizEnd();
		//buttonOfchoices.style.color = "red";
		
	} else {
		feedbackEl.textContent =
			"Correct! +" + time;
			score = score + time;
			time = 12;
		feedbackEl.style.color =
			"green";

			feedbackEl.setAttribute(
				"class",
				"feedback"
			);
	}
	setTimeout(function () {
		feedbackEl.setAttribute(
			"class",
			"feedback hide"
		);
	}, 2000);
	round = round+1;
	/*if (
		round ===
		questions.length
	) {
		quizEnd();
	} else {*/
	let delayres = await delay(500);
	
		getQuestion();
	//}
}

// End quiz by hiding questions,
// Stop timer and show final score

function quizEnd() {
	clearInterval(timerId);
	let endScreenEl =
		document.getElementById(
			"quiz-end"
		);
	endScreenEl.removeAttribute(
		"class"
	);
	let finalScoreEl =
		document.getElementById(
			"score-final"
		);
	finalScoreEl.textContent = score;
	questionsEl.setAttribute(
		"class",
		"hide"
	);
}

// End quiz if timer reaches 0

function clockTick() {
	time--;
	timerEl.textContent = time;
	if (time <= 0) {
		quizEnd();
	}
}

// Save score in local storage
// Along with users' name

function saveHighscore() {
	let name = nameEl.value.trim();
	if (name !== "") {
		let highscores =
			JSON.parse(
				window.localStorage.getItem(
					"highscores"
				)
			) || [];
		let newScore = {
			score: time,
			name: name,
		};
		highscores.push(newScore);
		window.localStorage.setItem(
			"highscores",
			JSON.stringify(highscores)
		);
		alert(
			"Your Score has been Submitted"
		);
	}
}

// Save users' score after pressing enter

function checkForEnter(event) {
	if (event.key === "Enter") {
		saveHighscore();
		alert(
			"Your Score has been Submitted"
		);
	}
}
nameEl.onkeyup = checkForEnter;

// Save users' score after clicking submit

submitBtn.onclick = saveHighscore;

// Start quiz after clicking start quiz

startBtn.onclick = quizStart;
