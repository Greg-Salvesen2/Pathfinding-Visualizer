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

function Node(x, y, targetX, targetY) {
	this.distance = Number.MAX_SAFE_INTEGER * 1.0;
	this.x = x;
	this.y = y;
	this.targetX = targetX;
	this.targetY = targetY;
	this.visited = false;
	this.connectingNode = null;
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
			currentNode: new Node(-1, -1, -1, -1),
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

	setupNodes() {
		var nodes = new Array(this.props.height);
		for(var i = 0; i < nodes.length; i++) {
			nodes[i] = new Array(this.props.width);
		}

		const status = this.state.status.slice();
		let targetX = this.state.endIdx % this.props.width;
		let targetY = Math.floor(this.state.endIdx / this.props.width)
		for(i = 0; i < status.length; i++) {
			let x = i % this.props.width;
			let y = Math.floor(i / this.props.width);
			if(status[i] === "wall") {
				nodes[y][x] = null;
				continue;
			}
			let node = new Node(x, y, targetX, targetY);
			if(status[i] === "start") {
				node.distance = 0;
			} 
			nodes[y][x] = node;
		}
		return nodes;
	}

	findNextNode(nodes, currentNode) {
		var smallestX, smallestY;
		var value = Number.MAX_SAFE_INTEGER;
		for(var i = 0; i < nodes.length; i++) {
			for(var j = 0; j < nodes[i].length; j++) {
				if(nodes[i][j] != null && !nodes[i][j].visited && nodes[i][j].distance < value) {
					smallestX = j;
					smallestY = i;
					value = nodes[i][j].distance;
				}
			}
		}
		if(value === Number.MAX_SAFE_INTEGER) {
			return null;
		} else {
			return nodes[smallestY][smallestX]
		}
	}

	checkSurroundingNodes(nodes, current, diagonal) {
		var x = current.x;
		var y = current.y;
		for(var i = x - 1; i <= x + 1; i++) {
			for(var j = y - 1; j <= y + 1; j++) {
				if(i < 0 || i >= this.props.width || j < 0 || j >= this.props.height || nodes[j][i] == null || nodes[j][i].visited) {
					continue;
				}
				if(!diagonal && i !== x && j !== y) {
					continue;
				}
				if(i !== x && j !== y) {
					if(current.distance + 1.414 < nodes[j][i].distance) {
						nodes[j][i].distance = current.distance + 1.414;
						nodes[j][i].connectingNode = current;
					}
				} else if(current.distance + 1 < nodes[j][i].distance) {
					nodes[j][i].distance = current.distance + 1;
					nodes[j][i].connectingNode = current;
				}

			}
		}
		nodes[current.y][current.x].visited = true;
		return this.findNextNode(nodes, current);
	}

	runPathFinding() {
		if(this.state.startIdx === -1 || this.state.endIdx === -1) {
			alert("Error: Start and End State must be defined");
			return;
		}
		var nodes = this.setupNodes();
		let startX = this.state.startIdx % this.props.width;
		let startY = Math.floor(this.state.startIdx / this.props.width);
		let targetX = this.state.endIdx % this.props.width;
		let targetY = Math.floor(this.state.endIdx / this.props.width);
		let currentNode = nodes[Math.floor(this.state.startIdx / this.props.width)][this.state.startIdx % this.props.width]; 
		while(currentNode != null && !nodes[targetY][targetX].visited) {
			currentNode = this.checkSurroundingNodes(nodes, currentNode, true);
		}
		if(currentNode != null) {
			currentNode = nodes[targetY][targetX].connectingNode;
			const status = this.state.status;
			while(currentNode !== nodes[startY][startX]) {
				status[currentNode.y * this.props.width + currentNode.x] = "path";
				currentNode = currentNode.connectingNode;
			}
			this.setState({status: status});
		} else {
			alert("No Path to the end found");
		}
	}

	render() {
		return (
			<div>
				<Grid width={this.props.width} height={this.props.height} status={this.state.status} handleClick={(x, y) => this.handleClick(x, y)}/>	
				<div className="bottomBar">
					<button className={"place"} onClick = {() => this.placeStart()}>{this.state.startText}</button>
					<button className={"place"} onClick = {() => this.placeEnd()}>{this.state.endText}</button>
					<button className={"begin"} onClick = {() => this.runPathFinding()}>Run Pathfinder</button>
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<PathFinder width={40} height={25} />,
	document.getElementById('root')
);
