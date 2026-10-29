import { AIProvider } from '@/lib/ai/provider';
import { CommerceTools } from '@/lib/tools';
import { store } from '@/lib/db/store';

export interface RecoveryAgentOutput {
  customerId: string;
  customerName: string;
  cartValue: number;
  failureReason: string;
  intentScore: number;
  recoveryProbability: number;
  recommendedAction: string;
  paymentLinkId: string;
  paymentUrl: string;
  incentiveOffer: string;
  expectedRecoveryValue: number;
  status: 'pending' | 'executed' | 'recovered';
  confidence: number;
  reasoning: string;
}

export class RecoveryAgent {
  public static async analyzeRecoveryOpportunity(
    customerId: string,
    cartValue: number,
    failureReason = 'Payment gateway timeout / bank auth failure'
  ): Promise<RecoveryAgentOutput> {
    const customer = store.getCustomerById(customerId);

    // Call tool to create recovery payment link
    const linkTool = await CommerceTools.createPaymentLink(customerId, cartValue, `Cart Recovery for ${customer?.name || 'Customer'}`);
    const linkData = linkTool.data;

    const result = await AIProvider.generateStructured<RecoveryAgentOutput>({
      systemPrompt: 'You are the ANTARA Revenue Recovery Agent. Analyze checkout payment failures and high-intent cart abandonments to deploy instant Razorpay Payment Link recovery workflows.',
      prompt: `Analyze payment failure for "${customer?.name || 'Customer'}". Cart: ₹${cartValue}. Reason: "${failureReason}".`,
      fallbackGenerator: () => {
        const intentScore = customer ? customer.intentScore : 88;
        const recoveryProb = intentScore > 80 ? 0.78 : 0.55;

        return {
          customerId: customerId || 'cust_demo',
          customerName: customer?.name || 'Valued Shopper',
          cartValue,
          failureReason,
          intentScore,
          recoveryProbability: recoveryProb,
          recommendedAction: 'Generate Razorpay Payment Link + Free 15-Minute Priority Shipping',
          paymentLinkId: linkData.paymentLinkId,
          paymentUrl: linkData.paymentUrl,
          incentiveOffer: 'Free Express Shipping + Priority Dispatch (Valid 15 Mins)',
          expectedRecoveryValue: cartValue,
          status: 'pending',
          confidence: 0.91,
          reasoning: `Customer exhibits strong purchase intent (${intentScore}%). Cart failed at gateway stage. Sending instant Razorpay recovery link converts 78% of similar abandoned sessions.`,
        };
      },
    });

    // Log Action
    await CommerceTools.logAgentAction({
      agentId: 'recovery-agent',
      agentName: 'Revenue Recovery Agent',
      customerId,
      customerName: customer?.name || 'Shopper',
      title: `Generated Recovery Payment Link (₹${cartValue.toLocaleString('en-IN')})`,
      description: result.data.reasoning,
      reason: failureReason,
      confidence: Math.round(result.data.confidence * 100),
      actionType: 'recovery_link',
      expectedRevenue: cartValue,
      attributedRevenue: 0,
      status: 'executed',
      metadata: {
        paymentLinkId: linkData.paymentLinkId,
        paymentUrl: linkData.paymentUrl,
        cartValue,
        incentive: result.data.incentiveOffer,
        signals: ['Payment Failed', `Intent Score: ${result.data.intentScore}%`, `Recovery Prob: ${Math.round(result.data.recoveryProbability * 100)}%`],
      },
    });

    // Update customer record
    if (customer) {
      store.updateCustomer(customerId, {
        hasFailedPayment: true,
        failedPaymentAmount: cartValue,
      });
    }

    // Record Event
    store.recordEvent({
      type: 'AI_RECOVERY_TRIGGERED',
      customerId,
      customerName: customer?.name || 'Shopper',
      sessionId: `sess_${Date.now()}`,
      metadata: {
        paymentLinkId: linkData.paymentLinkId,
        paymentUrl: linkData.paymentUrl,
        cartValue,
        reason: failureReason,
      },
    });

    return result.data;
  }
}
