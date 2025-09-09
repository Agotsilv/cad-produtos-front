import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Sistema de Gestão
          </h1>
          <p className="text-xl text-muted-foreground">
            Gerencie seus produtos de forma simples e eficiente
          </p>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-md hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Package className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">Produtos</CardTitle>
              <CardDescription>
                Cadastre, edite e gerencie todos os seus produtos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="w-full gap-2">
                <Link to="/products">
                  Acessar Produtos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
