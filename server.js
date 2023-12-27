const express = require("express");
const path = require("path");
const fs = require("fs");



const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");


const {
    readFromFile,
    readAndAppend,
    readDataFromFile,
    writeToFile,
} = require("./helper/fsUtils");


const PORT = 3001;

const app = express();

const dbNotePath = "./db/notes.json";






app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static("public"));

app.use(bodyParser.json());




app.get("/api/notes", (req, res) => {
    readFromFile("./db/notes.json").then((data) => res.json(JSON.parse(data)));
});


app.get("/notes", (req, res) =>
res.sendFile(path.join(__dirname, "/public/notes.html"))
);

app.get("*", (req, res) =>
res.sendFile(path.join(__dirname, "/public/index.html"))
);





app.post("/api/notes", (req, res) => {
    console.info(`${req.method} request received to add a note`);

    const { id, title, text } = req.body;

    if (title && text) {
        const newId = uuidv4();

        const newNote = {
            id: newId,
            title: title,
            text: text,
        };

        readAndAppend(newNote, "./db/notes.json");

        const response = {
            status: "success",
            body: newNote,
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json("Error in posting note.");
    }
});



app.put("/api/notes/:id", (req, res) => {
    const noteId = req.params.id;
    const updateNote = req.body;

    let notes = readDataFromFile(dbNotePath);

    const index = notes.findIndex((note) => note.id === noteId);

    if (index !== -1) {
        notes[index] = { ...notes[index], ...updateNote };

        writeToFile(dbNotePath, notes);

        res.status(200).json(notes[index]);
    } else {
        res.status(404).json({ error: "Note not found" });
    }
});




app.delete("/api/notes/:id", (req, res) => {
    const noteId = req.params.id;
    let notes = readDataFromFile(dbNotePath);

    const index = notes.findIndex((note) => note.id === noteId);

    if (index !== -1) {
        notes.splice(index, 1);
        writeToFile(dbNotePath, notes);
        res.status(204).send();
    } else {
        res.status(404).json({ error: "Note not found" });
    }
});


app.listen(PORT, () =>
console.log(`App listening at http://localhost:${PORT}`)
);



