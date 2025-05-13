'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useCookies } from 'react-cookie';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [profession, setProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [role, setRole] = useState('SEGURADO'); // Add role state
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const router = useRouter();
  const [cookies, setCookie] = useCookies(['role', 'email', 'user_id']);

  const fetchCities = async (uf: string) => {
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const data = await response.json();

      const cityOptions = data.map((city: { nome: string }) => ({
        value: city.nome,
        label: city.nome,
      }));

      setCities(cityOptions);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      alert('Erro ao buscar cidades');
    }
  };

  // Call fetchCities when the state changes
  useEffect(() => {
    if (state) {
      fetchCities(state);
    }
  }, [state]);

  const states = [
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
    { value: 'TO', label: 'Tocantins' },
  ];

  const fetchAddressFromCEP = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert('CEP não encontrado');
        return;
      }

      // Update form fields
      setAddress(data.logradouro);
      setCity(data.localidade);
      setState(data.uf);
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = isLogin ? '/api/login' : '/api/register';
    const body = isLogin
      ? { email, password }
      : { name, email, password, cpf, profession, phone, address, city, state, zip_code: zipCode };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      // Set cookies for email and user_id
      setCookie('email', data.user.email, { path: '/' });
      setCookie('user_id', data.user.id, { path: '/' });
      alert(data.message);
      router.push('/'); // Redirect to dashboard after successful login/registration
    } else {
      alert(data.message || 'Something went wrong');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-130px)] gap-4 text-center">
        <div
          className="h-[70%] bg-slate-300 items-center justify-center py-20 px-20 rounded-md"
          style={{ background: 'rgba(0,0,0,.3)' }} // Consider adjusting this background for contrast
        >
          <h1 className="text-xl mb-1 text-black">{isLogin ? 'Entrar' : 'Registrar'}</h1>
          
          <form
            onSubmit={handleSubmit}
            className={`grid ${isLogin ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}
          >
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="CPF"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Telefone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="CEP"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  onBlur={() => fetchAddressFromCEP(zipCode)}
                  required
                />
                <input
                  type="text"
                  placeholder="Endereço"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Número"
                  value={addressNumber}
                  onChange={(e) => setAddressNumber(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Complemento"
                  value={addressComplement}
                  onChange={(e) => setAddressComplement(e.target.value)}
                  required
                />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                >
                  <option value="">Selecione uma cidade</option>
                  {cities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                >
                  <option value="">Selecione um estado</option>
                  {states.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="SEGURADO">Segurado</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="CORRETOR">Corretor</option>
                  <option value="ADVOGADO">Advogado</option>
                </select>
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 mx-8 my-2 rounded focus:outline-none focus:shadow-outline ${isLogin ? '' : 'col-span-2'}`}
            >
              {isLogin ? 'Entrar' : 'Registrar'}
            </button>
          </form>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="mt-4 text-sm text-black hover:text-gray-700 underline"
          >
            {isLogin ? 'Criar uma conta' : 'Já tenho uma conta'}
          </button>
        </div>
      </div>
    </Layout>
  );
}