import { DeclarationExport } from "@/type";
import React from "react";

interface Props {
  declaration: DeclarationExport;
  setDeclaration: (declaration: DeclarationExport) => void;
}

const VATControlExport: React.FC<Props> = ({ declaration, setDeclaration }) => {
  const handleVATChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeclaration({ ...declaration, vatActive: e.target.checked });
  };

  const handleVATRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value) || 0;
    setDeclaration({ ...declaration, vatRate: rate });
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        className="toggle toggle-accent"
        checked={declaration.vatActive}
        onChange={handleVATChange}
      />
      <span>TVA</span>
      {declaration.vatActive && (
        <input
          type="number"
          className="input input-bordered input-sm w-16"
          value={declaration.vatRate}
          onChange={handleVATRateChange}
          min={0}
          step={0.1}
        />
      )}
    </div>
  );
};

export default VATControlExport;