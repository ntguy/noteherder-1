import React, { Component } from 'react'
import base, { auth } from './base'

import './App.css'
import Main from './Main'
import SignIn from './SignIn'

class App extends Component {
  constructor() {
    super()

    this.state = {
      notes: {},
      currentNoteId: null,
      uid: null,
    }
  }

  componentWillMount = () => {
    this.getUserFromLocalStorage()
    auth.onAuthStateChanged(
      (user) => {
        if (user) {
          // signed in
          this.handleAuth(user)
        } else {
          // signed out
          this.handleUnauth()
        }
      }
    )
  }

  getUserFromLocalStorage = () => {
    const uid = localStorage.getItem('uid')
    if (!uid) return
    this.setState({ uid })
  }

  syncNotes = () => {
    this.bindingRef = base.syncState(
      `notes/${this.state.uid}`,
      {
        context: this,  // what object the state is on
        state: 'notes', // which property to sync
      }
    )
  }

  setCurrentNoteId = (noteId) => {
    this.setState({ currentNoteId: noteId })
  }

  resetCurrentNote = () => {
    this.setCurrentNoteId(null)
  }

  saveNote = (note) => {
    const notes = {...this.state.notes}
    if (!note.id) {
      note.id = Date.now()
    }
    notes[note.id] = note

    this.setState({ notes })
    this.setCurrentNoteId(note.id)
  }

  removeNote = (note) => {
    const notes = {...this.state.notes}
    notes[note.id] = null

    this.setState({ notes })
    this.resetCurrentNote()
  }

  signedIn = () => {
    return this.state.uid
  }

  handleAuth = (user) => {
    localStorage.setItem('uid', user.uid)
    this.setState(
      { uid: user.uid },
      this.syncNotes
    )
  }

  handleUnauth = () => {
    localStorage.removeItem('uid')
    if (this.bindingRef) {
      base.removeBinding(this.bindingRef)
    }

    this.setState({
      uid: null,
      notes: {},
      currentNoteId: null,
    })
  }

  signOut = () => {
    auth.signOut()
  }

  renderMain() {
    const actions = {
      setCurrentNoteId: this.setCurrentNoteId,
      resetCurrentNote: this.resetCurrentNote,
      saveNote: this.saveNote,
      removeNote: this.removeNote,
      signOut: this.signOut,
    }

    const noteData = {
      notes: this.state.notes,
      currentNoteId: this.state.currentNoteId,
    }

    return (
      <Main
        {...actions}
        {...noteData}
      />
    )
  }

  render() {
    return (
      <div className="App">
        { this.signedIn() ? this.renderMain() : <SignIn /> }
      </div>
    );
  }
}

export default App
