import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/config";

interface Product {
  CodProd: number;
  DescrProd: string;
}

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Lista completa para busca
  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",

  });

  const resetForm = () => {
    setFormData({ code: "", name: "", });
    setEditingProduct(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.DescrProd,
      code: product.CodProd.toString(),

    });
    setIsDialogOpen(true);
  };


  const getProducts = async () => {
    try {
      const response = await api.get<Product[]>("/produtos"); // GET no endpoint
      console.log("Dados recebidos:", response.data);

      // Ordenar produtos alfabeticamente por nome (DescrProd)
      const sortedProducts = sortProductsAlphabetically(response.data);

      setProducts(sortedProducts);
      setAllProducts(sortedProducts);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      alert("Erro ao carregar produtos. Verifique se o servidor NestJS está rodando.");
    }
  };

  useEffect(() => {
    getProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validar se o código é um número válido
    if (isNaN(Number(formData.code)) || Number(formData.code) <= 0) {
      toast({
        title: "Erro",
        description: "O código deve ser um número válido maior que zero.",
        variant: "destructive"
      });
      return;
    }

    if (editingProduct) {
      // Atualizar produto
      try {
        const result = await api.put(`/produtos/${editingProduct.CodProd}`, {
          CodProd: parseInt(formData.code),
          DescrProd: formData.name,
        });

        console.log(result);

        if (result.status === 200) {
          toast({
            title: "Sucesso",
            description: "Produto atualizado com sucesso!"
          });
          // Recarregar a lista de produtos
          getProducts();
        } else {
          toast({
            title: "Erro",
            description: "Erro ao atualizar produto!",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar produto. Tente novamente.",
          variant: "destructive"
        });
      }
    } else {
      // Criar novo produto
      try {
        // Verificar se o código já existe
        const codeExists = allProducts.some(product => product.CodProd === parseInt(formData.code));
        if (codeExists) {
          toast({
            title: "Erro",
            description: "Já existe um produto com este código. Escolha outro código.",
            variant: "destructive"
          });
          return;
        }

        const result = await api.post('/produtos', {
          CodProd: parseInt(formData.code),
          DescrProd: formData.name,
        });

        console.log(result);

        if (result.status === 201 || result.status === 200) {
          toast({
            title: "Sucesso",
            description: "Produto criado com sucesso!"
          });
          // Recarregar a lista de produtos
          getProducts();
        } else {
          toast({
            title: "Erro",
            description: "Erro ao criar produto!"
          });
        }
      } catch (error) {
        console.error('Erro ao criar produto:', error);
        toast({
          title: "Erro",
          description: error.response?.data?.message || "Erro ao criar produto. Tente novamente.",
          variant: "destructive"
        });
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const deleteProduct = async (code: number) => {
    try {
      const result = await api.delete(`/produtos/${code}`);

      if (result.status === 200 || result.status === 204) {
        toast({
          title: "Sucesso",
          description: "Produto excluído com sucesso!"
        });
        // Recarregar a lista de produtos
        getProducts();
      } else {
        toast({
          title: "Erro",
          description: "Erro ao excluir produto!",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Função auxiliar para ordenar produtos alfabeticamente
  const sortProductsAlphabetically = (products: Product[]) => {
    return products.sort((a, b) =>
      a.DescrProd.localeCompare(b.DescrProd, 'pt-BR', {
        sensitivity: 'base',
        numeric: true
      })
    );
  };

  // Função para buscar produtos
  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      setProducts(allProducts);
    } else {
      try {
        // Verificar se é um número (código) ou texto (nome)
        const isNumeric = !isNaN(Number(searchTerm));

        let result;

        if (isNumeric) {
          // Busca por código: GET /produtos/:CodProd
          result = await api.get(`/produtos/${searchTerm}`);
          console.log('Resultado da busca por código:', result);

          // Se encontrou um produto, coloca em array para manter consistência
          if (result.data) {
            setProducts([result.data]);
          } else {
            setProducts([]);
          }
        } else {
          // Busca por nome: POST /produtos/search
          result = await api.post(`/produtos/search`, {
            DescrProd: searchTerm
          });
          console.log('Resultado da busca por nome:', result);

          // Ordenar resultados alfabeticamente
          const sortedResults = sortProductsAlphabetically(result.data);
          setProducts(sortedResults);
        }

        if (result.status === 200 || result.status === 201) {
          // Sucesso - dados já foram processados acima
        } else {
          toast({
            title: "Erro",
            description: "Erro ao buscar produtos!",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Erro na busca:', error);
        toast({
          title: "Erro",
          description: "Erro ao buscar produtos. Tente novamente.",
          variant: "destructive"
        });
        setProducts([]); // Limpar resultados em caso de erro
      }
    }
  };

  // Função para limpar busca
  const clearSearch = () => {
    setSearchTerm("");
    setProducts(allProducts);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos da sua loja</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Faça as alterações desejadas no produto."
                  : "Adicione um novo produto ao catálogo."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Código *</Label>
                <Input
                  id="name"
                  value={formData.code}
                  onChange={(e) => {
                    // Aceitar apenas números
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, code: value }));
                  }}
                  placeholder="Código do produto (apenas números)"
                  disabled={editingProduct !== null}
                  type="text"
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do produto"
                />
              </div>


              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProduct ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campo de busca */}
      <div className="mb-6">
        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Buscar por nome ou código do produto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Se o campo foi limpo, voltar a mostrar todos os produtos
              if (e.target.value.trim() === "") {
                setProducts(allProducts);
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </Button>
          {searchTerm && (
            <Button onClick={clearSearch} variant="ghost" size="sm" className="gap-2">
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-muted-foreground mt-2">
            Mostrando {products.length} de {allProducts.length} produtos
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.CodProd} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{product.DescrProd}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {product.CodProd || 'Sem código	'}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(product)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o produto "{product.DescrProd}"?
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteProduct(product.CodProd)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">Nenhum produto cadastrado</p>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar primeiro produto
          </Button>
        </div>
      )}
    </div>
  );
};

export default Products;