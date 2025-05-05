document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentTopic = null;
    let conversationHistory = [];
    const API_URL = 'http://localhost:3000/api';

    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const calculatorModal = document.getElementById('calculator-modal');
    const closeModal = document.querySelector('.close-modal');
    const calculatorTabs = document.querySelectorAll('.tab-btn');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    const newChatBtn = document.querySelector('.new-chat-btn');

    // Dark Mode Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use system preference
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

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu')) {
            navLinks.style.display = 'none';
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu after clicking
                navLinks.style.display = 'none';
            }
        });
    });

    // Active navigation link based on scroll position
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // Add animation to feature cards on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .tool-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });

    // Chat Functions
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (!isUser) {
            const header = document.createElement('div');
            header.className = 'message-header';
            header.innerHTML = '<i class="fas fa-robot"></i><span>Financial AI</span>';
            messageContent.appendChild(header);
        }
        
        const messageText = document.createElement('p');
        messageText.textContent = content;
        messageContent.appendChild(messageText);
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add to conversation history
        conversationHistory.push({
            content,
            isUser
        });
    }

    async function getAIResponse(message) {
        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    conversationHistory,
                    topic: currentTopic
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error:', error);
            return "I'm sorry, I'm having trouble processing your request. Please try again.";
        }
    }

    function handleQuickAction(topic) {
        currentTopic = topic;
        let prompt = '';
        
        switch (topic) {
            case 'invest':
                prompt = "Let's build your investment strategy. What's your yearly income?";
                break;
            case 'loans':
                prompt = "Let's plan your debt-free journey. How many loans do you have?";
                break;
            case 'planning':
                prompt = "What would you like to plan for? (e.g., car, house, travel)";
                break;
        }
        
        addMessage(prompt);
    }

    // Event Listeners
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            handleQuickAction(btn.dataset.topic);
        });
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        userInput.value = '';

        // Show loading state
        const loadingMessage = addMessage("Thinking...", false);
        
        try {
            const aiResponse = await getAIResponse(message);
            // Remove loading message
            chatMessages.removeChild(loadingMessage);
            addMessage(aiResponse);
        } catch (error) {
            console.error('Error:', error);
            chatMessages.removeChild(loadingMessage);
            addMessage("I'm sorry, I encountered an error. Please try again.");
        }
    });

    // Calculator Modal
    document.querySelector('[data-action="calculator"]').addEventListener('click', () => {
        calculatorModal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        calculatorModal.classList.remove('active');
    });

    calculatorTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            calculatorTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateCalculatorForm(tab.dataset.calc);
        });
    });

    function updateCalculatorForm(type) {
        const formContainer = document.querySelector('.calculator-form');
        let formHTML = '';

        switch (type) {
            case 'investment':
                formHTML = `
                    <div class="form-group">
                        <label>Initial Investment Amount</label>
                        <div class="input-group">
                            <span class="input-prefix">₹</span>
                            <input type="number" id="principal" placeholder="Enter amount" min="0">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Expected Annual Return (%)</label>
                        <div class="input-group">
                            <input type="number" id="rate" placeholder="Enter rate" min="0" max="100">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Investment Period</label>
                        <div class="input-group">
                            <input type="number" id="years" placeholder="Enter years" min="1">
                            <span class="input-suffix">years</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Monthly Contribution</label>
                        <div class="input-group">
                            <span class="input-prefix">₹</span>
                            <input type="number" id="monthly" placeholder="Enter amount" min="0">
                        </div>
                    </div>
                    <button class="calculate-btn">
                        <i class="fas fa-calculator"></i> Calculate
                    </button>
                `;
                break;
            case 'loan':
                formHTML = `
                    <div class="form-group">
                        <label>Loan Amount</label>
                        <div class="input-group">
                            <span class="input-prefix">₹</span>
                            <input type="number" id="principal" placeholder="Enter amount" min="0">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Interest Rate</label>
                        <div class="input-group">
                            <input type="number" id="rate" placeholder="Enter rate" min="0" max="100">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Loan Term</label>
                        <div class="input-group">
                            <input type="number" id="years" placeholder="Enter years" min="1">
                            <span class="input-suffix">years</span>
                        </div>
                    </div>
                    <button class="calculate-btn">
                        <i class="fas fa-calculator"></i> Calculate EMI
                    </button>
                `;
                break;
            case 'planning':
                formHTML = `
                    <div class="form-group">
                        <label>Goal Amount</label>
                        <div class="input-group">
                            <span class="input-prefix">₹</span>
                            <input type="number" id="goal" placeholder="Enter amount" min="0">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Time Horizon</label>
                        <div class="input-group">
                            <input type="number" id="years" placeholder="Enter years" min="1">
                            <span class="input-suffix">years</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Expected Inflation Rate</label>
                        <div class="input-group">
                            <input type="number" id="inflation" placeholder="Enter rate" min="0" max="100">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Current Savings</label>
                        <div class="input-group">
                            <span class="input-prefix">₹</span>
                            <input type="number" id="savings" placeholder="Enter amount" min="0">
                        </div>
                    </div>
                    <button class="calculate-btn">
                        <i class="fas fa-calculator"></i> Calculate Plan
                    </button>
                `;
                break;
        }

        formContainer.innerHTML = formHTML;
        setupCalculator(type);
    }

    function setupCalculator(type) {
        const calculateBtn = document.querySelector('.calculate-btn');
        calculateBtn.addEventListener('click', async () => {
            const formData = getFormData(type);
            
            try {
                const response = await fetch(`${API_URL}/calculate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type,
                        data: formData
                    })
                });

                if (!response.ok) {
                    throw new Error('Calculation failed');
                }

                const result = await response.json();
                displayCalculatorResult(type, result.result);
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to perform calculation. Please try again.');
            }
        });
    }

    function getFormData(type) {
        const formData = {};
        const inputs = document.querySelectorAll('.calculator-form input');
        
        inputs.forEach(input => {
            formData[input.id] = parseFloat(input.value) || 0;
        });
        
        return formData;
    }

    function displayCalculatorResult(type, result) {
        const resultsContainer = document.querySelector('.calculator-results');
        let resultHTML = '';

        switch (type) {
            case 'investment':
                resultHTML = `
                    <h3>Investment Results</h3>
                    <p>
                        <span>Total Amount</span>
                        <span>₹${result.totalAmount.toLocaleString()}</span>
                    </p>
                    <p>
                        <span>Total Contribution</span>
                        <span>₹${result.totalContribution.toLocaleString()}</span>
                    </p>
                    <p>
                        <span>Interest Earned</span>
                        <span>₹${result.interestEarned.toLocaleString()}</span>
                    </p>
                `;
                break;
            case 'loan':
                resultHTML = `
                    <h3>Loan Results</h3>
                    <p>
                        <span>Monthly EMI</span>
                        <span>₹${result.emi.toLocaleString()}</span>
                    </p>
                    <p>
                        <span>Total Payment</span>
                        <span>₹${result.totalPayment.toLocaleString()}</span>
                    </p>
                    <p>
                        <span>Total Interest</span>
                        <span>₹${result.totalInterest.toLocaleString()}</span>
                    </p>
                `;
                break;
            case 'planning':
                resultHTML = `
                    <h3>Financial Plan</h3>
                    <p>
                        <span>Inflation Adjusted Amount</span>
                        <span>₹${result.inflationAdjustedAmount.toLocaleString()}</span>
                    </p>
                    <p>
                        <span>Required Monthly Savings</span>
                        <span>₹${result.monthlySavings.toLocaleString()}</span>
                    </p>
                    <p>
                        <span>Total Savings Needed</span>
                        <span>₹${result.totalSavings.toLocaleString()}</span>
                    </p>
                `;
                break;
        }

        resultsContainer.innerHTML = resultHTML;
    }

    // New Chat
    newChatBtn.addEventListener('click', () => {
        chatMessages.innerHTML = '';
        currentTopic = null;
        conversationHistory = [];
        addMessage("Hello! I'm your AI financial assistant. How can I help you today?");
    });
}); 