import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      cpf,
      birthDate,
      rg,
      orgaoExpedidor,
      residenceSince,
      fezResidencia,
      especialidadeAtual,
      pertenceAlgumaAssociacao,
      socioProprietario,
      entidadeExerce,
      realizaProcedimento,
      atividadeProfissional,
      pais,
      estado,
      cep,
      cidade,
      bairro,
      endereco,
      numero,
      complemento,
      telefone,
      penalRestritiva,
      penaAdministrativa,
      dependenteQuimico,
      recusaSeguro,
      conhecimentoReclamacoes,
      envolvidoReclamacoes,
      assessoradoPorVendas,
      selectedPlan,
      paymentMethod,
      installments,
      acceptedTerms,
      cardHolderName,
      cardNumber,
      cardExpiryMonth,
      cardExpiryYear,
      cardCcv,
    } = await request.json();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          cpf,
          phone: telefone,
        },
      },
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No user data returned from signup');
    }

    // Update the profile with all the additional information
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        birth_date: birthDate,
        rg,
        orgao_expedidor: orgaoExpedidor,
        residence_since: residenceSince,
        fez_residencia: fezResidencia,
        especialidade_atual: especialidadeAtual,
        pertence_alguma_associacao: pertenceAlgumaAssociacao,
        socio_proprietario: socioProprietario,
        entidade_exerce: entidadeExerce,
        realiza_procedimento: realizaProcedimento,
        atividade_profissional: atividadeProfissional,
        pais,
        estado,
        cep,
        cidade,
        bairro,
        endereco,
        numero,
        complemento,
        penal_restritiva: penalRestritiva,
        pena_administrativa: penaAdministrativa,
        dependente_quimico: dependenteQuimico,
        recusa_seguro: recusaSeguro,
        conhecimento_reclamacoes: conhecimentoReclamacoes,
        envolvido_reclamacoes: envolvidoReclamacoes,
        assessorado_por_vendas: assessoradoPorVendas,
        selected_plan: selectedPlan,
        payment_method: paymentMethod,
        installments,
        accepted_terms: acceptedTerms,
        card_holder_name: cardHolderName,
        card_number: cardNumber,
        card_expiry_month: cardExpiryMonth,
        card_expiry_year: cardExpiryYear,
        card_ccv: cardCcv,
      })
      .eq('id', authData.user.id);

    if (profileError) {
      throw profileError;
    }

    // Return success response
    return NextResponse.json(
      { message: 'Usuário cadastrado com sucesso!', user: authData.user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Erro ao cadastrar usuário.', error: error.message },
      { status: 400 }
    );
  }
}