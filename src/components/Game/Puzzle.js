import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import games from './games.json';
import './Game.css';
import Endgame from './Endgame';
import Answer from './Answer';
import Question from './Question';
//props this file needs to run: Id, TotalQuestion, TotalHints, AtQuestion, Questions, AnswerType, Answers, Hints, Long, Lad, TimeLimit
//Each time answers is right => mutation Update AtQuestion 
//When the game ends it will reset players pool => mutation updateGame(players: "")
//Rework Hint component a little bit
class Puzzle extends Component {
    constructor(props) {
        super(props)
        this.state = {
            index: this.props.gID,
            totalQuestions: this.props.gTotalQuestions,
            totalHints: this.props.gTotalHints,
            atQuestion: this.props.gAtQuestion,
            questions: this.props.gQuestions,
            questionVisualAid: this.props.gQuestionVisualAids,
            answerType: this.props.gAnswerType,
            answers: this.props.gAnswers,
            hints: this.props.gHints,
            geoLocation: this.props.gGeoLocation,
            hintCount: 0,
            usedHint: false,
            latitude: null,
            longitude: null,
            // game ends when last question is completed
            gameState: true,
            win: false,
            timeStopper: 0 // used to stop timer

        }
        this.getAnswer = this.getAnswer.bind(this);
        this.getHint = this.getHint.bind(this);
    }
    //this function is to get answer from NUMBER TYPE
    async getAnswer(e) {
        let userAnswer = e.target.value.toString();
        console.log("userAnswer", userAnswer)
        console.log("current Index", this.state.index)
        console.log("hints", this.state.hints)
        console.log("current Questions Index", this.state.atQuestion)
        console.log('List of Answer', this.state.answers)
        console.log('Answer Type List: ', this.state.answerType)
        // let currentGameIndex = this.state.index;
        // let currentQuestionIndex = this.state.atQuestion;
        let answer = this.state.answers[this.state.atQuestion];
        console.log(answer)
        //if the answer is correct
        if (userAnswer.toLowerCase() == answer.toLowerCase()) {
            //moving to the next question
            console.log("right answer");
            // clear hint space when moving to next question
            document.getElementById('hint').innerText = '';
            await this.setState({
                atQuestion: this.state.atQuestion + 1,
                usedHint: false
            })
            //if this is the last question then End game
            if (this.state.atQuestion == this.state.totalQuestions) {
                await this.setState({
                    gameState: false,
                    win: true
                }); console.log("End of game");
            }
            //reset value of submit buttons
            if (document.getElementById("answerBox")) {
                document.getElementById("answerBox").value = "";
                document.getElementById("submitBttn").value = "";
            }
        }
        //wrong answer => reset the current value of the pound button
        else {
            console.log("Wrong Answer")
            if (document.getElementById("answerBox")) {
                // visual cue for wrong answer in text box
                document.getElementById('answerBox').style.border = "medium solid #FF0000";

                setTimeout(function () {
                    document.getElementById('answerBox').style.border = "thin solid #000000";
                }, 750)

                document.getElementById("answerBox").value = "";
                document.getElementById("submitBttn").value = "";
            }
            if (document.getElementById("pound")) {
                document.getElementById("pound").value = "";

                // visual cue for wrong answer in numpad
                document.getElementById('pound').style.background = '#FF0000';
                setTimeout(function () {
                    document.getElementById('pound').style.background = '#DDDDDD';
                }, 750);


            }
        }
    }

    getHint() {
        let questionIndex = this.state.atQuestion;
        let totalHint = this.state.totalHints;
        let hintCount = this.state.hintCount;
        let hintArea = document.getElementById("hint");
        let usedHint = this.state.usedHint;
        //Display hint and increment hint count
        if (hintCount < totalHint && !usedHint) {
            hintCount += 1;
            hintArea.innerText = this.state.hints[questionIndex];
            this.setState({
                hintCount: hintCount,
                usedHint: true
            })
        }
        //when the player press the hint button more than once for same question
        else if (usedHint) {
            hintArea.innerText = this.state.hints[questionIndex];
        }
        //when the users run out of hint
        else {
            hintArea.innerText = "Sorry You've Run Out Of Hint! NOW USE YOUR DAMN BRAIN"
        }
        //Timeout to prevent spamming
        if (questionIndex + 1 > this.state.totalQuestions) {
            console.log("Hint button timeout not necessary");
        } else {
            document.getElementById("hintBttn").disabled = true;
            // document.getElementById("hintBttn").style.backgroundColor = "gray";
            setTimeout(function () {
                document.getElementById("hintBttn").disabled = false;
            }, 2000)
        }
    }
    
    // start acquiring player location when component mounts
    
    // when state changes, check to see if the game has ended
    // stop timer when game is completed
    componentDidUpdate() {
        if (this.state.win && this.state.timeStopper === 0) {
            this.setState({ timeStopper: 1 })
            this.props.gameHandler();
        }
    }

    render() {
        // game states - playing or end game
        if (!this.state.gameState) {
            const winPage = <Endgame outcome={this.state.win} />;
            return (
                <div>
                    {/* display win page when game is completed before timer hits 0 */}
                    {winPage}
                </div>
            )
        }
        else {
            let questionPage = <Question
                qContent={this.state.questions[this.state.atQuestion]}
                qAid={this.state.questionVisualAid[this.state.atQuestion]} />;
            let answerPage = <Answer
                answerType={this.state.answerType[this.state.atQuestion]}
                action={this.getAnswer} />;
            return (
                <div className="game">
                    <section className="middle">
                    <br/><br/>
                    <progress className = 'prog' value = {this.state.atQuestion} max = {games[this.state.index].Total_Questions}/>
                    <br/><br/>
                        <div className="text-center">
                            <h1>{this.props.gTitle} Challenge</h1>
                            {questionPage}
                            <br /><br /><br />
                            {answerPage}
                            <p id="hint" className="questN" value=""></p>
                            <div className="hint">
                                <button id="hintBttn" className="btn-lg btn-warning" type="button" onClick={this.getHint}>
                                    {this.state.totalHints - this.state.hintCount} Hint(s) Left</button>
                            </div>
                        </div>
                    </section>
                </div>

            )
        }

    }


}

export default Puzzle;