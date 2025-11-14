import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

function LanguageSelector() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex gap-2">
            <Button
                variant={i18n.language === 'es' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeLanguage('es')}
            >
                ES
            </Button>
            <Button
                variant={i18n.language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeLanguage('en')}
            >
                EN
            </Button>
        </div>
    );
}

export default LanguageSelector;
