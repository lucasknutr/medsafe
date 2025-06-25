"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Paper, Typography, Grid, Card, CardContent, Button, CircularProgress, Alert, TextField } from "@mui/material";
import { useCookies } from "react-cookie";

interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_active: boolean;
}

// Added validateCoupon function (copied from RegisterForm)
const validateCoupon = (code: string): number => {
  switch (code.toUpperCase()) {
    case 'MEDSAFE10':
      return 0.10;
    case 'QUERO15':
      return 0.15;
    case 'MED20SAFE':
      return 0.20;
    case 'FORTALEZA10':
      return 0.10;
    case 'TESTE95':
      return 0.95;
    default:
      return 0;
  }
};

export default function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cookies] = useCookies(["role", "selected_plan", "email", "user_id"]);
  const planId = searchParams.get("planId") || (cookies.selected_plan && cookies.selected_plan.id);
  const [plan, setPlan] = useState<InsurancePlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [cardDetails, setCardDetails] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGoToHomeButton, setShowGoToHomeButton] = useState(false);

  // Coupon state variables
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // Address state variables
  const [address, setAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  // Payment error state variable
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setError("Nenhum plano selecionado.");
      setLoading(false);
      return;
    }
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/insurance-plans?id=${planId}`);
        if (!response.ok) throw new Error("Erro ao buscar o plano");
        const data = await response.json();
        const fetchedPlan = Array.isArray(data) ? data[0] : data;
        setPlan(fetchedPlan);
        if (fetchedPlan) {
          setFinalPrice(fetchedPlan.price); // Initialize finalPrice
        }
      } catch (err) {
        setError("Erro ao carregar o plano selecionado.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (address.cep.replace(/\D/g, '').length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${address.cep.replace(/\D/g, '')}/json/`);
          const data = await response.json();
          if (!data.erro) {
            setAddress(prev => ({
              ...prev,
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf,
            }));
          }
        } catch (error) {
        }
      }
    };
    fetchAddress();
  }, [address.cep]);

  const handleAddressChange = (field: keyof typeof address, value: string) => {
    if (field === 'cep') {
      value = value.replace(/\D/g, '');
      if (value.length > 8) value = value.slice(0, 8);
    }
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyCoupon = () => {
    if (!plan) return;
    const discount = validateCoupon(couponCode);
    if (discount > 0) {
      setAppliedDiscount(discount);
      setFinalPrice(plan.price * (1 - discount));
      setCouponMessage("Cupom aplicado com sucesso!");
    } else {
      setAppliedDiscount(0);
      setFinalPrice(plan.price);
      setCouponMessage("Cupom inválido ou expirado.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || finalPrice === null) return;

    let boletoWindow: Window | null = null;

    try {
      // If Boleto, open a new window synchronously before async operations
      if (paymentMethod === "BOLETO") {
        boletoWindow = window.open('', '_blank');
        if (boletoWindow) {
          boletoWindow.document.write('<p>Gerando seu boleto, por favor aguarde...</p>');
        } else {
          // Handle case where window.open failed (e.g., blocked by a very aggressive popup blocker)
          alert("Não foi possível abrir a janela para o boleto. Verifique as configurações do seu navegador.");
          return; // Stop processing if window couldn't be opened
        }
      }

      // Frontend validation for credit card fields
      if (paymentMethod === "CREDIT_CARD") {
        if (!cardDetails.holderName || !cardDetails.number || !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.ccv) {
          setPaymentError("Por favor, preencha todos os campos do cartão de crédito.");
          setLoading(false);
          return;
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(`${cardDetails.expiryMonth}/${cardDetails.expiryYear}`)) {
          setPaymentError("Formato da data de validade inválido. Use MM/AA.");
          setLoading(false);
          return;
        }
      }

      const paymentData: any = {
        planId: plan.id,
        paymentMethod: paymentMethod === "CARTAO" ? "CREDIT_CARD" : paymentMethod,
        email: cookies.email,
        customerId: cookies.user_id,
        originalAmount: plan.price,
        finalAmount: finalPrice, // Send final price
        couponCode: appliedDiscount > 0 ? couponCode : undefined, // Send coupon if applied
        address: address, // Include address in the payload
      };
      // Check the assigned payment method to decide whether to attach card info.
      if (paymentData.paymentMethod === "CREDIT_CARD") {
        // If the payment method is credit card, encode the card info.
        const cardInfoPayload = btoa(
          JSON.stringify({
            name: cardDetails.holderName,
            number: cardDetails.number,
            expiry: `${cardDetails.expiryMonth}/${cardDetails.expiryYear}`,
            cvc: cardDetails.ccv,
          })
        );
        paymentData.cardInfoPayload = cardInfoPayload;
      }

      setLoading(true);
      setPaymentError(null); // Reset error on new submission

      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      if (!paymentResponse.ok) {
        const error = await paymentResponse.json();
        throw new Error(error.error || "Erro ao processar pagamento");
      }
      const payment = await paymentResponse.json();

      if (paymentMethod === "BOLETO") {
        if (payment.boletoUrl) { 
          if (boletoWindow) {
            boletoWindow.location.href = payment.boletoUrl;
          } else {
            // Fallback if boletoWindow is somehow null (should not happen if logic above is correct)
            // or if we decide to not open window if fetch fails fast (less ideal)
            window.open(payment.boletoUrl, "_blank"); 
          }
          alert("Seu boleto foi gerado em uma nova aba. Redirecionando para a página de envio de contrato.");
          router.push("/planos"); // Redirect to planos page
        } else {
          if (boletoWindow) boletoWindow.close(); // Close the pre-opened window if no URL
          alert("Erro: URL do boleto não encontrada na resposta.");
        }
      } else {
        alert("Pagamento processado com sucesso! Redirecionando para a página de envio de contrato.");
        router.push("/planos"); // Redirect to planos page for non-Boleto payments
      }
    } catch (err: any) {
      // If a boleto window was opened and an error occurred, close it.
      if (boletoWindow) {
        boletoWindow.close();
      }
      // If the server returns an error, display it to the user.
      const errorDetails = err.message || 'Ocorreu um erro desconhecido.';
      // Extract the specific error message from Asaas if available
      const asaasErrorRegex = /Asaas API Error: \d+ - (\{.*\})'/;
      const match = errorDetails.match(asaasErrorRegex);
      if (match && match[1]) {
        try {
          const asaasError = JSON.parse(match[1]);
          if (asaasError.errors && asaasError.errors.length > 0) {
            setPaymentError(asaasError.errors[0].description);
          } else {
            setPaymentError('Erro retornado pela API de pagamentos.');
          }
        } catch (e) {
          setPaymentError(errorDetails); // Fallback to raw details
        }
      } else {
        setPaymentError(errorDetails);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!plan || finalPrice === null) return <Alert severity="warning">Plano não encontrado ou preço não calculado.</Alert>;

  return (
    <Paper className="p-6 max-w-xl mx-auto mt-10">
      <Typography variant="h5" className="mb-4">Pagamento do Plano: {plan.name}</Typography>
      <Typography variant="h6" color="primary" className="mb-1">
        R$ {finalPrice.toFixed(2)}/mês
      </Typography>
      {appliedDiscount > 0 && plan.price !== finalPrice && (
        <Typography variant="subtitle2" color="textSecondary" className="mb-4 line-through">
          De: R$ {plan.price.toFixed(2)}
        </Typography>
      )}

      {/* Coupon Section */}
      <div className="my-4 p-4 border rounded">
        <Typography variant="subtitle1" className="mb-2">Cupom de Desconto</Typography>
        <div className="flex gap-2 items-start">
          <TextField
            label="Código do Cupom"
            variant="outlined"
            size="small"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-grow"
          />
          <Button
            variant="contained"
            onClick={handleApplyCoupon}
            disabled={!couponCode.trim()}
          >
            Aplicar
          </Button>
        </div>
        {couponMessage && (
          <Typography 
            variant="caption" 
            className={`mt-2 ${appliedDiscount > 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {couponMessage}
          </Typography>
        )}
      </div>

      {/* Display Payment Error */}
      {paymentError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Erro no Pagamento: </strong>
          <span className="block sm:inline">{paymentError}</span>
        </div>
      )}

      {!showGoToHomeButton ? (
        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle1" className="mb-2">Método de Pagamento</Typography>
          <div className="flex gap-4 mb-4">
            <Button
              variant={paymentMethod === "BOLETO" ? "contained" : "outlined"}
              color="primary"
              onClick={() => setPaymentMethod("BOLETO")}
            >
              Boleto Bancário
            </Button>
            <Button
              variant={paymentMethod === "CREDIT_CARD" ? "contained" : "outlined"}
              color="primary"
              onClick={() => setPaymentMethod("CREDIT_CARD")}
            >
              Cartão de Crédito
            </Button>
          </div>
          {paymentMethod === "CREDIT_CARD" && (
            <div className="space-y-2 mb-4">
              <input
                type="text"
                placeholder="Nome no cartão"
                value={cardDetails.holderName || ""}
                onChange={e => setCardDetails((c: any) => ({ ...c, holderName: e.target.value }))}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Número do cartão"
                value={cardDetails.number || ""}
                onChange={e => setCardDetails((c: any) => ({ ...c, number: e.target.value }))}
                className="w-full p-2 border rounded"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="MM"
                  value={cardDetails.expiryMonth || ""}
                  onChange={e => setCardDetails((c: any) => ({ ...c, expiryMonth: e.target.value }))}
                  className="w-1/3 p-2 border rounded"
                  maxLength={2}
                />
                <input
                  type="text"
                  placeholder="AA"
                  value={cardDetails.expiryYear || ""}
                  onChange={e => setCardDetails((c: any) => ({ ...c, expiryYear: e.target.value }))}
                  className="w-1/3 p-2 border rounded"
                  maxLength={2}
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cardDetails.ccv || ""}
                  onChange={e => setCardDetails((c: any) => ({ ...c, ccv: e.target.value }))}
                  className="w-1/3 p-2 border rounded"
                  maxLength={4}
                />
              </div>
            </div>
          )}
          {paymentMethod === "CREDIT_CARD" && (
            <div className="mb-6 p-4 border rounded-md">
              <h2 className="text-xl font-semibold mb-4">Endereço de Cobrança</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <input
                    type="text"
                    value={address.cep}
                    onChange={(e) => handleAddressChange('cep', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-gray-300"
                    maxLength={8}
                    placeholder="Somente números"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-gray-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input
                    type="text"
                    value={address.number}
                    onChange={(e) => handleAddressChange('number', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={address.complement}
                    onChange={(e) => handleAddressChange('complement', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={address.neighborhood}
                    onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-gray-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-gray-300"
                  />
                </div>
              </div>
            </div>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!paymentMethod}
            fullWidth
          >
            Finalizar Pagamento
          </Button>
        </form>
      ) : (
        <div className="text-center mt-6">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => router.push('/')}
          >
            Continuar para o Início
          </Button>
        </div>
      )}
    </Paper>
  );
}
