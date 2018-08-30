import React, { Component } from "react"
import ReactDOM from "react-dom"
import * as R from "ramda"
import "./styles.css"
// <option defaultValue={{ rows: 50, cols: 80 }}>30x50</option>
// 	<option value={{ rows: 50, cols: 80 }}>50x80</option>
// 	<option value={{ rows: 80, cols: 120 }}>80x120</option>
const options = [
	{ id: 1, rc: { rows: 30, columns: 50 }, text: "30x50" },
	{ id: 2, rc: { rows: 50, columns: 80 }, text: "50x80" },
	{ id: 3, rc: { rows: 80, columns: 130 }, text: "80x130" }
]

const Box = ({ color }) => (
	<div className={`card ${color}`} style={{ width: 8, height: 8 }} />
)

const GridWrapper = props => (
	<div
		style={{
			minWidth: `${8 * props.cols}px`,
			maxWidth: `${8 * props.cols}px`
		}}>
		<div className="d-flex flex-wrap shadow-lg">{props.layout}</div>
	</div>
)

const mapRows = R.map(col => <Box color={col ? "bg-danger" : "bg-light"} />)
const gridItems = R.map(mapRows)
const gridArray = R.prop("grid")

const GridLayout = R.pipe(
	gridArray,
	gridItems
)

class App extends Component {
	state = {
		rows: 30,
		columns: 50,
		generation: 0,
		grid: []
	}

	componentWillMount() {
		const defaultGrid = R.map(
			row => Array(this.state.columns).fill(null),
			Array(this.state.rows)
		)
		const mapRows = R.map(
			col => (Math.floor(Math.random() * 10) === 1 ? true : null)
		)
		const seedGrid = R.map(mapRows, defaultGrid)
		this.setState({ grid: seedGrid })
	}
	componentDidUpdate(prevProps, prevState) {
		const defaultGrid = R.map(
			row => Array(this.state.columns).fill(null),
			Array(this.state.rows)
		)

		this.state.rows != prevState.rows &&
			this.setState({
				grid: defaultGrid
			})
	}

	seed = () => {
		this.setState({ generation: 0 })
		const grid = [...this.state.grid]
		const mapRows = R.map(
			col => (Math.floor(Math.random() * 10) === 1 ? true : null)
		)
		const seedGrid = R.map(mapRows, grid)
		this.setState({ grid: seedGrid, generation: 0 })
	}

	playButton = () => {
		this.intervalId = setInterval(this.play, 50)
	}

	stopButton = () => {
		clearInterval(this.intervalId)
	}

	play = () => {
		const cg = [...this.state.grid]
		const conditions = (col, cidx, ridx, cg) => {
			let count = 0
			cg[ridx - 1] && cg[ridx - 1][cidx] && count++
			cg[ridx - 1] && cg[ridx - 1][cidx + 1] && count++
			cg[ridx] && cg[ridx][cidx + 1] && count++
			cg[ridx + 1] && cg[ridx + 1][cidx + 1] && count++
			cg[ridx + 1] && cg[ridx + 1][cidx] && count++
			cg[ridx + 1] && cg[ridx + 1][cidx - 1] && count++
			cg[ridx] && cg[ridx][cidx - 1] && count++
			cg[ridx - 1] && cg[ridx - 1][cidx - 1] && count++

			// rules:
			// Any live cell with fewer than two live neighbors dies, as if by under population.
			// Any live cell with two or three live neighbors lives on to the next generation.
			// Any live cell with more than three live neighbors dies, as if by overpopulation.
			// Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

			// const underPopulation = col && count < 3
			// const overPopulation = col && count > 3
			// const optimalPopulation = col && (count === 2 || count === 3)
			// const reproduction = !col && count === 3
			// const lives = optimalPopulation || reproduction
			return count === 3 || (col && count === 2)
		}
		const mapIndexed = R.addIndex(R.map)
		const columns = (row, ridx) =>
			mapIndexed((col, cidx) => conditions(col, cidx, ridx, cg), row)
		const nextGrid = mapIndexed(columns, cg)
		this.setState(({ grid, generation }) => ({
			grid: nextGrid,
			generation: generation + 1
		}))
	}

	changeGrid = ({ target: { value } }) => {
		const filtered = R.filter(i => i.id == value)(options)
		// const a = filtered[0].rc
		// console.log(a)
		this.setState(filtered[0].rc)
	}
	render() {
		// console.log(this.state.grid)
		return (
			<div
				className="d-flex flex-column align-items-center justify-content-center"
				style={{ height: "80vh" }}>
				<h1 className="mt-4">Game Of Life</h1>
				<p>Generation: {this.state.generation}</p>

				<div className="pb-3 d-flex align-items-center">
					<button onClick={this.seed}>Seed</button>
					<button onClick={this.playButton}>Play</button>
					<button onClick={this.stopButton}>Stop</button>
					<select className="custom-select" onChange={this.changeGrid}>
						{R.map(
							({ text, id }) => (
								<option key={id} value={id}>
									{text}
								</option>
							),
							options
						)}
					</select>
				</div>

				<div className="d-flex justify-content-center">
					<GridWrapper
						cols={this.state.columns}
						rows={this.state.rows}
						layout={<GridLayout grid={this.state.grid} />}
					/>
				</div>
			</div>
		)
	}
}

const rootElement = document.getElementById("root")
ReactDOM.render(<App />, rootElement)
