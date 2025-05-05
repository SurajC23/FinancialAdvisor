const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// Financial context for the AI
const financialContext = `
You are a professional financial advisor AI assistant. Your role is to:
1. Help users with investment planning, loan management, and financial goals
2. Provide accurate, personalized financial advice
3. Use clear, professional language
4. Consider Indian financial context (INR currency, Indian tax laws, etc.)
5. Always prioritize user's financial safety and long-term goals

Key financial principles to follow:
- Emergency fund should be 6-12 months of expenses
- Debt-to-income ratio should be below 40%
- Diversify investments across asset classes
- Consider inflation in long-term planning
- Prioritize high-interest debt repayment
`;

// Routes
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationHistory, topic } = req.body;

        // Prepare the conversation context
        const messages = [
            { role: "system", content: financialContext },
            ...conversationHistory.map(msg => ({
                role: msg.isUser ? "user" : "assistant",
                content: msg.content
            })),
            { role: "user", content: message }
        ];

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
        });

        const response = completion.choices[0].message.content;

        res.json({ response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Financial calculations endpoint
app.post('/api/calculate', async (req, res) => {
    try {
        const { type, data } = req.body;
        let result;

        switch (type) {
            case 'investment':
                result = calculateInvestment(data);
                break;
            case 'loan':
                result = calculateLoan(data);
                break;
            case 'planning':
                result = calculateFinancialPlan(data);
                break;
            default:
                throw new Error('Invalid calculation type');
        }

        res.json({ result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Calculation failed' });
    }
});

// Helper functions for calculations
function calculateInvestment(data) {
    const { principal, rate, years, monthlyContribution } = data;
    const monthlyRate = rate / 12 / 100;
    const totalMonths = years * 12;
    
    let total = principal;
    for (let i = 0; i < totalMonths; i++) {
        total = (total + monthlyContribution) * (1 + monthlyRate);
    }
    
    return {
        totalAmount: total,
        totalContribution: principal + (monthlyContribution * totalMonths),
        interestEarned: total - (principal + (monthlyContribution * totalMonths))
    };
}

function calculateLoan(data) {
    const { principal, rate, years } = data;
    const monthlyRate = rate / 12 / 100;
    const totalMonths = years * 12;
    
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / 
                (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    return {
        emi,
        totalPayment: emi * totalMonths,
        totalInterest: (emi * totalMonths) - principal
    };
}

function calculateFinancialPlan(data) {
    const { goalAmount, years, inflationRate, currentSavings } = data;
    const inflationAdjustedAmount = goalAmount * Math.pow(1 + (inflationRate / 100), years);
    const monthlySavings = (inflationAdjustedAmount - currentSavings) / (years * 12);
    
    return {
        inflationAdjustedAmount,
        monthlySavings,
        totalSavings: monthlySavings * years * 12
    };
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 