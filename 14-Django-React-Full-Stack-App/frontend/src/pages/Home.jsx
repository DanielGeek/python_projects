import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

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
                        This is your dashboard where you can manage your account and access various features.
                    </p>
                    <Button 
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full"
                    >
                        Logout
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default Home
