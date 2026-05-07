export function Kanban() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Funil de Vendas</h1>
      <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        {['Base', 'Lead Mapeado', 'Tentando Contato'].map((stage) => (
          <div key={stage} className="min-w-[300px] flex-1 flex flex-col gap-4">
            <h3 className="font-semibold px-2">{stage}</h3>
            <div className="glass-card flex-1 rounded-2xl border-dashed border-2 border-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
