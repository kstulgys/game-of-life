import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import * as R from 'ramda'
import './styles.css'

const Box = ({ color }) => (
  <div className={`card ${color}`} style={{ width: 8, height: 8 }} />
)

const GridWrapper = props => (
  <div style={{ minWidth: `${8 * props.cols}px`, maxWidth: `${8 * props.cols}px` }}>
    <div className="d-flex flex-wrap shadow-lg">{props.layout}</div>
  </div>
)

const mapRows = R.map(col => <Box color={col ? 'bg-danger' : 'bg-light'} />)
const gridItems = R.map(mapRows)
const gridArray = R.prop('grid')

const GridLayout = R.pipe(
  gridArray,
  gridItems
)

class App extends Component {
  state = {
    rows: 50,
    columns: 80,
    generation: 0,
    grid: null
  }

  componentWillMount() {
    const defaultGrid = R.map(
      row => new Array(this.state.columns).fill(null),
      new Array(this.state.rows)
    )
    this.setState({ grid: defaultGrid })
  }

  seed = () => {
    const grid = [...this.state.grid]
    const mapRows = R.map(col => (Math.floor(Math.random() * 4) === 1 ? true : null))
    const seedGrid = R.map(mapRows, grid)
    this.setState({ grid: seedGrid })
  }

  playButton = () => {
    this.intervalId = setInterval(this.play, 50)
  }

  stopButton = () => {
    clearInterval(this.intervalId)
  }

  // rules:
  //   Any live cell with fewer than two live neighbors dies, as if by under population.
  // Any live cell with two or three live neighbors lives on to the next generation.
  // Any live cell with more than three live neighbors dies, as if by overpopulation.
  // Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

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
      const dies = col && 2 > count > 3
      const lives = (col && (count === 2 || count === 3)) || (!col && count === 3)
      return dies ? null : lives ? true : null
    }
    const mapIndexed = R.addIndex(R.map)
    const columns = (row, ridx) =>
      mapIndexed((col, cidx) => conditions(col, cidx, ridx, cg), row)
    const nextGrid = mapIndexed(columns, cg)
    this.setState({ grid: nextGrid, generation: this.state.generation + 1 })
  }

  render() {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ height: '80vh' }}
      >
        <h1 className="mt-4">Game Of Life</h1>
        <p>Generation: {this.state.generation}</p>

        <div className="pb-3 d-flex align-items-center">
          <button onClick={this.seed}>Seed</button>
          <button onClick={this.playButton}>Play</button>
          <button onClick={this.stopButton}>Stop</button>
          <select class="custom-select">
            <option selected>40x60</option>
            <option value="1">50x80</option>
            <option value="2">60x120</option>
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

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
