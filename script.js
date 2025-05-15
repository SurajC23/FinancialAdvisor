document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    const currentTheme = localStorage.getItem('theme') || 
        (prefersDarkScheme.matches ? 'dark' : 'light');
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        themeToggle.innerHTML = newTheme === 'dark' ? 
            '<i class="fas fa-sun"></i>' : 
            '<i class="fas fa-moon"></i>';
    });

    // Chat Elements
    const messagesContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const newChatButton = document.querySelector('.new-chat-btn');
    const actionButtons = document.querySelectorAll('.action-btn');

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    });

    // Send message function
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message);
            userInput.value = '';
            userInput.style.height = 'auto';
            
            // Show typing indicator
            const typingIndicator = addTypingIndicator();
            
            // Generate AI response
            setTimeout(() => {
                // Remove typing indicator
                typingIndicator.remove();
                
                // Generate response based on user input
                const response = generateAIResponse(message);
                addMessage('ai', response);
            }, 1000);
        }
    }

    // Add typing indicator
    function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'message-content';
        
        const header = document.createElement('div');
        header.className = 'message-header';
        header.innerHTML = '<i class="fas fa-robot"></i><span>Financial AI</span>';
        
        const dots = document.createElement('div');
        dots.className = 'typing-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';
        
        typingContent.appendChild(header);
        typingContent.appendChild(dots);
        typingDiv.appendChild(typingContent);
        messagesContainer.appendChild(typingDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return typingDiv;
    }

    // Generate AI response
    function generateAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for specific keywords and provide relevant responses
        if (lowerMessage.includes('investment') || lowerMessage.includes('invest')) {
            return "I can help you with investment planning! Here are some key points to consider:\n\n" +
                   "1. Diversification: Spread your investments across different assets\n" +
                   "2. Risk Assessment: Consider your risk tolerance\n" +
                   "3. Long-term Goals: Focus on your financial objectives\n\n" +
                   "Would you like to use our investment calculator to explore potential returns?";
        }
        
        if (lowerMessage.includes('loan') || lowerMessage.includes('emi')) {
            return "I can assist you with loan management! Here's what you should know:\n\n" +
                   "1. EMI Calculation: Understand your monthly payments\n" +
                   "2. Interest Rates: Compare different loan options\n" +
                   "3. Loan Tenure: Choose the right duration\n\n" +
                   "Would you like to use our loan calculator to analyze your options?";
        }
        
        if (lowerMessage.includes('goal') || lowerMessage.includes('planning')) {
            return "Let's help you achieve your financial goals! Consider these aspects:\n\n" +
                   "1. Goal Setting: Define clear objectives\n" +
                   "2. Time Horizon: Plan for short and long term\n" +
                   "3. Regular Review: Monitor your progress\n\n" +
                   "Would you like to use our financial planning calculator to estimate your needs?";
        }
        
        if (lowerMessage.includes('calculator') || lowerMessage.includes('calculate')) {
            return "You can access our financial calculators by clicking the 'Financial Calculators' link in the sidebar. We offer:\n\n" +
                   "1. SIP Calculator: Plan your investments\n" +
                   "2. Loan Calculator: Calculate EMIs\n" +
                   "3. Financial Planning Calculator: Set your goals";
        }
        
        // Default response for other queries
        return "I'm your AI financial assistant. I can help you with:\n\n" +
               "1. Investment Planning\n" +
               "2. Loan Management\n" +
               "3. Financial Goals\n\n" +
               "You can also use our financial calculators by clicking the calculator link in the sidebar. How can I assist you today?";
    }

    // Add message to chat
    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (type === 'ai') {
            const header = document.createElement('div');
            header.className = 'message-header';
            header.innerHTML = '<i class="fas fa-robot"></i><span>Financial AI</span>';
            messageContent.appendChild(header);
        }
        
        const text = document.createElement('p');
        text.innerHTML = content.replace(/\n/g, '<br>');
        messageContent.appendChild(text);
        
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Event Listeners
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    newChatButton.addEventListener('click', () => {
        messagesContainer.innerHTML = '';
        addMessage('ai', "Hello! I'm your AI financial assistant. How can I help you today?");
    });

    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.textContent.trim();
            if (action === 'Investment Planning') {
                document.getElementById('investment-modal').style.display = 'block';
                return;
            }
            addMessage('user', `I want to learn more about ${action}`);
            // Show typing indicator
            const typingIndicator = addTypingIndicator();
            setTimeout(() => {
                // Remove typing indicator
                typingIndicator.remove();
                let response = '';
                switch(action) {
                    case 'Loan Management':
                        response = "Loan management helps you understand and optimize your debt. Key aspects include:\n\n" +
                                 "1. EMI Planning: Calculate and manage monthly payments\n" +
                                 "2. Interest Optimization: Find the best rates\n" +
                                 "3. Debt Consolidation: Simplify multiple loans\n\n" +
                                 "Would you like to use our loan calculator to analyze your options?";
                        break;
                    case 'Financial Goals':
                        response = "Setting and achieving financial goals is crucial for long-term success. Consider:\n\n" +
                                 "1. Goal Setting: Define clear objectives\n" +
                                 "2. Time Horizon: Plan for short and long term\n" +
                                 "3. Regular Review: Monitor your progress\n\n" +
                                 "Would you like to use our financial planning calculator to estimate your needs?";
                        break;
                }
                if (response) addMessage('ai', response);
            }, 1000);
        });
    });

    // Modal logic for Investment Planning
    const investmentModal = document.getElementById('investment-modal');
    const closeInvestmentModal = document.getElementById('close-investment-modal');
    closeInvestmentModal.onclick = function() {
        investmentModal.style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target === investmentModal) {
            investmentModal.style.display = 'none';
        }
    };

    // Helper to prettify investment plan output
    function prettifyInvestmentPlanOutput(rawOutput) {
        // Convert headings (e.g., lines starting with numbers or section names) to bold
        let output = rawOutput
            .replace(/^(\d+\..*)$/gm, '<b>$1</b>')
            .replace(/^(Conclusion:|Investment Strategy|Year-Wise Breakdown|Current Financial Situation|Future Value of Car Cost|Future Value of Savings|Investment Plan):/gmi, '<b>$1:</b>');

        // Convert year-wise breakdowns to HTML table if detected
        const tableRegex = /\|\s*Year\s*\|[\s\S]+?\|\s*-+\s*\|([\s\S]+?)\n\n/;
        const match = output.match(/\|\s*Year\s*\|[\s\S]+?(\|\s*-+\s*\|[\s\S]+?)(?=\n\n|$)/);
        if (match) {
            // Extract table block
            const tableBlock = match[0];
            const lines = tableBlock.trim().split('\n').filter(l => l.trim().startsWith('|'));
            if (lines.length > 2) {
                // First line: header, Second line: separator, Rest: rows
                const headerCells = lines[0].split('|').map(cell => cell.trim()).filter(Boolean);
                const rows = lines.slice(2).map(row => row.split('|').map(cell => cell.trim()).filter(Boolean));
                let tableHtml = '<table border="1" cellpadding="5" cellspacing="0"><thead><tr>';
                headerCells.forEach(cell => { tableHtml += `<th>${cell}</th>`; });
                tableHtml += '</tr></thead><tbody>';
                rows.forEach(row => {
                    tableHtml += '<tr>';
                    row.forEach(cell => { tableHtml += `<td>${cell}</td>`; });
                    tableHtml += '</tr>';
                });
                tableHtml += '</tbody></table><br>';
                output = output.replace(tableBlock, tableHtml);
            }
        }
        // Add <br> for newlines not in tables
        output = output.replace(/\n/g, '<br>');
        return output;
    }

    document.getElementById('investment-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const yearlyIncome = document.getElementById('yearly-income').value;
        const yearlySpends = document.getElementById('yearly-spends').value;
        const yearlySaving = document.getElementById('yearly-saving').value;
        const financialGoal = document.getElementById('financial-goal').value;
        const investmentType = document.getElementById('investment-type').value;
        const investmentData = {
            yearlyIncome,
            yearlySpends,
            yearlySaving,
            financialGoal,
            investmentType
        };
        investmentModal.style.display = 'none';
        addMessage('ai', `<b>Investment Planning Details Submitted:</b><br><pre>${JSON.stringify(investmentData, null, 2)}</pre>`);

        // Show typing indicator
        const typingIndicator = addTypingIndicator();
        try {
            // Convert JSON to a readable query string
            const queryString = encodeURIComponent(
                `My yearly income is ${yearlyIncome} and my yearly spending is ${yearlySpends}. After my expenses, I have savings of ${yearlySaving}. My goal is to buy luxury car of ${financialGoal}. give me the detailed plan including investment ideas like FD, Gold, Stock, Mutual funds and their percentages of investment to achieve this goal. Consider inflation yearly 7% and provide me detailed year wise output for next years till achieve my goal.`)
            const url = `https://rahulsonone.app.n8n.cloud/webhook-test/608e5881-afec-441d-9bd9-920ba0a0eb1b?query=${queryString}`;
            const response = await fetch(url, { method: 'POST' });
            const data = await response.json();
            typingIndicator.remove();
            if (data && data.output) {
                addMessage('ai', prettifyInvestmentPlanOutput(data.output));
            } else {
                addMessage('ai', 'Sorry, no response received from the investment advisor API.');
            }
        } catch (err) {
            typingIndicator.remove();
            addMessage('ai', 'An error occurred while contacting the investment advisor API.');
        }
    });

    // Initial welcome message
    addMessage('ai', "Hello! I'm your AI financial assistant. How can I help you today?");
}); 