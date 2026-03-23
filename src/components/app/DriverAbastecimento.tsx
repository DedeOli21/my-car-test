import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";
import { Fuel, Gauge } from "lucide-react";

const DriverAbastecimento = () => {
  const { toast } = useToast();
  const [litros, setLitros] = useState("");
  const [odometro, setOdometro] = useState("");
  const [posto, setPosto] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!litros || !odometro) {
      toast({ variant: "destructive", title: "Preencha litros e odômetro." });
      return;
    }
    toast({ title: "Abastecimento registrado!", description: `${litros}L em ${posto || "posto não informado"}` });
    setLitros("");
    setOdometro("");
    setPosto("");
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-xl font-bold text-foreground">Abastecimento</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Fuel className="w-4 h-4 text-primary" /> Registrar Abastecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Litros</Label>
                <Input type="number" placeholder="0" value={litros} onChange={(e) => setLitros(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Odômetro (Km)</Label>
                <Input type="number" placeholder="0" value={odometro} onChange={(e) => setOdometro(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Posto / Descrição</Label>
              <Input placeholder="Ex.: Posto Shell BR-101" value={posto} onChange={(e) => setPosto(e.target.value)} />
            </div>
            <Button className="w-full" type="submit">Salvar abastecimento</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Gauge className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Média de consumo</p>
            <p className="text-lg font-bold text-foreground">3.2 Km/L</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverAbastecimento;
