import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
	render() {
		return (
			<button className={this.props.status} onClick={() => this.props.onClick()}></button>
		);
	}
}

class Grid extends React.Component {
	renderSquare(x, y) {
		return <Square key={y*this.props.width + x} status={this.props.status[y*this.props.width + x]} onClick={() => this.props.handleClick(x, y)} /> 
	}

	render() {	
		var rows = [];
		for(var y = 0; y < this.props.height; y++) {
			var col = [];
			for(var x = 0; x < this.props.width; x++) {
				col.push(this.renderSquare(x, y));		
			}
			rows.push(<div className="grid-row" key={y}>{col}</div>);
		}
		return (
			<div>
				{rows}
			</div>
		);
	}
}

class PathFinder extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			status: Array(this.props.width * this.props.height).fill("unselected"),
			startIdx: -1,
			endIdx: -1,
			start: false,
			end: false,
			startText: "Place Start",
			endText: "Place End",
		}
	}


	handleClick(x, y) {
		const status = this.state.status.slice();
		let idx = y * this.props.width + x;
		if(this.state.start) {
			if(this.state.startIdx !== -1) {
				status[this.state.startIdx] = "unselected";
			}
			if(this.state.endIdx === idx) {
				this.setState({endIdx: -1});
			}
			this.setState({startIdx: idx});
			status[idx] = "start";
		} else if(this.state.end) {
			if(this.state.endIdx !== -1) {
				status[this.state.endIdx] = "unselected";
			}
			if(this.state.startIdx === idx) {
				this.setState({startIdx: -1});
			}
			this.setState({endIdx: idx});
			status[idx] = "end";
		} else {
			if(status[idx] === "unselected") {
				status[idx] = "wall";
			} else {
				if(status[idx] === "start"){
					this.setState({startIdx: -1});
				} else if(status[idx] === "end") {
					this.setState({endIdx: -1});
				}
				status[idx] = "unselected";
			}
		}
		this.setState({status: status});	
	}
	
	placeStart() {
		if(!this.state.start) {
			this.setState({end: false});
			this.setState({startText: "Cancel"});
			this.setState({endText: "Place End"});
		} else {
			this.setState({startText: "Place Start"})		
		}
		this.setState({start: !this.state.start});
	}
	
	placeEnd() {
		if(!this.state.end) {
			this.setState({start: false});
			this.setState({endText: "Cancel"});
			this.setState({startText: "Place Start"});
		} else {
			this.setState({endText: "Place End"});
		}
		this.setState({end: !this.state.end});
	}

	
	render() {

		return (
			<div>
				<Grid width={this.props.width} height={this.props.height} status={this.state.status} handleClick={(x, y) => this.handleClick(x, y)}/>	
				<div className="bottomBar">
					<button className={"place"} onClick = {() => this.placeStart()}>{this.state.startText}</button>
					<button className={"place"} onClick = {() => this.placeEnd()}>{this.state.endText}</button>
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<PathFinder width={40} height={25} />,
	document.getElementById('root')
);
