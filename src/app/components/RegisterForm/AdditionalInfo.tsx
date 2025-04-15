import React from 'react';

interface AdditionalInfoProps {
  formData: {
    penalRestritiva: string;
    penaAdministrativa: string;
    dependenteQuimico: string;
    recusaSeguro: string;
    conhecimentoReclamacoes: string;
    envolvidoReclamacoes: string;
    informacoesAdicionais: string;
    assessoradoPorVendas: string;
    carteiraProfissional: File | null;
    comprovanteResidencia: File | null;
  };
  onInputChange: (field: string, value: string | File | null) => void;
}

export default function AdditionalInfo({ formData, onInputChange }: AdditionalInfoProps) {
  const handleFileChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onInputChange(field, file);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          JÁ SOFREU ALGUMA PENA RESTRITIVA DE LIBERDADE?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="SIM"
              checked={formData.penalRestritiva === 'SIM'}
              onChange={(e) => onInputChange('penalRestritiva', e.target.value)}
              className="mr-2"
            />
            SIM
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="NAO"
              checked={formData.penalRestritiva === 'NAO'}
              onChange={(e) => onInputChange('penalRestritiva', e.target.value)}
              className="mr-2"
            />
            NÃO
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          JÁ SOFREU ALGUMA PENA ADMINISTRATIVA APLICADA POR ALGUMA AUTARQUIA, ASSOCIAÇÃO, CONSELHO PROFISSIONAL?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="SIM"
              checked={formData.penaAdministrativa === 'SIM'}
              onChange={(e) => onInputChange('penaAdministrativa', e.target.value)}
              className="mr-2"
            />
            SIM
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="NAO"
              checked={formData.penaAdministrativa === 'NAO'}
              onChange={(e) => onInputChange('penaAdministrativa', e.target.value)}
              className="mr-2"
            />
            NÃO
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ALGUMA VEZ FOI DEPENDENTE QUÍMICO OU SE UTILIZOU DE SUBSTÂNCIAS QUÍMICAS QUE INTERFERIRAM EM SUA CONDIÇÃO E/OU CAPACIDADE PROFISSIONAL?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="SIM"
              checked={formData.dependenteQuimico === 'SIM'}
              onChange={(e) => onInputChange('dependenteQuimico', e.target.value)}
              className="mr-2"
            />
            SIM
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="NAO"
              checked={formData.dependenteQuimico === 'NAO'}
              onChange={(e) => onInputChange('dependenteQuimico', e.target.value)}
              className="mr-2"
            />
            NÃO
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          JÁ TEVE RECUSADA PROPOSTA DE SEGURO DE RESPONSABILIDADE CIVIL PROFISSIONAL POR ALGUMA SEGURADORA?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="SIM"
              checked={formData.recusaSeguro === 'SIM'}
              onChange={(e) => onInputChange('recusaSeguro', e.target.value)}
              className="mr-2"
            />
            SIM
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="NAO"
              checked={formData.recusaSeguro === 'NAO'}
              onChange={(e) => onInputChange('recusaSeguro', e.target.value)}
              className="mr-2"
            />
            NÃO
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          TEM CONHECIMENTO DE QUALQUER FATO OU CIRCUNSTÂNCIA DURANTE A SUA VIDA PROFISSIONAL ONDE SEUS ATOS POSSAM RESULTAR EM RECLAMAÇÕES E/OU MEDIDAS JUDICIAIS NO ÂMBITO DA RESPONSABILIDADE CIVIL PROFISSIONAL?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="SIM"
              checked={formData.conhecimentoReclamacoes === 'SIM'}
              onChange={(e) => onInputChange('conhecimentoReclamacoes', e.target.value)}
              className="mr-2"
            />
            SIM
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="NAO"
              checked={formData.conhecimentoReclamacoes === 'NAO'}
              onChange={(e) => onInputChange('conhecimentoReclamacoes', e.target.value)}
              className="mr-2"
            />
            NÃO
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          DURANTE A SUA VIDA PROFISSIONAL JÁ ESTEVE OU DE ALGUMA FORMA ESTÁ ENVOLVIDO DIRETA OU INDIRETAMENTE EM RECLAMAÇÕES E/OU MEDIDAS JUDICIAIS NO ÂMBITO DA RESPONSABILIDADE CIVIL PROFISSIONAL?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="SIM"
              checked={formData.envolvidoReclamacoes === 'SIM'}
              onChange={(e) => onInputChange('envolvidoReclamacoes', e.target.value)}
              className="mr-2"
            />
            SIM
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="NAO"
              checked={formData.envolvidoReclamacoes === 'NAO'}
              onChange={(e) => onInputChange('envolvidoReclamacoes', e.target.value)}
              className="mr-2"
            />
            NÃO
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          INFORMAÇÕES ADICIONAIS
        </label>
        <textarea
          value={formData.informacoesAdicionais}
          onChange={(e) => onInputChange('informacoesAdicionais', e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-32"
          placeholder="Informações especiais sobre o seu pedido"
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-bold mb-4">CENTRAL DE VENDAS</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ESTÁ SENDO ASSESSORADO POR ALGUÉM DA EQUIPE DE VENDAS DA JUSPROMED? *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="SIM"
                checked={formData.assessoradoPorVendas === 'SIM'}
                onChange={(e) => onInputChange('assessoradoPorVendas', e.target.value)}
                className="mr-2"
              />
              SIM
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="NAO"
                checked={formData.assessoradoPorVendas === 'NAO'}
                onChange={(e) => onInputChange('assessoradoPorVendas', e.target.value)}
                className="mr-2"
              />
              NÃO
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CARTEIRA PROFISSIONAL (CRM/CRO)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Clique para fazer upload</span>
                </p>
                <p className="text-xs text-gray-500">PDF, PNG ou JPG</p>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange('carteiraProfissional')}
                accept=".pdf,.png,.jpg,.jpeg"
              />
            </label>
          </div>
          {formData.carteiraProfissional && (
            <p className="mt-2 text-sm text-gray-600">
              Arquivo selecionado: {formData.carteiraProfissional.name}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            COMPROVANTE DE RESIDÊNCIA
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Clique para fazer upload</span>
                </p>
                <p className="text-xs text-gray-500">PDF, PNG ou JPG</p>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange('comprovanteResidencia')}
                accept=".pdf,.png,.jpg,.jpeg"
              />
            </label>
          </div>
          {formData.comprovanteResidencia && (
            <p className="mt-2 text-sm text-gray-600">
              Arquivo selecionado: {formData.comprovanteResidencia.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 