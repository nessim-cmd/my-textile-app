// components/LivraisonPDF.tsx
import { Livraison } from '@/type';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { ArrowDownFromLine, Layers } from 'lucide-react';
import React, { useRef, useState, useEffect, useCallback } from 'react';

interface LivraisonPDFProps {
  livraison: Livraison;
}

interface Client {
  id: string;
  name: string;
  address?: string | null;
  phone1?: string | null;
  email?: string | null;
  soumission?: string | null;
  dateFinSoumission?: string | null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('fr-FR', options);
}

const LivraisonPDF: React.FC<LivraisonPDFProps> = ({ livraison }) => {
  const livraisonRef = useRef<HTMLDivElement>(null);
  const [client, setClient] = useState<Client | null>(null);

  const fetchClientDetails = useCallback(async () => {
    if (livraison.clientName) {
      try {
        const response = await fetch('/api/client');
        const clients: Client[] = await response.json();
        const matchedClient = clients.find((c) => c.name === livraison.clientName);
        setClient(matchedClient || null);
      } catch (error) {
        console.error('Error fetching client details:', error);
        setClient(null);
      }
    } else {
      setClient(null);
    }
  }, [livraison.clientName]);

  useEffect(() => {
    fetchClientDetails();
  }, [fetchClientDetails]);

  const handleDownloadPdf = async () => {
    const element = livraisonRef.current;
    if (element) {
      try {
        const canvas = await html2canvas(element, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "A4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`livraison-${livraison.name}.pdf`);
      } catch (error) {
        console.error('Erreur lors de la génération du PDF :', error);
      }
    }
  };

  return (
    <div className="mt-4 hidden lg:block">
      <div className="border-base-300 border-2 border-dashed rounded-xl p-5">
        <button onClick={handleDownloadPdf} className="btn btn-sm btn-accent mb-4">
          Bon de Livraison
          <ArrowDownFromLine className="w-4" />
        </button>

        <div className="p-8" ref={livraisonRef}>
          <div className="flex justify-between items-center text-sm">
            <div className="flex flex-col">
              <div>
                <div className="flex items-center">
                  <div className="bg-accent-content text-accent rounded-full p-2">
                    <Layers className="h-6 w-6" />
                  </div>
                  <span className="ml-3 font-bold text-2xl italic">
                    MS<span className="text-accent">Tailors</span>
                  </span>
                </div>
              </div>
              <h1 className="text-7xl font-bold uppercase">Livraison</h1>
            </div>
            <div className="text-right uppercase">
              <p className="badge badge-ghost">Livraison N° {livraison.id}</p>
              <p className="my-2">
                <strong>Date </strong>
                {formatDate(livraison.livraisonDate)}
              </p>
            </div>
          </div>

          <div className="my-4 flex justify-between">
            <div>
              <p className="badge badge-ghost mb-1">Émetteur</p>
              <p className="text-sm font-bold italic">MS Tailors</p>
              <p className="text-sm text-gray-500 w-60 break-words">{"Rue de l'Environnement El Mida, 8044"}</p>
              <p className="text-sm text-gray-500 w-60 break-words">72217400</p>
              <p className="text-sm text-gray-500 w-60 break-words">mariemms360@gmail.com</p>
            </div>
            <div className="text-right">
              <p className="badge badge-ghost mb-1">Client</p>
              <p className="text-sm font-bold italic">{livraison.clientName.toUpperCase()}</p>
              {client && (
                <>
                  {client.address && <p className="text-sm text-gray-500 w-60 break-words">{client.address}</p>}
                  {client.phone1 && <p className="text-sm text-gray-500 w-60 break-words">Tél: {client.phone1}</p>}
                  {client.email && <p className="text-sm text-gray-500 w-60 break-words">Email: {client.email}</p>}
                </>
              )}
            </div>
          </div>

          <div className="scrollable">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th></th>
                  <th>Modèle</th>
                  <th>Commande</th>
                  <th>Description</th>
                  <th>Quantité</th>
                </tr>
              </thead>
              <tbody>
                {livraison.lines.map((ligne, index) => (
                  <tr key={index + 1}>
                    <td>{index + 1}</td>
                    <td>{ligne.modele}</td>
                    <td>{ligne.commande}</td>
                    <td>{ligne.description}</td>
                    <td>{ligne.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-3 gap-4 p-2 border border-gray-300 rounded-lg shadow-md text-sm mt-4">
            <div className="flex flex-col space-y-1">
              {client && (
                <>
                  {client.soumission && (
                    <p className="text-sm text-gray-500 w-60 break-words">
                      <span className='font-bold'>Soumission: </span>
                      {client.soumission}
                    </p>
                  )}
                  {client.dateFinSoumission && (
                    <p className="text-sm text-gray-500 w-60 break-words">
                      <span className='font-bold'>Date Fin Soumission: </span>{formatDate(client.dateFinSoumission)}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivraisonPDF;