import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import * as R from 'ramda'
import './styles.css'

class App extends Component {
  state = {
    rows: 30,
    cols: 50,
    generation: 0,
    grid: []
  }

  componentDidMount() {
    this.setAndSeedGrid()
  }

  componentDidUpdate(nextProps, nextState) {
    this.state.cols !== nextState.cols && this.setAndSeedGrid()
  }

  setAndSeedGrid = async () => {
    await this.setGrid()
    await this.seedGrid()
  }

  setGrid = () => {
    const grid = R.map(row => Array(this.state.cols).fill(null), Array(this.state.rows))
    this.setState({ grid })
  }

  seedGrid = () => {
    const mapRows = R.map(col => (Math.floor(Math.random() * 10) === 1 ? true : null))
    const grid = R.map(mapRows, this.state.grid)
    this.setState({ grid, generation: 0 })
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
      // rules:
      // Any live cell with fewer than two live neighbors dies, as if by under population.
      // Any live cell with two or three live neighbors lives on to the next generation.
      // Any live cell with more than three live neighbors dies, as if by overpopulation.
      // Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
      cg[ridx - 1] && cg[ridx - 1][cidx] && count++
      cg[ridx - 1] && cg[ridx - 1][cidx + 1] && count++
      cg[ridx] && cg[ridx][cidx + 1] && count++
      cg[ridx + 1] && cg[ridx + 1][cidx + 1] && count++
      cg[ridx + 1] && cg[ridx + 1][cidx] && count++
      cg[ridx + 1] && cg[ridx + 1][cidx - 1] && count++
      cg[ridx] && cg[ridx][cidx - 1] && count++
      cg[ridx - 1] && cg[ridx - 1][cidx - 1] && count++

      // const underPopulation = col && count < 3
      // const overPopulation = col && count > 3
      // const optimalPopulation = col && (count === 2 || count === 3)
      // const reproduction = !col && count === 3
      // const lives = optimalPopulation || reproduction
      // return lives ? lives : null
      return count === 3 || (col && count === 2)
    }
    const mapIndexed = R.addIndex(R.map)
    const columns = (row, ridx) =>
      mapIndexed((col, cidx) => conditions(col, cidx, ridx, cg), row)
    const nextGrid = mapIndexed(columns, cg)
    this.setState({
      grid: nextGrid,
      generation: this.state.generation + 1
    })
  }

  changeGrid = ({ target: { value } }) => {
    value === '1' && this.setState({ rows: 30, cols: 50 })
    value === '2' && this.setState({ rows: 50, cols: 70 })
    value === '3' && this.setState({ rows: 70, cols: 100 })
  }

  render() {
    // console.log(this.state)
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ height: '80vh' }}
      >
        <h1 className="mt-4">Game Of Life</h1>
        <p>Generation: {this.state.generation}</p>

        <div className="pb-3 d-flex align-items-center">
          <button onClick={this.seedGrid}>Seed</button>
          <button onClick={this.playButton}>Play</button>
          <button onClick={this.stopButton}>Stop</button>
          <select className="custom-select" onChange={this.changeGrid}>
            <option value="1">30x50</option>
            <option value="2">50x70</option>
            <option value="3">70x100</option>
          </select>
        </div>

        <div className="d-flex justify-content-center">
          <GridWrapper
            cols={this.state.cols}
            rows={this.state.rows}
            layout={<GridLayout grid={this.state.grid} />}
          />
        </div>
      </div>
    )
  }
}

const Box = ({ color }) => (
  <div className={`card ${color}`} style={{ width: 8, height: 8 }} />
)

const GridWrapper = ({ cols, layout }) => (
  <div
    style={{
      width: `${8 * cols}px`
    }}
  >
    <div className="d-flex flex-wrap shadow-lg">{layout}</div>
  </div>
)

const mapRows = R.map(col => <Box color={col ? 'bg-danger' : 'bg-light'} />)
const gridItems = R.map(mapRows)
const gridArray = R.prop('grid')

const GridLayout = R.pipe(
  gridArray,
  gridItems
)

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
