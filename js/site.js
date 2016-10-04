'use strict';

//	Creates the game Grid
function CreateGrid(rows, columns) {
	let matrix = [];
	for (let rowIndex = 0; rowIndex < rows; ++rowIndex) {
		let row = [];
		for (let columnIndex = 0; columnIndex < columns; ++columnIndex) {
			row.push(rowIndex + "" + columnIndex);
		}
		matrix.push(row);
	}

	return matrix;
}

//	Container for the memory game
var Container = (props) => {
	return <Game rows={props.rows} columns={props.columns} activeCellCount={props.activeCellCount} allowedIncorrectAttemps={props.allowedIncorrectAttemps}/>
};

//	The Memory Game component
class Game extends React.Component {
	constructor(props) {
		super(props);
		this.matrix = CreateGrid(this.props.rows, this.props.columns);
		this.flatMatrix = _.flatten(this.matrix);
		this.activeCells = this.getSample(this.flatMatrix);
		this.state = {
			gameState: 'ready',
			wrongGuess: [],
			correctGuess: []
		};
	}
	componentDidMount() {
		this.startGame();
	}
	resetState(flatMatrix) {
		this.activeCells = this.getSample(flatMatrix)
		this.setState({
			gameState: 'ready',
			wrongGuess: [],
			correctGuess: []
		});
	}
	getSample(flatMatrix) { return _.sampleSize(flatMatrix, this.props.activeCellCount); }
	resetGame() {
		console.log("game reset");
		this.resetState(this.flatMatrix);
		this.startGame();		
	}
	recordGuess({cellId, userGuessIsCorrect}) {
		let { wrongGuess, correctGuess, gameState } = this.state;
		if (userGuessIsCorrect) {
			correctGuess.push(cellId);
			if (correctGuess.length === this.props.activeCellCount)
				gameState = "won";
		}
		else {
			wrongGuess.push(cellId);
			if (wrongGuess.length > this.props.allowedIncorrectAttemps)
				gameState = "lost";
		}

		this.setState({ correctGuess, wrongGuess, gameState });
	}
	render() {
		let showActiveCells = ['memorize', 'lost'].indexOf(this.state.gameState) > -1;
		return (
			//	Renders the grid using Row and Cell components
			<div className="memory-grid">
				<Message {...this.state} activeCellCount={this.props.activeCellCount} replayGame={this.resetGame.bind(this)} />
				{
					this.matrix.map((row, rowIndex) => (
						<Row key={rowIndex}>
							{row.map(cellId =>
								<Cell key={cellId}
									id={cellId}
									activeCells={this.activeCells} {...this.state}
									recordGuess={this.recordGuess.bind(this) }
									showActiveCells={showActiveCells}
									/>) }
						</Row>
					))
				}
			</div>
		);
	}
	startGame() {
		setTimeout(() => {
			this.setState(
				{ gameState: 'memorize' },
				() => { setTimeout(() => this.setState({ gameState: 'recall' }), 2000); }
			)
		},
			2000
		);
	}
};

//	A memory Row component
var Row = (props) => {
	return <div className="memory-row">{props.children}</div>
};

//	A memory Cell component
class Cell extends React.Component {
	active() {
		return this.props.activeCells.indexOf(this.props.id) > -1;
	}
	handleClick() {
		if (this.guessState() === "" && this.props.gameState === 'recall') {
			this.props.recordGuess({
				cellId: this.props.id,
				userGuessIsCorrect: this.active()
			})
		}
	}
	guessState() {
		if (this.props.correctGuess.indexOf(this.props.id) > -1)
			return " correct";
		else if (this.props.wrongGuess.indexOf(this.props.id) > -1)
			return " incorrect";

		return "";
	}
	render() {
		let isActive = (this.props.showActiveCells && this.active());
		let className = "memory-cell" + (isActive ? " active" : "");
		className += this.guessState();

		return <div className={className} onClick={this.handleClick.bind(this) }></div>
	}
}

//	Messaging component
class Message extends React.Component {
	playAgain() {
		if (this.props.gameState === 'won' || this.props.gameState === 'lost') {
			return <span className="btn" onClick={this.props.replayGame}>Play Again</span>
		}
	}
	remainingCount() {
		if (this.props.gameState !== 'recall') { return null; }
		return (
			<span className="remaining-count">
				{ this.props.activeCellCount - this.props.correctGuess.length }
			</span>
		);
	}
	render() {
		return (
			<span className="message-box">
				{this.props.text[this.props.gameState]} &nbsp;
				
				{ this.remainingCount() }
				
				{ this.playAgain() }
			</span>
		);
	}
}

//	Sets the default properties for the messages
Message.defaultProps = {
	text: {
		ready: "Get Ready",
		memorize: "Memorize",
		recall: "Recall",
		won: "Well Played",
		lost: "Game over, try again"
	}
}

//	Renders the Game
ReactDOM.render(
	<Container rows={5} columns={5} activeCellCount={6} allowedIncorrectAttemps={2} />,
	document.getElementById("container")
);