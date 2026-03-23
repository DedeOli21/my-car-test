import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth-service";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { toAppError } from "@/lib/errors";
import type { UserRole } from "@/types/api";

interface AuthPageProps {
  mode: "login" | "register";
}

const getIsDevEnvironment = () => {
  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".lovable.app") ||
    hostname.endsWith(".lovableproject.com")
  );
};

const createMockJwt = (role: UserRole): string => {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: role === "DRIVER" ? "driver-001" : "admin-001",
      email: role === "DRIVER" ? "jose.moacir@truck.com" : "admin@truck.com",
      name: role === "DRIVER" ? "José Moacir" : "Administrador",
      role,
      exp: Math.floor(Date.now() / 1000) + 86400,
      iat: Math.floor(Date.now() / 1000),
    })
  );
  return `${header}.${payload}.mock`;
};

const AuthPage = ({ mode }: AuthPageProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const mockLogin = (mockRole: UserRole) => {
    const token = createMockJwt(mockRole);
    login({ accessToken: token, refreshToken: "mock-refresh", tokenType: "Bearer", expiresIn: 86400 });
    navigate("/", { replace: true });
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("DRIVER");
  const [formError, setFormError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data);
      navigate("/", { replace: true });
    },
    onError: (error) => {
      const parsed = toAppError(error);
      setFormError(getFriendlyErrorMessage(parsed));
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: async (data) => {
      if ("accessToken" in data) {
        login(data);
        navigate("/", { replace: true });
        return;
      }

      await loginMutation.mutateAsync({ email, password });
    },
    onError: (error) => {
      const parsed = toAppError(error);
      setFormError(getFriendlyErrorMessage(parsed));
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const isLogin = mode === "login";
  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!email || !password || (!isLogin && !name)) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (isLogin) {
      await loginMutation.mutateAsync({ email, password });
      return;
    }

    await registerMutation.mutateAsync({
      name,
      email,
      password,
      role,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Entrar" : "Criar Conta"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Acesse sua conta para usar o sistema"
              : "Registre-se para começar a usar a plataforma"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin ? (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>

            {!isLogin ? (
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRIVER">DRIVER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Processando..."
                : isLogin
                  ? "Entrar"
                  : "Cadastrar e Entrar"}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              {isLogin ? "Ainda não tem conta?" : "Já possui conta?"} {" "}
              <Link className="text-primary hover:underline" to={isLogin ? "/register" : "/login"}>
                {isLogin ? "Criar conta" : "Fazer login"}
              </Link>
            </p>
          </form>

          {getIsDevEnvironment() && isLogin && (
            <div className="mt-6 pt-4 border-t border-border space-y-2">
              <p className="text-xs text-muted-foreground text-center">Acesso rápido (dev only)</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => mockLogin("DRIVER")}>
                  Entrar como DRIVER
                </Button>
                <Button variant="outline" size="sm" onClick={() => mockLogin("ADMIN")}>
                  Entrar como ADMIN
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
