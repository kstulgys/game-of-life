import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import R from 'ramda'
import uid from 'uid'
import './styles.css'

const gridRows = 40
const gridCols = 60

const defaultGrid = R.map(row => Array(gridCols).fill(null), Array(gridRows))

const Box = ({ color }) => (
  <div className={`card ${color}`} style={{ width: 8, height: 8 }} />
)

const GridWrapper = children => (
  <div style={{ minWidth: `${8 * gridCols}px`, maxWidth: `${8 * gridCols}px` }}>
    <div className="d-flex flex-wrap shadow-lg">{children}</div>
  </div>
)

const mapRows = R.map(col => <Box color={col ? 'bg-danger' : 'bg-light'} />)
const gridItems = R.map(mapRows)
const gridArray = R.prop('grid')

const GridLayout = R.pipe(
  gridArray,
  gridItems,
  GridWrapper
)

class App extends Component {
  state = {
    grid: defaultGrid
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
    this.setState({ grid: nextGrid })
  }

  render() {
    return (
      <div className="App">
        <h1>Game Of Life</h1>
        <button onClick={this.seed}>Seed</button>
        <button onClick={this.playButton}>Play</button>
        <button onClick={this.stopButton}>Stop</button>

        <div className="d-flex justify-content-center">
          <GridLayout grid={this.state.grid} />
        </div>
      </div>
    )
  }
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
