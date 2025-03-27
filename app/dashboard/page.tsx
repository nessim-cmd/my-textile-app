/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Invoice, Livraison, LivraisonEntree, DeclarationImport, DeclarationExport } from '@/type';
import { Client, ClientModel } from '@prisma/client';
import Wrapper from "@/components/Wrapper";

interface Event { id: number; description: string; date: string; }

interface DashboardData {
  invoices: { list: Invoice[]; totalCount: number; totalHT: number; totalTTC: number; paidHT: number; paidTTC: number };
  livraisons: { list: Livraison[]; totalCount: number };
  livraisonEntrees: { list: LivraisonEntree[]; totalCount: number };
  imports: { list: DeclarationImport[]; totalCount: number; totalHT: number };
  exports: { list: DeclarationExport[]; totalCount: number; totalHT: number; totalTTC: number };
  clientModels: { list: ClientModel[] };
  events: { list: Event[] };
  totalTTC: number;
}

interface ListeManqueData {
  declarations: DeclarationImport[]; // client is a string per schema
  livraisons: (LivraisonEntree & { client: Client | null })[];
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [listeManqueData, setListeManqueData] = useState<ListeManqueData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const fetchClients = async () => {
    const token = await getToken();
    const res = await fetch('/api/client', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setClients(await res.json());
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (selectedClients.length) params.append('client', selectedClients.join(','));
      if (dateDebut) params.append('dateDebut', dateDebut);
      if (dateFin) params.append('dateFin', dateFin);

      const res = await fetch(`/api/dashboard?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchListeManqueData = async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/liste-manque', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch liste manque data');
      const result = await res.json();
   
      setListeManqueData(result);
    } catch (err) {
      console.error('Error fetching liste manque:', err);
      setError('Failed to load liste manque data');
    }
  };

  useEffect(() => {
    fetchClients();
    fetchListeManqueData();
  }, [getToken]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedClients, dateDebut, dateFin, getToken]);

  const handleClientToggle = (clientName: string) => {
    setSelectedClients(prev =>
      prev.includes(clientName) ? prev.filter(c => c !== clientName) : [...prev, clientName]
    );
  };

  const renderTable = (title: string, items: any[], fields: string[], hideClient: boolean = false) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {!hideClient && <TableHead>Client</TableHead>}
              {fields.map(field => <TableHead key={field}>{field}</TableHead>)}
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={idx}>
                {!hideClient && (
                  <TableCell>{item.client?.name || item.clientName || item.client || 'N/A'}</TableCell>
                )}
                {fields.map(field => (
                  <TableCell key={field}>
                    {field === 'HT' ? `${(item.valeur || item.models?.reduce((sum: number, l: any) => sum + l.quantity * l.unitPrice, 0) || 0).toFixed(2)} €` :
                     field === 'TTC' && item.vatActive ? `${((item.valeur || item.models?.reduce((sum: number, l: any) => sum + l.quantity * l.unitPrice, 0)) * (1 + (item.vatRate || 0) / 100)).toFixed(2)} €` :
                     field === 'Name' ? item.name || 'N/A' :
                     field === 'Description' ? item.description || 'N/A' :
                     field === 'Status' ? (item.status === 2 ? 'Paid' : 'Unpaid') :
                     field === 'Missing Qty' ? item.quantity_manque || (item.quantityReçu && item.quantityTrouvee ? item.quantityReçu - item.quantityTrouvee : 'N/A') :
                     'N/A'}
                  </TableCell>
                ))}
                <TableCell>{new Date(item.createdAt || item.date || item.date_import).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const financialChartData = [
    { name: 'Invoices', HT: data?.invoices.totalHT || 0, TTC: data?.invoices.totalTTC || 0 },
    { name: 'Exports', HT: data?.exports.totalHT || 0, TTC: data?.exports.totalTTC || 0 },
    { name: 'Imports', HT: data?.imports.totalHT || 0, TTC: 0 },
  ];

  const renderListeManqueTable = () => {
    if (!listeManqueData || (!listeManqueData.declarations.length && !listeManqueData.livraisons.length)) return null;

    const declarationItems = listeManqueData.declarations.flatMap(declaration =>
      declaration.models.flatMap(model =>
        model.accessories.map(acc => ({
          client: declaration.client || 'N/A', // client is a string per schema
          description: acc.reference_accessoire ? ` ${acc.reference_accessoire}` : 'Unnamed Accessory',
          quantity_manque: acc.quantity_manque ?? 'N/A',
          date: declaration.date_import,
        }))
      )
    );

    const livraisonItems = listeManqueData.livraisons.flatMap(livraison =>
      livraison.models.map(line => ({
        client: livraison.client?.name || livraison.clientName || 'N/A',
        description: line.description ? `Line: ${line.description}` : 'Unnamed Line',
        quantity_manque: (line.quantityReçu && line.quantityTrouvee) ? (line.quantityReçu - line.quantityTrouvee) : 'N/A',
        date: livraison.createdAt,
      }))
    );

    const combinedItems = [...declarationItems, ...livraisonItems].filter(item =>
      selectedClients.length === 0 || selectedClients.includes(item.client)
    );

    return renderTable('Liste de Manque', combinedItems, ['Description', 'Missing Qty'], false);
  };

  return (
    <Wrapper>
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-2 lg:p-2">
      <div className="max-w-7xl mx-auto space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-800">Dashboard</h1>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-md">
          <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto bg-white hover:bg-gray-50">
                  {selectedClients.length ? `${selectedClients.length} Clients Selected` : 'Select Clients'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto bg-white">
                <DropdownMenuLabel>Clients</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {clients.map(client => (
                  <DropdownMenuCheckboxItem
                    key={client.id}
                    checked={selectedClients.includes(client.name || '')}
                    onCheckedChange={() => handleClientToggle(client.name || '')}
                  >
                    {client.name || 'N/A'}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
              <Input
                type="date"
                value={dateDebut}
                onChange={e => setDateDebut(e.target.value)}
                className="w-full sm:w-auto bg-white"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="date"
                value={dateFin}
                onChange={e => setDateFin(e.target.value)}
                className="w-full sm:w-auto bg-white"
              />
            </div>
            {(selectedClients.length || dateDebut || dateFin) && (
              <Button
                variant="destructive"
                className="w-full md:w-auto"
                onClick={() => {
                  setSelectedClients([]);
                  setDateDebut('');
                  setDateFin('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {loading && <div className="text-center text-gray-600">Loading...</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
        {!loading && data && (
          <>
            {/* Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                <CardHeader>
                  <CardTitle>Invoices HT</CardTitle>
                  <CardDescription className="text-blue-100">Paid: {data.invoices.paidHT.toFixed(2)} €</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.invoices.totalHT.toFixed(2)} €</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                <CardHeader>
                  <CardTitle>Exports HT</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.exports.totalHT.toFixed(2)} €</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg">
                <CardHeader>
                  <CardTitle>Imports HT</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.imports.totalHT.toFixed(2)} €</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
                <CardHeader>
                  <CardTitle>Total TTC</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.totalTTC.toFixed(2)} €</p>
                </CardContent>
              </Card>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { title: 'Total Invoices', value: data.invoices.totalCount, color: 'bg-blue-100' },
                { title: 'Total Livraisons', value: data.livraisons.totalCount, color: 'bg-green-100' },
                { title: 'Total Livraison Entrées', value: data.livraisonEntrees.totalCount, color: 'bg-yellow-100' },
                { title: 'Total Imports', value: data.imports.totalCount, color: 'bg-orange-100' },
                { title: 'Total Exports', value: data.exports.totalCount, color: 'bg-purple-100' },
              ].map((item, idx) => (
                <Card key={idx} className={`${item.color} shadow-md`}>
                  <CardHeader>
                    <CardTitle className="text-sm md:text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Financial Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Financial Overview (HT & TTC)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={financialChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} €`} />
                    <Legend />
                    <Bar dataKey="HT" fill="#4b5e91" name="HT" />
                    <Bar dataKey="TTC" fill="#82ca9d" name="TTC" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Data Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderTable('Invoices', data.invoices.list, ['HT', 'TTC', 'Status'])}
              {renderTable('Livraisons', data.livraisons.list, ['Name'])}
              {renderTable('Livraison Entrées', data.livraisonEntrees.list, ['Name'])}
              {renderTable('Imports', data.imports.list, ['HT'])}
              {renderTable('Exports', data.exports.list, ['HT', 'TTC', 'Status'])}
              {renderTable('Client Models', data.clientModels.list, ['Name'])}
              {data.events.list.length > 0 && renderTable('Events', data.events.list, ['Description'], true)}
              {renderListeManqueTable()}
            </div>
          </>
        )}
      </div>
    </div>
    </Wrapper>
  );
}