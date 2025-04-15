import React from 'react';

interface PersonalInfoProps {
  formData: {
    firstName: string;
    lastName: string;
    cpf: string;
    birthDate: string;
    rg: string;
    orgaoExpedidor: string;
    residenceSince: string;
    fezResidencia: string;
    especialidadeAtual: string;
    pertenceAlgumaAssociacao: string;
    socioProprietario: string;
    entidadeExerce: string;
    realizaProcedimento: string;
    atividadeProfissional: string[];
    pais: string;
    estado: string;
    cep: string;
    cidade: string;
    bairro: string;
    endereco: string;
    numero: string;
    complemento: string;
    email: string;
    telefone: string;
  };
  onInputChange: (field: string, value: string | string[]) => void;
}

const profissoes = [
  'NEUROLOGISTA',
  'CIRURGIÃO',
  'ORTOPEDISTA',
  'RADIOLOGISTA',
  'CIRURGIÃO DENTISTA',
  'GINECOLOGISTA',
  'PEDIATRA',
  'OUTRA'
];

export default function PersonalInfo({ formData, onInputChange }: PersonalInfoProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-6">DADOS PESSOAIS</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PRIMEIRO NOME *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => onInputChange('firstName', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SOBRENOME(S) *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => onInputChange('lastName', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF *
          </label>
          <input
            type="text"
            value={formData.cpf}
            onChange={(e) => onInputChange('cpf', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DATA DE NASCIMENTO *
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => onInputChange('birthDate', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RG E ÓRGÃO EXPEDIDOR
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={formData.rg}
              onChange={(e) => onInputChange('rg', e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="RG"
            />
            <input
              type="text"
              value={formData.orgaoExpedidor}
              onChange={(e) => onInputChange('orgaoExpedidor', e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Órgão"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CRIAÇÃO (UF) *
          </label>
          <input
            type="text"
            value={formData.residenceSince}
            onChange={(e) => onInputChange('residenceSince', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          FEZ RESIDÊNCIA? ONDE?
        </label>
        <input
          type="text"
          value={formData.fezResidencia}
          onChange={(e) => onInputChange('fezResidencia', e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ESPECIALIDADE ATUAL?
        </label>
        <input
          type="text"
          value={formData.especialidadeAtual}
          onChange={(e) => onInputChange('especialidadeAtual', e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PERTENCE A ALGUMA ASSOCIAÇÃO DE CLASSE? QUAL?
        </label>
        <input
          type="text"
          value={formData.pertenceAlgumaAssociacao}
          onChange={(e) => onInputChange('pertenceAlgumaAssociacao', e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          É SÓCIO/PROPRIETÁRIO DE IMÓVEL ALGUMA ENTIDADE HOSPITALAR, BANCO DE SANGUE, ETC?
        </label>
        <input
          type="text"
          value={formData.socioProprietario}
          onChange={(e) => onInputChange('socioProprietario', e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          NA ENTIDADE ONDE EXERCE SUA ATIVIDADE PROFISSIONAL, SUA RELAÇÃO É:
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="EMPREGADO"
              checked={formData.entidadeExerce === 'EMPREGADO'}
              onChange={(e) => onInputChange('entidadeExerce', e.target.value)}
              className="mr-2"
            />
            EMPREGADO
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="POR_CONTRATO"
              checked={formData.entidadeExerce === 'POR_CONTRATO'}
              onChange={(e) => onInputChange('entidadeExerce', e.target.value)}
              className="mr-2"
            />
            POR CONTRATO
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="SOCIO_PROPRIETARIO"
              checked={formData.entidadeExerce === 'SOCIO_PROPRIETARIO'}
              onChange={(e) => onInputChange('entidadeExerce', e.target.value)}
              className="mr-2"
            />
            SÓCIO/PROPRIETÁRIO
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          REALIZA ALGUM PROCEDIMENTO CIRÚRGICO? QUAIS?
        </label>
        <input
          type="text"
          value={formData.realizaProcedimento}
          onChange={(e) => onInputChange('realizaProcedimento', e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          ATUALMENTE EXERCE SUA ATIVIDADE PROFISSIONAL COMO:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {profissoes.map((profissao) => (
            <label key={profissao} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.atividadeProfissional.includes(profissao)}
                onChange={(e) => {
                  const currentProfissoes = formData.atividadeProfissional;
                  if (e.target.checked) {
                    onInputChange('atividadeProfissional', [...currentProfissoes, profissao]);
                  } else {
                    onInputChange('atividadeProfissional', 
                      currentProfissoes.filter(p => p !== profissao)
                    );
                  }
                }}
                className="mr-2"
              />
              {profissao}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PAÍS
          </label>
          <input
            type="text"
            value={formData.pais}
            onChange={(e) => onInputChange('pais', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ESTADO *
          </label>
          <select
            value={formData.estado}
            onChange={(e) => onInputChange('estado', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione um estado...</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            {/* Add all other Brazilian states */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CEP *
          </label>
          <input
            type="text"
            value={formData.cep}
            onChange={(e) => onInputChange('cep', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CIDADE *
          </label>
          <input
            type="text"
            value={formData.cidade}
            onChange={(e) => onInputChange('cidade', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BAIRRO *
          </label>
          <input
            type="text"
            value={formData.bairro}
            onChange={(e) => onInputChange('bairro', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NÚMERO *
          </label>
          <input
            type="text"
            value={formData.numero}
            onChange={(e) => onInputChange('numero', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ENDEREÇO *
          </label>
          <input
            type="text"
            value={formData.endereco}
            onChange={(e) => onInputChange('endereco', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            COMPLEMENTO
          </label>
          <input
            type="text"
            value={formData.complemento}
            onChange={(e) => onInputChange('complemento', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Apartamento, conjunto, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ENDEREÇO DE E-MAIL *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TELEFONE *
          </label>
          <input
            type="tel"
            value={formData.telefone}
            onChange={(e) => onInputChange('telefone', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    </div>
  );
} 