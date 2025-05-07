import React, { useEffect } from 'react';

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
    role: string;
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

const paises = [
  { value: 'BR', label: 'Brasil' },
  { value: 'AR', label: 'Argentina' },
  { value: 'BO', label: 'Bolívia' },
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colômbia' },
  { value: 'EC', label: 'Equador' },
  { value: 'GY', label: 'Guiana' },
  { value: 'PY', label: 'Paraguai' },
  { value: 'PE', label: 'Peru' },
  { value: 'SR', label: 'Suriname' },
  { value: 'UY', label: 'Uruguai' },
  { value: 'VE', label: 'Venezuela' }
];

const estados = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

// Correct roles for MedSafe platform
const roles = [
  { value: 'SEGURADO', label: 'Segurado' },
  { value: 'CORRETOR', label: 'Corretor' },
  { value: 'ADVOGADO', label: 'Advogado' }
];

export default function PersonalInfo({ formData, onInputChange }: PersonalInfoProps) {
  const fetchAddressFromCEP = async (cep: string) => {
    if (cep.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert('CEP não encontrado');
        return;
      }

      // Update form fields
      onInputChange('endereco', data.logradouro);
      onInputChange('bairro', data.bairro);
      onInputChange('cidade', data.localidade);
      onInputChange('estado', data.uf);
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP');
    }
  };

  // Watch for CEP changes
  useEffect(() => {
    if (formData.cep) {
      fetchAddressFromCEP(formData.cep.replace(/\D/g, ''));
    }
  }, [formData.cep]);

  return (
    <div className="space-y-6">
      {/* Role selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Qual o seu perfil?
        </label>
        <select
          value={formData.role || ''}
          onChange={e => onInputChange('role', e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione...</option>
          {roles.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
      </div>

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
            type="text"
            value={formData.birthDate}
            onChange={(e) => onInputChange('birthDate', e.target.value)}
            placeholder="DD/MM/YYYY"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RG E ÓRGÃO EXPEDIDOR *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={formData.rg}
              onChange={(e) => onInputChange('rg', e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="RG"
              required
            />
            <input
              type="text"
              value={formData.orgaoExpedidor}
              onChange={(e) => onInputChange('orgaoExpedidor', e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Órgão"
              required
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
            PAÍS *
          </label>
          <select
            value={formData.pais}
            onChange={(e) => onInputChange('pais', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione um país...</option>
            {paises.map((pais) => (
              <option key={pais.value} value={pais.value}>
                {pais.label}
              </option>
            ))}
          </select>
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
            {estados.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
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