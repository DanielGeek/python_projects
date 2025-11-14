import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";

function Note({ note, onDelete }) {
    const { t } = useTranslation();
    const formattedDate = new Date(note.create_at).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg">{note.title}</CardTitle>
                <CardDescription>{formattedDate}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                <Button
                    variant="destructive"
                    size="sm"
                    className="mt-4"
                    onClick={() => onDelete(note.id)}
                >
                    {t('home.deleteButton')}
                </Button>
            </CardContent>
        </Card>
    );
}

Note.propTypes = {
    note: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        create_at: PropTypes.string.isRequired
    }).isRequired,
    onDelete: PropTypes.func.isRequired
};

export default Note;
