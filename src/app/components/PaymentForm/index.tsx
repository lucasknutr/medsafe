"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Paper, Typography, Grid, Card, CardContent, Button, CircularProgress, Alert } from "@mui/material";
import { useCookies } from "react-cookie";

interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_active: boolean;
}

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
        // If endpoint returns array
        setPlan(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        setError("Erro ao carregar o plano selecionado.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;

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

      const paymentData: any = {
        planId: plan.id,
        paymentMethod: paymentMethod === "CARTAO" ? "CREDIT_CARD" : paymentMethod,
        email: cookies.email,
        customerId: cookies.user_id,
      };
      if (paymentMethod === "CARTAO") {
        paymentData.cardInfo = cardDetails;
      }

      console.log('PaymentForm - Sending paymentData to /api/payments:', JSON.stringify(paymentData, null, 2));

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
          alert("Boleto gerado com sucesso! Por favor, realize o pagamento para ativar seu plano.");
          setShowGoToHomeButton(true); // Show the button after Boleto success
        } else {
          if (boletoWindow) boletoWindow.close(); // Close the pre-opened window if no URL
          alert("Erro: URL do boleto não encontrada na resposta.");
        }
      } else {
        alert("Pagamento processado com sucesso! Seu plano foi ativado.");
        router.push("/"); // Redirect to home for non-Boleto payments
      }
    } catch (err: any) {
      console.error("Payment Error:", err);
      // If a boleto window was opened and an error occurred, close it.
      if (boletoWindow) {
        boletoWindow.close();
      }
      alert(err.message || "Erro ao processar pagamento");
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!plan) return <Alert severity="warning">Plano não encontrado.</Alert>;

  return (
    <Paper className="p-6 max-w-xl mx-auto mt-10">
      <Typography variant="h5" className="mb-4">Pagamento do Plano: {plan.name} (id: {plan.id})</Typography>
      <Typography variant="h6" color="primary" className="mb-4">
        R$ {plan.price.toFixed(2)}/mês
      </Typography>

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
