import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import R from 'ramda'
import './styles.css'

const gridRows = 40
const gridCols = 60

const getGrid = () => {
  return R.map(row => Array(gridCols).fill(null), Array(gridRows))
}

const genNumber = () => {
  const rand = Math.random()
  const num = Math.floor(rand * 4)
  return num
}
const Box = ({ color }) => (
  <div className={`card ${color}`} style={{ width: '0.5rem', height: '0.5rem' }} />
)

const GridWrapper = children => (
  <div className="d-flex flex-wrap" style={{ width: `${8 * gridCols}px` }}>
    {children}
  </div>
)

const mapRows = R.map(col => <Box color={col ? 'bg-info' : 'bg-light'} />)
const GridItems = R.map(mapRows)
const GetGridArray = R.prop('grid')

const GridLayout = R.pipe(
  GetGridArray,
  GridItems,
  GridWrapper
)

const getMutation = (col, cidx, ridx, cg) => {}

class App extends Component {
  state = {
    grid: getGrid()
  }
  seed = () => {
    const grid = [...this.state.grid]
    const mapRows = R.map(col => (genNumber() === 1 ? true : null))
    const seedGrid = R.map(mapRows, grid)
    this.setState({ grid: seedGrid })
  }

  playButton = () => {
    this.intervalId = setInterval(this.play, 100)
  }

  stopButton = () => {
    clearInterval(this.intervalId)
  }

  // rules:
  // if null && count 2 || 3 => true
  // if true && count < 3 => false

  play = () => {
    console.log('play')
    let cg = [...this.state.grid]
    const conditions = (col, cidx, ridx, row) => {
      let count = 0

      cg[ridx - 1] && cg[ridx - 1][cidx] && count++
      cg[ridx - 1] && cg[ridx - 1][cidx + 1] && count++
      cg[ridx] && cg[ridx][cidx + 1] && count++
      cg[ridx + 1] && cg[ridx + 1][cidx + 1] && count++
      cg[ridx + 1] && cg[ridx + 1][cidx] && count++
      cg[ridx + 1] && cg[ridx + 1][cidx - 1] && count++
      cg[ridx] && cg[ridx][cidx - 1] && count++
      cg[ridx - 1] && cg[ridx - 1][cidx - 1] && count++

      const born = count === 2 || count === 3
      // const dies = null
      // const newVal =
      return born ? true : null
      // console.log(count)
      // console.log('count', cgg[ridx][cidx])
      // const topr = cidx && ridx && cg[ridx - 1][cidx + 1]
      // const right = cidx && ridx && cg[ridx][cidx + 1]
      // const rightb = cidx && ridx && cg[ridx + 1][cidx + 1]
      // const bottom = cidx && ridx && cg[ridx + 1][cidx]
      // const bottoml = cidx && ridx && cg[ridx + 1][cidx - 1]
      // const left = cidx && ridx && cg[ridx][cidx - 1]
      // const leftt = cidx && ridx && cg[ridx - 1][cidx - 1]
      // const suroundings = [top, topr, right, rightb, bottom, bottoml, left, leftt]
      // console.log('cond', suroundings)
      // R.map(x => x && count++, suroundings)
    }
    // conditions(cidx, ridx, cg)
    const mapIndexed = R.addIndex(R.map)

    let columns = (row, ridx) =>
      mapIndexed((col, cidx) => conditions(col, cidx, ridx, row), row)

    let nextGrid = mapIndexed(columns, cg)
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
