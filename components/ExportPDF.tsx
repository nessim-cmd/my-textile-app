import { DeclarationExport } from "@/type";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { ArrowDownFromLine, Layers } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import n2words from "n2words";

interface ExportPDFProps {
  declaration: DeclarationExport;
  totals: { totalHT: number; totalVAT: number; totalTTC: number };
}

interface Client {
  id: string;
  name: string;
  address?: string | null;
  phone1?: string | null;
  email?: string | null;
}

// Type for items in declarationData
interface DeclarationDataItem {
  label: string;
  value: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("fr-FR", options);
}

function convertToFrenchCurrency(amount: number): string {
  const whole = Math.floor(amount);
  const cents = Math.round((amount - whole) * 100);

  let eurosInWords = n2words(whole, { lang: "fr" })
    .replace(/-/g, " ")
    .replace(/,\s/g, " ")
    .toUpperCase();

  eurosInWords += whole === 1 ? " EURO" : " EUROS";

  let centsInWords = "";
  if (cents > 0) {
    centsInWords = n2words(cents, { lang: "fr" })
      .replace(/-/g, " ")
      .replace(/,\s/g, " ")
      .toUpperCase();
    centsInWords += cents === 1 ? " CENTIME" : " CENTIMES";
  }

  return cents > 0 ? `${eurosInWords} ET ${centsInWords}` : eurosInWords;
}

const ExportPDF: React.FC<ExportPDFProps> = ({ declaration, totals }) => {
  const [client, setClient] = useState<Client | null>(null);
  const factureRef = useRef<HTMLDivElement>(null);

  // Fetch client details based on declaration.clientName
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (declaration.clientName) {
        try {
          const response = await fetch("/api/client");
          const clients: Client[] = await response.json();
          const matchedClient = clients.find((c) => c.name === declaration.clientName);
          setClient(matchedClient || null);
        } catch (error) {
          console.error("Error fetching client details:", error);
          setClient(null);
        }
      } else {
        setClient(null);
      }
    };
    fetchClientDetails();
  }, [declaration.clientName]);

  const handleDownloadPdf = async () => {
    const element = factureRef.current;
    if (element) {
      try {
        const canvas = await html2canvas(element, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "A4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`export-${declaration.num_dec}.pdf`);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999,
        });
      } catch (error) {
        console.error("Erreur lors de la génération du PDF :", error);
      }
    }
  };

  const declarationData: DeclarationDataItem[] = [];
  if (declaration.origineTessuto) declarationData.push({ label: "Origine Tissu", value: declaration.origineTessuto });
  if (declaration.poidsBrut) declarationData.push({ label: "Poids Brut", value: declaration.poidsBrut });
  if (declaration.poidsNet) declarationData.push({ label: "Poids Net", value: declaration.poidsNet });
  if (declaration.nbrColis) declarationData.push({ label: "Nombre de Colis", value: declaration.nbrColis });
  if (declaration.volume) declarationData.push({ label: "Volume", value: `${declaration.volume} m³` });
  declarationData.push({ label: "Mode Paiement", value: declaration.modePaiment === 1 ? "Virement bancaire" : declaration.modePaiment === 2 ? "Chèque" : declaration.modePaiment === 3 ? "Espèce" : "Non défini" });
  declarationData.push({ label: "Banque", value: "Amen Bank Agence Korba" });
  declarationData.push({ label: "RIB", value: "07 304 0056146070418 84" });
  declarationData.push({ label: "IBAN", value: "TN59 07304005614607041884" });
  declarationData.push({ label: "SWIFT", value: "CFCTTNTT" });

  // Explicitly type columns as an array of DeclarationDataItem arrays
  const columns: DeclarationDataItem[][] = [[], [], []];
  declarationData.forEach((item, index) => {
    columns[index % 3].push(item);
  });

  return (
    <div className="mt-4 hidden lg:block">
      <div className="border-base-300 border-2 border-dashed rounded-xl p-5">
        <button onClick={handleDownloadPdf} className="btn btn-sm btn-accent mb-4">
          Déclaration Export PDF
          <ArrowDownFromLine className="w-4" />
        </button>

        <div className="p-8" ref={factureRef}>
          <div className="flex justify-between items-center text-sm">
            <div className="flex flex-col">
              <div className="flex items-center">
                <div className="bg-accent-content text-accent rounded-full p-2">
                  <Layers className="h-6 w-6" />
                </div>
                <span className="ml-3 font-bold text-2xl italic">
                  MS<span className="text-accent">Tailors</span>
                </span>
              </div>
              <h1 className="text-7xl font-bold uppercase">Facture</h1>
            </div>
            <div className="text-right uppercase">
              <p className="badge badge-ghost">Déclaration ° {declaration.num_dec}</p>
              <p className="my-2">
                <strong>Date </strong>
                {formatDate(declaration.exportDate)}
              </p>
              <p>
                <strong>{"Date d'échéance"} </strong>
                {formatDate(declaration.dueDate)}
              </p>
            </div>
          </div>

          <div className="my-4 flex justify-between">
            <div>
              <p className="badge badge-ghost mb-1">Émetteur</p>
              <p className="text-sm font-bold italic">MS Tailors</p>
              <p className="text-sm text-gray-500 w-60 break-words">{"Rue de l'environnement El Mida, 8044"}</p>
              <p className="text-sm text-gray-500 w-60 break-words">72217400</p>
              <p className="text-sm text-gray-500 w-60 break-words">mariemms360@gmail.com</p>
            </div>
            <div>
              <p className="badge badge-ghost mb-1">Client</p>
              <p className="text-sm font-bold italic">{declaration.clientName.toUpperCase()}</p>
              {client && (
                <>
                  {client.address && <p className="text-sm text-gray-500 w-60">{client.address}</p>}
                  {client.phone1 && <p className="text-sm text-gray-500 w-60">Tél: {client.phone1}</p>}
                  {client.email && <p className="text-sm text-gray-500 w-60">Email: {client.email}</p>}
                </>
              )}
            </div>
          </div>

          <div className="scrollable">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th></th>
                  <th>Commande</th>
                  <th>Modèle</th>
                  <th>Description</th>
                  <th>Quantité</th>
                  <th>Prix Unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {declaration.lines.map((ligne, index) => (
                  <tr key={index + 1}>
                    <td>{index + 1}</td>
                    <td>{ligne.commande}</td>
                    <td>{ligne.modele}</td>
                    <td>{ligne.description}</td>
                    <td>{ligne.quantity}</td>
                    <td>{ligne.unitPrice.toFixed(2)} €</td>
                    <td>{(ligne.quantity * ligne.unitPrice).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-2 text-md">
            <div className="flex justify-between">
              <div className="font-bold">Total Hors Taxes</div>
              <div>{totals.totalHT.toFixed(2)} €</div>
            </div>
            {declaration.vatActive && (
              <div className="flex justify-between">
                <div className="font-bold">TVA {declaration.vatRate} %</div>
                <div>{totals.totalVAT.toFixed(2)} €</div>
              </div>
            )}
            <div className="flex justify-between">
              <div className="font-bold">Total Toutes Taxes Comprises</div>
              <div className="badge badge-accent">{totals.totalTTC.toFixed(2)} €</div>
            </div>
          </div>

          <div className="mt-2 border border-gray-300 rounded-lg w-full">
            <div className="px-4 py-1">
              <h2 className="text-sm font-semibold mb-2 text-gray-600">Montant en lettres:</h2>
              <p className="text-xs font-bold uppercase tracking-wide break-words">
                {convertToFrenchCurrency(totals.totalTTC)}
              </p>
            </div>
          </div>

          <hr className="border-t-2 border-gray-400 my-2" />

          <div className="grid grid-cols-3 gap-4 p-2 border border-gray-300 rounded-lg shadow-md text-sm">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col space-y-1">
                {column.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-bold">{item.label} :</span> <span>{item.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPDF;