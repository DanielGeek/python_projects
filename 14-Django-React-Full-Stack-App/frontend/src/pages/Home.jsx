import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "../api";
import Note from "../components/Note";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";

function Home() {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const { t } = useTranslation();

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
                if (res.status === 204) alert(t('home.alerts.noteDeleted'));
                else alert(t('home.alerts.failedToDeleteNote'));
                getNotes();
            }).catch((error) => alert(error));
    };

    const createNote = (e) => {
        e.preventDefault();
        api.post("/api/notes/", { content, title }).then((res) => {
            if (res.status === 201) alert(t('home.alerts.noteCreated'));
            else alert(t('home.alerts.failedToCreateNote'));
            getNotes();
        }).catch((err) => alert(err));
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">{t('app.title')}</h1>
                    <LanguageSelector />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Create Note Card */}
                    <div className="lg:col-span-1">
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>{t('home.title')}</CardTitle>
                                <CardDescription>
                                    {t('home.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={createNote}>
                                    <div className="space-y-4">
                                        <Input
                                            type="text"
                                            id="title"
                                            name="title"
                                            required
                                            placeholder={t('home.titlePlaceholder')}
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                        <Textarea
                                            id="content"
                                            name="content"
                                            required
                                            placeholder={t('home.contentPlaceholder')}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            className="min-h-[120px]"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full mt-4"
                                    >
                                        {t('home.createButton')}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notes List */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold">Your Notes</h2>
                            <p className="text-muted-foreground">
                                Manage and view all your notes
                            </p>
                        </div>
                        {notes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {notes.map((note) => (
                                    <Note
                                        key={note.id}
                                        note={note}
                                        onDelete={deleteNote}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="col-span-full text-center text-muted-foreground py-12">
                                {t('home.noNotes')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
