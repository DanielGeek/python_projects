import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useNavigate } from "react-router-dom";

import api from "../api";

function Home() {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");

    useEffect(() => {
        getNotes();
    }, []);

    const getNotes = () => {
        api.get("/api/notes/")
            .then((res) => res.data)
            .then((data) => { setNotes(data); console.log(data) })
            .catch((err) => alert(err));
    };

    const deleteNote = (id) => {
        api.delete(`/api/notes/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("Note deleted!");
                else alert("Failed to delete note.");
                getNotes();
            }).catch((error) => alert(error));
    };

    const createNote = (e) => {
        e.preventDefault();
        api.post("/api/notes/", { content, title }).then((res) => {
            if (res.status === 201) alert("Note created!")
            else alert("Failed to create note.")
            getNotes();
        }).catch((err) => alert(err));
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Welcome Home!</CardTitle>
                    <CardDescription>
                        You are successfully logged in to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This is your dashboard where you can create notes.
                    </p>
                    <form onSubmit={createNote}>
                        <div className="space-y-2">
                            <Input
                                type="text"
                                id="title"
                                name="title"
                                required
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <Textarea
                                id="content"
                                name="content"
                                required
                                placeholder="Content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
                        <br />
                        <Button
                            type="submit"
                            className="w-full"
                        >
                            Create Note
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Home
