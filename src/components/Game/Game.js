import React, { Component, ReactDOM } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './Game.css';
import Timer from './Timer';  // timer component that determines state of game
import games from './games.json'; // get the game title
import Panel from './gamePanel';
import { withAuthenticator, Connect } from 'aws-amplify-react';
import Amplify, { Analytics, API, Auth, graphqlOperation, Storage } from 'aws-amplify';
import { getCurrentLocation, getDistanceFromLatLonInKm } from './util.js'; // import geolocation helper functions

const ListGames = `query ListGames {
  listGames {
      items {
        id
        Title
        Location
        Difficulty
        TimeLimit
        Story
        Questions
        Answers
      }
  }
}`;

class GamesList extends React.Component {
  gameItems() {
    return this.props.games.map(game =>
      <ul>
        <li key={game.id}>
          {game.Title}
        </li>
        <li key={game.id}>
          {game.Location}
        </li>
        <li key={game.id}>
          {game.Difficulty}
        </li>
        <li key={game.id}>
          {game.Story}
        </li>
        <li key={game.id}>
          {game.TimeLimit}
        </li >
      </ul>

    )
  }

  render() {
    return (
      <div>
        {this.gameItems()}
      </div>
    )
  }
}

class Game extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gameID: 0,
      gameReady: false,
      latitude: null,
      longitude: null,
      gameSynopsis: 0, // 0: don't display game synopsis ; 1: display synopsis
      gameStart: 0 // 0: start button clicked, start game ; 1: stay on synopsis page
    };
    this.getGameId = this.getGameId.bind(this);
    this.startGame = this.startGame.bind(this);
    
  }

  getGameId(ev) {
    console.log(ev.currentTarget.value)
    this.setState({
      gameID: ev.currentTarget.value,
      gameReady: true,
      gameSynopsis: 1
    }, console.log(this.state.gameID))
    console.log(this.state.gameID)
  }

  startGame() {
    // watch current location
    let current, target, dist;
    let currentState = this;
    
    function success(position) {
      let userCoords = position.coords;
      console.log(`latitude: ${userCoords.latitude} | longitude: ${userCoords.longitude}`)
      // calculate distance to target
      dist = getDistanceFromLatLonInKm(userCoords.latitude, userCoords.longitude, target.latitude, target.longitude);
      console.log('Distance: ' + dist)
      // player must be within 10 meters of starting point for game to begin
      if (dist <= 0.01) {
        console.log('You are here!');
        // stop watching player location
        navigator.geolocation.clearWatch(current)
        // testtt
        console.log('starting game');
        currentState.setState({
          gameSynopsis: 0,
          gameStart: 1
        })
      } else {
        document.getElementById('notAtLocationIndicator').innerText = 'You are not at the starting location of the game.';
        
      }
    }

    // error callback
    function error(err) {
      console.warn('Error(' + err.code + '): ' + err.message);
    }
    
    // this is just a test location for now -- in front of webb statue
    target = {
      latitude: games[this.state.gameID].Starting_Location.latitude,
      longitude: games[this.state.gameID].Starting_Location.longitude
    }
    
    // start watching
    current = navigator.geolocation.watchPosition(success, error, {enableHighAccuracy: true});
  }

  position = async () => {
    await navigator.geolocation.getCurrentPosition(
      position => this.setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }), newState => console.log(newState))

       console.log(this.state.latitude, this.state.longitude);
       
   }


  componentDidUpdate(prevProps) {
    if (prevProps.latitude !== this.props.latitude) {
      this.setState({
        latitude: this.props.latitude
      })
    }
  }
  //Want to load the game in here based on the name
  render = () => {
    let panelGenrator = () => {
      let listItems = games
        .map(item =>
          <Panel gameId={item.Id} func={this.getGameId} />
        )
      return <ol className="cardsX" >{listItems}</ol>
    }
    // go to game list page
    if (!this.state.gameReady && (this.state.gameSynopsis === 0) && (this.state.gameStart === 0)) {
      return (

        <div className="Game">
          <Connect query={graphqlOperation(ListGames)}>
            {({ data, loading, errors }) => {
              if (loading) { return <div>Loading...</div>; }
              if (errors) console.log(errors);
              console.log(data.listGames);
              return <GamesList games={data.listGames.items} />
            }}
          </Connect>
          <br />
          <p className="Location">Click the button to get your coordinates.</p>

          <p className="Location">{this.state.latitude} {this.state.longitude}</p>

          <button onClick={this.position} className='Location'>Location</button>
          <br />

          <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css"
            integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay"
            crossOrigin="anonymous" />
          <br />
          <div className="exit">
            <button className="btn btn-lg btn-danger" type="button"><a href="/">&nbsp; Exit &nbsp;</a></button>
          </div>
          <div className="game-list">
            <Panel func={this.getGameId} />
          </div>


          <br />
        </div>
      )
    }
    // go to game synopsis page
    else if (this.state.gameReady && (this.state.gameSynopsis === 1) && (this.state.gameStart === 0)) {
      return (
        <div className="Game">
          <div className="exit">
            <a href="/Game" className="btn btn-lg btn-danger nounderline" type="button">&nbsp; Exit &nbsp;</a>
          </div>
          <div className="synopsis">
            <h1>{games[this.state.gameID].Story}</h1>
          </div>
          <div className="start">
            <button id="start-btn" className="btn btn-lg btn-success" type="button" onClick={this.startGame}>&nbsp; Start &nbsp;</button>
          </div>
          <div id = "notAtLocationIndicator">
            <p></p>
          </div>

        </div>
      )
    }
    else if (this.state.gameReady && (this.state.gameSynopsis === 0) && (this.state.gameStart === 1)) {
      return (
        <div className="Game">
          <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css"
            integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay"
            crossOrigin="anonymous" />
          <br />
          <div className="exit">
            <button className="btn-lg btn-danger" type="button"><a href="/Game">&nbsp; Exit &nbsp;</a></button>
          </div>
          <div className="gameInterface">
            <Timer gameId={this.state.gameID} startCount="600" />
          </div>
          <br />
        </div>
      );
    }
  }
}


export default withAuthenticator(Game);