import { Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatShortDate } from "@/lib/financeiro-format";
import type { ConciliacaoPayload, ExtratoBancario, LancamentoSistema } from "@/types/financeiro";

interface BankReconciliationPanelProps {
  systemEntries: LancamentoSistema[];
  bankStatements: ExtratoBancario[];
  selectedSystemEntryId: string | null;
  selectedBankStatementId: string | null;
  isSubmitting: boolean;
  onSelectSystemEntry: (id: string) => void;
  onSelectBankStatement: (id: string) => void;
  onMatch: (payload: ConciliacaoPayload) => Promise<void>;
}

const entryClass = (selected: boolean, matched: boolean) =>
  `rounded-md border p-3 text-sm transition-colors ${
    selected ? "border-primary bg-primary/10" : "hover:bg-muted/40"
  } ${matched ? "opacity-60" : ""}`;

const BankReconciliationPanel = ({
  systemEntries,
  bankStatements,
  selectedSystemEntryId,
  selectedBankStatementId,
  isSubmitting,
  onSelectSystemEntry,
  onSelectBankStatement,
  onMatch,
}: BankReconciliationPanelProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Conciliação Bancária Visual</CardTitle>
        <Button
          type="button"
          className="gap-2"
          disabled={!selectedSystemEntryId || !selectedBankStatementId || isSubmitting}
          onClick={() =>
            selectedSystemEntryId &&
            selectedBankStatementId &&
            onMatch({ systemEntryId: selectedSystemEntryId, bankStatementId: selectedBankStatementId })
          }
        >
          <Link2 className="h-4 w-4" />
          {isSubmitting ? "Vinculando..." : "Fazer Match"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="font-semibold">Lançamentos do Sistema</p>
            {systemEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={entryClass(selectedSystemEntryId === entry.id, Boolean(entry.matchedBankStatementId))}
                onClick={() => onSelectSystemEntry(entry.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-left">
                    <p className="font-medium">{entry.descricao}</p>
                    <p className="text-muted-foreground">{formatShortDate(entry.data)}</p>
                  </div>
                  <div className="text-right">
                    <p className={entry.valor >= 0 ? "text-green-500" : "text-destructive"}>{formatBRL(entry.valor)}</p>
                    {entry.matchedBankStatementId ? <Badge variant="secondary">Conciliado</Badge> : null}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <p className="font-semibold">Extrato Bancário</p>
            {bankStatements.map((statement) => (
              <button
                key={statement.id}
                type="button"
                className={entryClass(selectedBankStatementId === statement.id, Boolean(statement.matchedSystemEntryId))}
                onClick={() => onSelectBankStatement(statement.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-left">
                    <p className="font-medium">{statement.descricao}</p>
                    <p className="text-muted-foreground">{statement.banco} - {formatShortDate(statement.data)}</p>
                  </div>
                  <div className="text-right">
                    <p className={statement.valor >= 0 ? "text-green-500" : "text-destructive"}>{formatBRL(statement.valor)}</p>
                    {statement.matchedSystemEntryId ? <Badge variant="secondary">Conciliado</Badge> : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankReconciliationPanel;
