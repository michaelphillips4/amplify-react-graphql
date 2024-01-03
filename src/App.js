import React, { useState, useEffect } from "react";
import "./App.css";
import { IoIosSave } from "react-icons/io";
import { MdAdd } from "react-icons/md";
import { FaSave, FaTrash } from "react-icons/fa";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from 'aws-amplify/api';

import {
  Flex,
  TextField,
  View,
  withAuthenticator,
  Alert
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";


const client = generateClient();

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);
  const [errors, setErrors] = useState();

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try{
    const apiData = await client.graphql({
       query: listNotes});

    const notesFromAPI = apiData.data.listNotes.items;
    setNotes(notesFromAPI);
    }
    catch (e)
    {
       setErrors(e)
    }

   
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
    };
    await client.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  return (
    <div className="App">
    <button onClick={signOut} className="float-right">Sign Out</button>
    <h1>Notes App</h1>
    
    {errors &&  <Alert
  variation="error"
  isDismissible={true}
  hasIcon={true}
  heading="Error"
  >{JSON.stringify(errors)}
 </Alert>}

     
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="left">
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <button type="submit" >
           Create Note <FaSave />
          </button>
        </Flex>
      </View>
      <h2>Current Notes</h2>



    

<ul>
        {notes.map((note) => (
          <li key={note.id}>
            <p>
            <button onClick={() => deleteNote(note)}>
              <FaTrash />
            </button>
            &nbsp; &nbsp;  <b >        {note.name}
            </b>
            <span>{note.description}</span>
          </p>

          </li>
        ))}
 </ul>   
   
    </div>
  );
};

export default withAuthenticator(App);