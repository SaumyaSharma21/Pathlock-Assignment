import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AuthAPI } from "@/lib/api";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Track which tab is active
  const [tab, setTab] = useState(() => {
    if (location.state && location.state.tab) return location.state.tab;
    return "login";
  });

  useEffect(() => {
    if (AuthAPI.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginUsername || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    setLoginError(""); // Clear any previous errors
    try {
      await AuthAPI.login(loginUsername, loginPassword);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      // Enhanced error handling for login failures
      const status = error.response?.status;
      const errorMessage = error.response?.data?.error || error.response?.data || error.message;
      
      let errorMsg = "";
      if (status === 401) {
        errorMsg = "Invalid username or password. Please check your credentials and try again.";
      } else if (status === 400) {
        errorMsg = errorMessage || "Invalid login request. Please check your input.";
      } else if (status === 429) {
        errorMsg = "Too many login attempts. Please wait a moment and try again.";
      } else if (status >= 500) {
        errorMsg = "Server error. Please try again later or contact support.";
      } else if (!navigator.onLine) {
        errorMsg = "No internet connection. Please check your network and try again.";
      } else {
        errorMsg = errorMessage || "Please check your username and password and try again.";
      }
      
      setLoginError(errorMsg);
      toast.error("Login Failed: " + errorMsg, {
        duration: 5000,
      });
      
      // Keep the username field populated, but clear password for security
      setLoginPassword("");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerUsername || !registerEmail || !registerPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (registerPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await AuthAPI.register(registerUsername, registerEmail, registerPassword);
      toast.success("Account created successfully! Please log in.");
      setTab("login");
      // Clear registration form
      setRegisterUsername("");
      setRegisterEmail("");
      setRegisterPassword("");
    } catch (error: any) {
      const status = error.response?.status;
      const errorMessage = error?.response?.data?.error || error?.response?.data || error.message;
      
      if (status === 400) {
        if (errorMessage?.toLowerCase().includes("username")) {
          toast.error("Username already exists. Please choose a different one.");
        } else if (errorMessage?.toLowerCase().includes("email")) {
          toast.error("Email already registered. Please use a different email or try logging in.");
        } else {
          toast.error(errorMessage || "Invalid registration data. Please check your input.");
        }
      } else if (status === 409) {
        toast.error("Account already exists. Please try logging in instead.");
      } else if (status >= 500) {
        toast.error("Server error. Please try again later or contact support.");
      } else {
        toast.error(errorMessage || "Failed to create account. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-pathlock-primary/5 to-pathlock-secondary/10 p-4">
      <Card className="relative w-full max-w-md shadow-2xl border-pathlock-primary/20 bg-gradient-to-br from-white via-slate-50/50 to-pathlock-primary/5 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-6 border-b border-pathlock-primary/10">
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pathlock-primary to-pathlock-secondary flex items-center justify-center mb-4 shadow-xl border-2 border-white/50">
              <div className="text-white text-3xl font-bold tracking-tight">PM</div>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-center bg-gradient-to-r from-pathlock-primary to-pathlock-secondary bg-clip-text text-transparent">
            Project Manager
          </CardTitle>
          <CardDescription className="text-center text-pathlock-primary/70 text-lg font-medium">
            Manage your projects and tasks efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-2 bg-pathlock-primary/8 p-2 rounded-lg border border-pathlock-primary/20 shadow-sm h-12">
              <TabsTrigger 
                value="login" 
                className="rounded-md font-medium transition-all duration-200 bg-pathlock-accent/8 text-pathlock-accent border border-pathlock-accent/20 data-[state=active]:bg-pathlock-accent/15 data-[state=active]:text-pathlock-accent data-[state=active]:shadow-md data-[state=active]:border-pathlock-accent/40 hover:bg-pathlock-accent/20 hover:text-pathlock-accent hover:border-pathlock-accent/50 hover:shadow-sm h-8 text-sm"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="rounded-md font-medium transition-all duration-200 bg-pathlock-secondary/8 text-pathlock-secondary border border-pathlock-secondary/20 data-[state=active]:bg-pathlock-secondary/15 data-[state=active]:text-pathlock-secondary data-[state=active]:shadow-md data-[state=active]:border-pathlock-secondary/40 hover:bg-pathlock-secondary/20 hover:text-pathlock-secondary hover:border-pathlock-secondary/50 hover:shadow-sm h-8 text-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded-md bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600 font-medium">
                      ⚠️ Login Failed: {loginError}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-pathlock-primary font-medium">
                    Username
                  </Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Enter your username"
                    value={loginUsername}
                    onChange={(e) => {
                      setLoginUsername(e.target.value);
                      if (loginError) setLoginError(""); // Clear error when user starts typing
                    }}
                    className={`transition-colors bg-white/80 ${
                      loginError 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                        : "border-pathlock-primary/30 focus:border-pathlock-primary focus:ring-pathlock-primary/20"
                    }`}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-pathlock-primary font-medium">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError(""); // Clear error when user starts typing
                    }}
                    className={`transition-colors bg-white/80 ${
                      loginError 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                        : "border-pathlock-primary/30 focus:border-pathlock-primary focus:ring-pathlock-primary/20"
                    }`}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-pathlock-accent hover:bg-pathlock-accentLight text-white font-medium py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="text-pathlock-primary font-medium">
                    Username
                  </Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Choose a unique username"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    className="border-pathlock-primary/30 focus:border-pathlock-primary focus:ring-pathlock-primary/20 bg-white/80 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-pathlock-primary font-medium">
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="border-pathlock-primary/30 focus:border-pathlock-primary focus:ring-pathlock-primary/20 bg-white/80 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-pathlock-primary font-medium">
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a secure password (6+ characters)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="border-pathlock-primary/30 focus:border-pathlock-primary focus:ring-pathlock-primary/20 bg-white/80 transition-colors"
                    required
                  />
                  <p className="text-xs text-pathlock-primary/60">
                    Password should be at least 6 characters long
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-pathlock-primary to-pathlock-secondary hover:from-pathlock-primary/90 hover:to-pathlock-secondary/90 text-white font-medium py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
