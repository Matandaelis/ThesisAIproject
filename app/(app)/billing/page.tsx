import { Check } from 'lucide-react';

export default function BillingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with academic writing.',
      features: [
        'Basic editor features',
        'Kenyan university templates',
        '100 AI credits per month',
        'Export to PDF',
        'Standard citation styles'
      ],
      current: true,
      buttonText: 'Current Plan',
      buttonClass: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      description: 'Advanced features for serious researchers.',
      features: [
        'Everything in Free',
        'Unlimited AI credits',
        'Advanced plagiarism detection',
        'Export to Word (DOCX)',
        'Mendeley & Zotero sync',
        'Priority support'
      ],
      current: false,
      buttonText: 'Upgrade to Pro',
      buttonClass: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
    }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 sm:space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">Simple, transparent pricing</h1>
        <p className="text-neutral-500 mt-3 sm:text-lg text-sm">Choose the plan that best fits your academic writing needs. Upgrade anytime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`
              bg-white rounded-3xl p-6 sm:p-8 border 
              ${plan.current ? 'border-neutral-200 shadow-sm' : 'border-indigo-200 shadow-xl ring-1 ring-indigo-50'}
              flex flex-col
            `}
          >
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl font-bold text-neutral-900">{plan.name}</h3>
              <p className="text-neutral-500 mt-2 text-sm">{plan.description}</p>
              <div className="mt-4 sm:mt-6 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">{plan.price}</span>
                <span className="text-neutral-500 font-medium text-sm sm:text-base">/{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span className="text-neutral-700 text-sm sm:text-base">{feature}</span>
                </li>
              ))}
            </ul>

            <button className={`w-full py-3 rounded-xl font-medium transition-colors text-sm sm:text-base ${plan.buttonClass}`}>
              {plan.buttonText}
            </button>
            
            {!plan.current && (
              <p className="text-center text-xs text-neutral-500 mt-4">
                Supports Stripe and M-Pesa payments
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
