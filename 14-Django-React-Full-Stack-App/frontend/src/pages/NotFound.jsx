import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom";

function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[350px]">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-bold">404</CardTitle>
                    <CardDescription>
                        The page you&apos;re looking for doesn&apos;t exist!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        It seems you&apos;ve stumbled upon a page that doesn&apos;t exist. 
                        Don&apos;t worry, it happens to the best of us!
                    </p>
                    <Button 
                        onClick={() => navigate("/")}
                        className="w-full"
                    >
                        Go Home
                    </Button>
                    <Button 
                        onClick={() => navigate("/login")}
                        variant="outline"
                        className="w-full"
                    >
                        Go to Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default NotFound
