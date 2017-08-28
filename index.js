import React, { Component } from "react"
import blessed from "blessed"
import { render } from "react-blessed"
import Fuse from "fuse.js"
import debounce from "lodash.debounce"
import figlet from "figlet"
/*

extract datas from community website

copy(Array.from($0.querySelectorAll('a')).map(c => angular.element(c).scope().user).filter(Boolean).map(user => ({
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  bio: user.bio,
  tags: user.tagos.map(t => t.tag)
})))

*/

const stylesheet = {
  bordered: {
    border: {
      type: "line"
    },
    style: {
      border: {
        fg: "blue"
      }
    }
  }
}

let coworkers = require("./coworkers.json")

const sortByKey = key => (a, b) => {
  if (a[key] < b[key]) return -1
  if (a[key] > b[key]) return 1
  return 0
}

coworkers.sort(sortByKey("lastname"))

var options = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["lastname", "firstname", "bio"]
}

var fuse = new Fuse(coworkers, options)

const search = query => fuse.search(query)

const shortFirst = first => first.substring(0, 3) + "."

const renderName = (user, maxLength = 14) => {
  let fullName = `${user.firstname} ${user.lastname.toUpperCase()}`
  if (fullName.length > maxLength) {
    fullName = `${shortFirst(user.firstname)} ${user.lastname.toUpperCase()}`
  }
  return fullName.substring(0, maxLength)
}

const Detail = detail => {
  const tags = (detail && detail.tags.slice(0, 3)) || []
  return (
    <box class={stylesheet.bordered} top="15%" height="85%" left="40%" width="60%">
      <box height={2} style={{ bold: true }}>
        {detail.firstname} {detail.lastname.toUpperCase()}
      </box>
      <box top={2} height={2}>
        {detail.email}
      </box>
      <box top={4} height={tags.length + 1}>
        {tags && tags.map(t => `#${t}`).join("\n")}
      </box>
      <box top={tags.length + 5}>
        {detail.bio}
      </box>
    </box>
  )
}

class Annuaire extends Component {
  state = {
    selectedIndex: 0,
    query: null
  }

  moveCount = 0
  moveTimer = null

  componentDidMount() {
    // bind P key to list up
    screen.key(["p", "S-p"], (ch, key) => {
      this.moveCount -= 1
      if (this.moveTimer) clearTimeout(this.moveTimer)
      this.moveTimer = setTimeout(() => {
        this.setState({
          selectedIndex: Math.max(0, this.state.selectedIndex + this.moveCount)
        })
      }, 200)
    })
    // bind M key to list down
    screen.key(["m", "S-m"], (ch, key) => {
      this.moveCount += 1
      if (this.moveTimer) clearTimeout(this.moveTimer)
      this.moveTimer = setTimeout(() => {
        this.setState({
          selectedIndex: Math.max(0, this.state.selectedIndex + this.moveCount)
        })
      }, 200)
    })
    // bind o key and enter to reset + focus
    screen.key(["o", "S-O", "enter"], (ch, key) => {
      if (!this.input) {
        return
      }
      this.setState(
        {
          query: ""
        },
        () => {
          this.input.clearValue()
        }
      )
      this.input.focus()
    })

    this.input.focus()
  }

  componentDidUpdate() {
    this.moveCount = 0
  }

  onSubmit = value => {
    this.setState({
      query: value,
      selectedIndex: 0
    })
  }
  render() {
    // results
    const results = (this.state.query && search(this.state.query)) || coworkers
    // names for the list
    const names = results.map(c => renderName(c))
    // selected item
    const detail = results[this.state.selectedIndex]

    return (
      <element width={40} height={24}>
        <box class={stylesheet.bordered} width="100%" height="15%">
          <box>Search : </box>
          <textbox ref={inst => (this.input = inst)} onSubmit={this.onSubmit} keys={true} inputOnFocus={true} />
        </box>
        <box class={stylesheet.bordered} top="15%" height="85%" left="0" width="40%">
          <list
            label="No results"
            keys={true}
            ref={inst => {
              this.list = inst
            }}
            selected={this.state.selectedIndex}
            style={{
              item: {
                hover: {
                  bg: "white"
                }
              },
              selected: {
                bg: "white",
                bold: true
              }
            }}
            items={names}
          />
        </box>
        {detail && <Detail {...detail} />}
      </element>
    )
  }
}



class Home extends Component {
  render() {

    const text = figlet.textSync('REMIX', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        kerning: 'full'
    });
    return (
      <element width={40} height={24}>
        <box align="center" height={5}>{text}</box>
        <box style={{ blink: true }} align="center" top={6}> C  O  M  M  U  N  I  T  Y</box>

        <box align="left" class={stylesheet.bordered} top={8} padding={2}>

           <box top={0}>- "Guide" = annuaire</box>
           <box top={2}>- "Connexion FIN" = accueil</box>

        </box>
      </element>
    )
  }
}




// Creating our screen
const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  // title: 'react-blessed hello world',
  width: 40,
  height: 24,
  fullUnicode: false,
  terminal: "m1"
})



class App extends Component {
  state = {
    screen: Home
  }
  componentDidMount() {
    // Adding a way to quit the program
    let previousKey = null
    screen.key(["escape", "q", "C-c"], function(ch, key) {
      previousKey = null
      return process.exit(0)
    })

    screen.key(["pageup"], function(ch, key) {
      previousKey = null
      //return process.exit(0)
    })

    screen.key(["C-s"], function(ch, key) {
      previousKey = "C-S"
    })

    screen.key(["S-y"], (ch, key) => {
      if (previousKey === "C-S") {
        this.setState({
          screen: Home
        })
      }
    })

    screen.key(["S-d"], (ch, key) => {
      if (previousKey === "C-S") {
        this.setState({
          screen: Annuaire
        })
      }
    })
  }
  render() {
    const Cmp = this.state.screen
    return <Cmp/>
  }
}

// Add a png icon to the box
// var image = blessed.image({
//   top: 0,
//   left: 0,
//   type: 'overlay',
//   width: 'shrink',
//   height: 'shrink',
//   file: __dirname + '/sophie.jpeg',
//   search: false
// });

// Rendering the React app using our screen
const component = render(<App />, screen)
