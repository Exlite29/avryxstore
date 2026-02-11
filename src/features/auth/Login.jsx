import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match");
      showToast("Passwords do not match", "error");
      setIsLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await register({ full_name: name, email, password });
        showToast("Registration successful! Please login.", "success");
        setIsRegister(false);
      } else {
        const response = await login({ email, password });
        if (response) {
          showToast("Signed in successfully!", "success");
          navigate({ to: "/dashboard" });
        }
      }
    } catch (err) {
      const errMsg = err.message || (isRegister ? "Registration failed" : "Invalid credentials");
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{isRegister ? "Create Account" : "Login"}</CardTitle>
          <CardDescription>
            {isRegister 
              ? "Enter your details below to create your account." 
              : "Enter your email below to login to your account."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            {isRegister && (
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              {isRegister && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Must contain uppercase, lowercase, and a number
                </p>
              )}
            </div>
            {isRegister && (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading 
                ? (isRegister ? "Creating account..." : "Signing in...") 
                : (isRegister ? "Register" : "Sign in")}
            </Button>
            <Button 
              type="button" 
              variant="link" 
              className="px-0 font-normal"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              {isRegister ? "Already have an account? Sign in" : "Don't have an account? Register"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
