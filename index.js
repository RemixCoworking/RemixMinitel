import React, {Component} from 'react';
import blessed from 'blessed';
import {render} from 'react-blessed';
import Fuse from "fuse.js"
import debounce from "lodash.debounce";

/*

extract datas

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
      type: 'line'
    },
    style: {
      border: {
        fg: 'blue'
      }
    }
  }
};

let coworkers = require('./coworkers.json');


const sortByKey = key => (a, b) => {
  if (a[key] < b[key])
    return -1;
  if (a[key] > b[key])
    return 1;
  return 0;
}

coworkers.sort(sortByKey('lastname'))

var options = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "lastname",
    "firstname",
    "bio"
  ]
};

var fuse = new Fuse(coworkers, options);

const search = query => fuse.search(query)

const shortFirst = first => first.substring(0, 3) + '.'

const renderName = (user, maxLength=14) => {
  let fullName = `${user.firstname} ${user.lastname.toUpperCase()}`;
  if (fullName.length > maxLength) {
    fullName = `${shortFirst(user.firstname)} ${user.lastname.toUpperCase()}`;
  }
  return fullName.substring(0, maxLength);
}


class App extends Component {
  state = {
    selectedIndex: 0,
    query: null
  }

  moveCount = 0;
  moveTimer = null;

  componentDidMount() {
    screen.key(['p', 'S-p'], (ch, key) => {
      this.moveCount -= 1;
      if (this.moveTimer) clearTimeout(this.moveTimer)
      this.moveTimer = setTimeout(() => {
        this.setState({
          selectedIndex: Math.max(0, this.state.selectedIndex + this.moveCount)
        })
      }, 200)
    });

    screen.key(['m', 'S-m'], (ch, key) => {
      this.moveCount += 1;
      if (this.moveTimer) clearTimeout(this.moveTimer)
      this.moveTimer = setTimeout(() => {
        this.setState({
          selectedIndex: Math.max(0, this.state.selectedIndex + this.moveCount)
        })
      }, 200)
    });

    screen.key(['o', 'S-O', 'enter'], (ch, key) => {
      this.setState({
        query: ''
      }, () => {
        this.input.clearValue()
      });
      this.input.focus()
    });

    this.input.focus()

  }

  componentDidUpdate() {
    this.moveCount = 0;
  }

  onSubmit = value => {
    this.setState({
      query: value,
      selectedIndex: 0
    })
  }
  render() {
    const results = this.state.query && search(this.state.query) || coworkers;
    const items = results.map(c => renderName(c))

    const coworker = results[this.state.selectedIndex];
    const tags = coworker && coworker.tags.slice(0, 3) || []
    return (
      <element width={40} height={24}>
        <box class={stylesheet.bordered} width="100%" height="15%">
          <box>Coworker : </box>
          <textbox
            ref={inst => this.input = inst}
            onSubmit={this.onSubmit}
            keys={true}

            inputOnFocus={true}
          >
          </textbox>
        </box>
        <box class={stylesheet.bordered} top="15%" height="85%" left="0" width="40%">
          <list
            label="No results"
            keys={true}
            ref={inst => {
              this.list = inst;
            }}
            selected={this.state.selectedIndex}
            style={ {
              item: {
                hover: {
                  bg: 'white'
                }
              },
              selected: {
                bg: 'white',
                bold: true
              }
            } }
            items={ items }
          >
          </list>
        </box>
        { coworker && <box class={stylesheet.bordered} top="15%" height="85%" left="40%" width="60%">
          <box height={2} style={{bold: true}}>
            {coworker.firstname} {coworker.lastname.toUpperCase()}
          </box>
          <box top={2} height={2}>
            {coworker.email}
          </box>
          <box top={4} height={tags.length + 1} >
            {tags && tags.map(t => `#${t}`).join('\n')}
          </box>
          <box top={tags.length + 5}>
            {coworker.bio}
          </box>
        </box> }
      </element>
    );
  }
}


// Creating our screen
const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
 // title: 'react-blessed hello world',
  width: 40,
  height:24,
  fullUnicode: false,
  terminal: 'm1'
});

// Adding a way to quit the program
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});




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
const component = render(<App />, screen);