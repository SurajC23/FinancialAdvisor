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

    // Calculator Tabs
    const calculatorTabs = document.querySelectorAll('.tab-btn');
    const calculatorSections = document.querySelectorAll('.calculator-section');

    calculatorTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and sections
            calculatorTabs.forEach(t => t.classList.remove('active'));
            calculatorSections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked tab and corresponding section
            tab.classList.add('active');
            const sectionId = `${tab.dataset.calc}-calculator`;
            document.getElementById(sectionId).classList.add('active');

            // Clear previous results
            clearResults(tab.dataset.calc);
        });
    });

    // SIP Calculator
    document.getElementById('calculate-sip').addEventListener('click', function() {
        const monthly = parseFloat(document.getElementById('monthly').value);
        const rate = parseFloat(document.getElementById('rate').value);
        const years = parseFloat(document.getElementById('years').value);

        if (!monthly || !rate || !years) {
            alert('Please fill in all fields');
            return;
        }

        if (monthly <= 0 || rate <= 0 || years <= 0) {
            alert('Please enter positive values');
            return;
        }

        const monthlyRate = rate / 12 / 100;
        const totalMonths = years * 12;
        
        // SIP Formula: M = P × ({(1 + i)^n - 1} / i) × (1 + i)
        const maturityAmount = monthly * 
            ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * 
            (1 + monthlyRate);
        
        const totalInvestment = monthly * totalMonths;
        const totalReturns = maturityAmount - totalInvestment;

        // Update results
        document.getElementById('total-investment').textContent = formatCurrency(totalInvestment);
        document.getElementById('total-returns').textContent = formatCurrency(totalReturns);
        document.getElementById('maturity-value').textContent = formatCurrency(maturityAmount);

        // Calculate yearly breakdown for charts
        const yearlyBreakdown = [];
        let invested = 0;
        let returns = 0;

        for (let year = 1; year <= years; year++) {
            const yearInvestment = monthly * 12;
            invested += yearInvestment;
            
            const yearEndAmount = monthly * 
                ((Math.pow(1 + monthlyRate, year * 12) - 1) / monthlyRate) * 
                (1 + monthlyRate);
            
            returns = yearEndAmount - invested;
            
            yearlyBreakdown.push({
                year,
                invested,
                returns,
                total: yearEndAmount
            });
        }

        // Update charts
        updateSIPCharts({
            totalContribution: totalInvestment,
            interestEarned: totalReturns,
            yearlyBreakdown
        });
    });

    // Loan Calculator
    const calculateLoanBtn = document.getElementById('calculate-loan');
    calculateLoanBtn.addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('loan-amount').value) || 0;
        const rate = parseFloat(document.getElementById('loan-rate').value) || 0;
        const years = parseFloat(document.getElementById('loan-years').value) || 0;

        if (amount <= 0 || rate <= 0 || years <= 0) {
            alert('Please enter valid values for all fields');
            return;
        }

        const result = calculateLoan(amount, rate, years);
        displayLoanResults(result);
        updateLoanCharts(result);
    });

    // Financial Planning Calculator
    const calculatePlanningBtn = document.getElementById('calculate-planning');
    calculatePlanningBtn.addEventListener('click', () => {
        const goal = parseFloat(document.getElementById('goal-amount').value) || 0;
        const years = parseFloat(document.getElementById('planning-years').value) || 0;
        const inflation = parseFloat(document.getElementById('inflation-rate').value) || 0;
        const savings = parseFloat(document.getElementById('current-savings').value) || 0;

        if (goal <= 0 || years <= 0 || inflation < 0) {
            alert('Please enter valid values for all fields');
            return;
        }

        const result = calculateFinancialPlan(goal, years, inflation, savings);
        displayPlanningResults(result);
        updatePlanningCharts(result);
    });

    // Debt Repayment Calculator
    document.getElementById('calculate-debt').addEventListener('click', function() {
        const debtAmount = parseFloat(document.getElementById('debt-amount').value);
        const interestRate = parseFloat(document.getElementById('debt-rate').value);
        const monthlyPayment = parseFloat(document.getElementById('monthly-payment').value);

        if (!debtAmount || !interestRate || !monthlyPayment) {
            alert('Please fill in all fields');
            return;
        }

        if (debtAmount <= 0 || interestRate <= 0 || monthlyPayment <= 0) {
            alert('Please enter positive values');
            return;
        }

        const monthlyRate = interestRate / 12 / 100;
        let remainingDebt = debtAmount;
        let totalInterest = 0;
        let months = 0;
        const timeline = [];

        while (remainingDebt > 0 && months < 600) { // Max 50 years
            const interest = remainingDebt * monthlyRate;
            const principal = monthlyPayment - interest;
            remainingDebt -= principal;
            totalInterest += interest;
            months++;

            timeline.push({
                month: months,
                principal: principal,
                interest: interest,
                remaining: Math.max(0, remainingDebt)
            });
        }

        if (months >= 600) {
            alert('The monthly payment is too low to pay off the debt in a reasonable time. Please increase the monthly payment.');
            return;
        }

        // Update results
        document.getElementById('total-interest-paid').textContent = formatCurrency(totalInterest);
        document.getElementById('repayment-period').textContent = `${months} months`;
        document.getElementById('total-debt-payment').textContent = formatCurrency(debtAmount + totalInterest);

        // Update charts
        updateDebtTimelineChart(timeline);
        updateDebtBreakdownChart(debtAmount, totalInterest);
    });

    // Retirement Calculator
    document.getElementById('calculate-retirement').addEventListener('click', function() {
        const currentAge = parseInt(document.getElementById('current-age').value);
        const retirementAge = parseInt(document.getElementById('retirement-age').value);
        const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').value);
        const inflationRate = parseFloat(document.getElementById('retirement-inflation').value);
        const returnRate = parseFloat(document.getElementById('retirement-return').value);

        if (!currentAge || !retirementAge || !monthlyExpenses || !inflationRate || !returnRate) {
            alert('Please fill in all fields');
            return;
        }

        if (currentAge >= retirementAge) {
            alert('Retirement age must be greater than current age');
            return;
        }

        if (monthlyExpenses <= 0 || inflationRate <= 0 || returnRate <= 0) {
            alert('Please enter positive values');
            return;
        }

        const yearsToRetirement = retirementAge - currentAge;
        const monthlyInflation = Math.pow(1 + inflationRate/100, 1/12) - 1;
        const monthlyReturn = Math.pow(1 + returnRate/100, 1/12) - 1;

        // Calculate required corpus
        const annualExpenses = monthlyExpenses * 12;
        const inflationAdjustedExpenses = annualExpenses * Math.pow(1 + inflationRate/100, yearsToRetirement);
        const requiredCorpus = inflationAdjustedExpenses * (1 - Math.pow(1 + monthlyReturn, -300)) / monthlyReturn;

        // Calculate monthly investment needed
        const monthlyInvestment = (requiredCorpus * monthlyReturn) / 
            (Math.pow(1 + monthlyReturn, yearsToRetirement * 12) - 1);

        // Update results
        document.getElementById('required-corpus').textContent = formatCurrency(requiredCorpus);
        document.getElementById('monthly-investment').textContent = formatCurrency(monthlyInvestment);
        document.getElementById('total-investment-needed').textContent = formatCurrency(monthlyInvestment * yearsToRetirement * 12);

        // Update charts
        updateCorpusGrowthChart(requiredCorpus, monthlyInvestment, yearsToRetirement, monthlyReturn);
        updateInvestmentBreakdownChart(monthlyInvestment * yearsToRetirement * 12, requiredCorpus - (monthlyInvestment * yearsToRetirement * 12));
    });

    // Asset Allocation Calculator
    document.getElementById('calculate-allocation').addEventListener('click', function() {
        const age = parseInt(document.getElementById('investor-age').value);
        const riskProfile = document.getElementById('risk-profile').value;
        const horizon = parseInt(document.getElementById('investment-horizon').value);

        if (!age || !horizon) {
            alert('Please fill in all fields');
            return;
        }

        if (age < 18 || age > 80) {
            alert('Age must be between 18 and 80');
            return;
        }

        if (horizon <= 0) {
            alert('Investment horizon must be positive');
            return;
        }

        // Calculate allocation based on age and risk profile
        let equityAllocation, debtAllocation, otherAllocation;
        
        // Base allocation on age (100 - age rule)
        const baseEquity = Math.max(0, 100 - age);
        
        // Adjust based on risk profile
        switch(riskProfile) {
            case 'conservative':
                equityAllocation = Math.max(0, baseEquity - 20);
                debtAllocation = Math.min(80, baseEquity + 20);
                otherAllocation = 100 - equityAllocation - debtAllocation;
                break;
            case 'moderate':
                equityAllocation = baseEquity;
                debtAllocation = Math.min(60, baseEquity + 10);
                otherAllocation = 100 - equityAllocation - debtAllocation;
                break;
            case 'aggressive':
                equityAllocation = Math.min(80, baseEquity + 20);
                debtAllocation = Math.max(20, baseEquity - 20);
                otherAllocation = 100 - equityAllocation - debtAllocation;
                break;
        }

        // Adjust based on investment horizon
        if (horizon > 10) {
            equityAllocation = Math.min(80, equityAllocation + 10);
            debtAllocation = Math.max(20, debtAllocation - 10);
        } else if (horizon < 5) {
            equityAllocation = Math.max(20, equityAllocation - 10);
            debtAllocation = Math.min(80, debtAllocation + 10);
        }

        // Update results
        document.getElementById('equity-allocation').textContent = `${Math.round(equityAllocation)}%`;
        document.getElementById('debt-allocation').textContent = `${Math.round(debtAllocation)}%`;
        document.getElementById('other-allocation').textContent = `${Math.round(otherAllocation)}%`;

        // Update charts
        updateAllocationPieChart(equityAllocation, debtAllocation, otherAllocation);
        updateRiskReturnChart(equityAllocation, debtAllocation, otherAllocation);
    });

    // Helper Functions
    function clearResults(type) {
        const section = document.getElementById(`${type}-calculator`);
        const summary = section.querySelector('.results-summary');
        const chartsContainer = section.querySelector('.results-charts');
        const charts = section.querySelectorAll('.chart-container');
        
        // Clear summary values
        summary.querySelectorAll('.value').forEach(value => {
            value.textContent = '₹0';
        });

        // Hide charts container
        chartsContainer.classList.remove('has-charts');

        // Hide and clear charts
        charts.forEach(container => {
            container.style.display = 'none';
            const canvas = container.querySelector('canvas');
            const chart = Chart.getChart(canvas);
            if (chart) {
                chart.destroy();
            }
        });
    }

    function calculateSIP(monthly, rate, years) {
        const monthlyRate = rate / 12 / 100;
        const totalMonths = years * 12;
        
        // SIP Formula: M = P × ({(1 + i)^n - 1} / i) × (1 + i)
        const maturityAmount = monthly * 
            ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * 
            (1 + monthlyRate);
        
        const totalInvestment = monthly * totalMonths;
        const totalReturns = maturityAmount - totalInvestment;

        // Calculate yearly breakdown
        const yearlyBreakdown = [];
        let invested = 0;
        let returns = 0;

        for (let year = 1; year <= years; year++) {
            const yearInvestment = monthly * 12;
            invested += yearInvestment;
            
            const yearEndAmount = monthly * 
                ((Math.pow(1 + monthlyRate, year * 12) - 1) / monthlyRate) * 
                (1 + monthlyRate);
            
            returns = yearEndAmount - invested;
            
            yearlyBreakdown.push({
                year,
                invested,
                returns,
                total: yearEndAmount
            });
        }

        return {
            totalAmount: maturityAmount,
            totalContribution: totalInvestment,
            interestEarned: totalReturns,
            yearlyBreakdown
        };
    }

    function calculateLoan(amount, rate, years) {
        const monthlyRate = rate / 12 / 100;
        const totalMonths = years * 12;
        
        const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / 
                    (Math.pow(1 + monthlyRate, totalMonths) - 1);
        
        const totalPayment = emi * totalMonths;
        const totalInterest = totalPayment - amount;

        // Calculate yearly breakdown
        const yearlyBreakdown = [];
        let remainingPrincipal = amount;
        let totalPaid = 0;
        let totalInterestPaid = 0;

        for (let year = 1; year <= years; year++) {
            let yearPrincipal = 0;
            let yearInterest = 0;

            for (let month = 1; month <= 12; month++) {
                const interestPayment = remainingPrincipal * monthlyRate;
                const principalPayment = emi - interestPayment;
                
                yearPrincipal += principalPayment;
                yearInterest += interestPayment;
                
                remainingPrincipal -= principalPayment;
                totalPaid += emi;
                totalInterestPaid += interestPayment;
            }

            yearlyBreakdown.push({
                year,
                principal: yearPrincipal,
                interest: yearInterest,
                total: emi * 12
            });
        }

        return {
            emi,
            totalPayment,
            totalInterest,
            yearlyBreakdown
        };
    }

    function calculateFinancialPlan(goal, years, inflation, savings) {
        const inflationAdjustedAmount = goal * Math.pow(1 + (inflation / 100), years);
        const monthlySavings = (inflationAdjustedAmount - savings) / (years * 12);
        const totalSavings = monthlySavings * years * 12;

        // Calculate yearly breakdown
        const yearlyBreakdown = [];
        let totalSaved = savings;

        for (let year = 1; year <= years; year++) {
            const yearSavings = monthlySavings * 12;
            totalSaved += yearSavings;
            
            yearlyBreakdown.push({
                year,
                savings: yearSavings,
                total: totalSaved,
                target: inflationAdjustedAmount * (year / years)
            });
        }

        return {
            inflationAdjustedAmount,
            monthlySavings,
            totalSavings,
            yearlyBreakdown
        };
    }

    function displaySIPResults(result) {
        const results = document.querySelector('#sip-calculator .calculator-results');
        results.classList.add('has-results');
        
        document.getElementById('total-investment').textContent = 
            formatCurrency(result.totalContribution);
        document.getElementById('total-returns').textContent = 
            formatCurrency(result.interestEarned);
        document.getElementById('maturity-value').textContent = 
            formatCurrency(result.totalAmount);
    }

    function displayLoanResults(result) {
        const results = document.querySelector('#loan-calculator .calculator-results');
        results.classList.add('has-results');
        
        document.getElementById('monthly-emi').textContent = 
            formatCurrency(result.emi);
        document.getElementById('total-interest').textContent = 
            formatCurrency(result.totalInterest);
        document.getElementById('total-payment').textContent = 
            formatCurrency(result.totalPayment);
    }

    function displayPlanningResults(result) {
        const results = document.querySelector('#planning-calculator .calculator-results');
        results.classList.add('has-results');
        
        document.getElementById('adjusted-amount').textContent = 
            formatCurrency(result.inflationAdjustedAmount);
        document.getElementById('monthly-savings').textContent = 
            formatCurrency(result.monthlySavings);
        document.getElementById('total-savings').textContent = 
            formatCurrency(result.totalSavings);
    }

    function updateSIPCharts(result) {
        const chartsContainer = document.querySelector('#sip-calculator .results-charts');
        const chartContainers = chartsContainer.querySelectorAll('.chart-container');
        
        // Show charts container
        chartsContainer.classList.add('has-charts');
        
        // Show chart containers
        chartContainers.forEach(container => {
            container.style.display = 'block';
        });

        // Investment vs Returns Chart
        const sipChart = new Chart(document.getElementById('sip-chart'), {
            type: 'doughnut',
            data: {
                labels: ['Invested Amount', 'Returns'],
                datasets: [{
                    data: [result.totalContribution, result.interestEarned],
                    backgroundColor: ['#10a37f', '#1a7f64'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Growth Chart
        const growthChart = new Chart(document.getElementById('sip-growth-chart'), {
            type: 'line',
            data: {
                labels: result.yearlyBreakdown.map(d => `Year ${d.year}`),
                datasets: [{
                    label: 'Total Value',
                    data: result.yearlyBreakdown.map(d => d.total),
                    borderColor: '#10a37f',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(16, 163, 127, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    function updateLoanCharts(result) {
        const chartsContainer = document.querySelector('#loan-calculator .results-charts');
        const chartContainers = chartsContainer.querySelectorAll('.chart-container');
        
        // Show charts container
        chartsContainer.classList.add('has-charts');
        
        // Show chart containers
        chartContainers.forEach(container => {
            container.style.display = 'block';
        });

        // Principal vs Interest Chart
        const loanChart = new Chart(document.getElementById('loan-chart'), {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Interest'],
                datasets: [{
                    data: [result.totalPayment - result.totalInterest, result.totalInterest],
                    backgroundColor: ['#10a37f', '#1a7f64'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Yearly Breakdown Chart
        const breakdownChart = new Chart(document.getElementById('loan-breakdown-chart'), {
            type: 'bar',
            data: {
                labels: result.yearlyBreakdown.map(d => `Year ${d.year}`),
                datasets: [{
                    label: 'Principal',
                    data: result.yearlyBreakdown.map(d => d.principal),
                    backgroundColor: '#10a37f'
                }, {
                    label: 'Interest',
                    data: result.yearlyBreakdown.map(d => d.interest),
                    backgroundColor: '#1a7f64'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: true,
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    },
                    x: {
                        stacked: true
                    }
                }
            }
        });
    }

    function updatePlanningCharts(result) {
        const chartsContainer = document.querySelector('#planning-calculator .results-charts');
        const chartContainers = chartsContainer.querySelectorAll('.chart-container');
        
        // Show charts container
        chartsContainer.classList.add('has-charts');
        
        // Show chart containers
        chartContainers.forEach(container => {
            container.style.display = 'block';
        });

        // Savings Progress Chart
        const planningChart = new Chart(document.getElementById('planning-chart'), {
            type: 'line',
            data: {
                labels: result.yearlyBreakdown.map(d => `Year ${d.year}`),
                datasets: [{
                    label: 'Total Saved',
                    data: result.yearlyBreakdown.map(d => d.total),
                    borderColor: '#10a37f',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(16, 163, 127, 0.1)'
                }, {
                    label: 'Target',
                    data: result.yearlyBreakdown.map(d => d.target),
                    borderColor: '#1a7f64',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    }
                }
            }
        });

        // Monthly Savings Chart
        const savingsChart = new Chart(document.getElementById('savings-chart'), {
            type: 'bar',
            data: {
                labels: result.yearlyBreakdown.map(d => `Year ${d.year}`),
                datasets: [{
                    label: 'Yearly Savings',
                    data: result.yearlyBreakdown.map(d => d.savings),
                    backgroundColor: '#10a37f'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    function formatCurrency(value) {
        return '₹' + value.toLocaleString('en-IN', {
            maximumFractionDigits: 0
        });
    }

    // Chart Update Functions
    function updateDebtTimelineChart(timeline) {
        const ctx = document.getElementById('debt-timeline-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeline.map(t => t.month),
                datasets: [{
                    label: 'Remaining Debt',
                    data: timeline.map(t => t.remaining),
                    borderColor: '#10a37f',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Debt Repayment Timeline'
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    function updateDebtBreakdownChart(principal, interest) {
        const ctx = document.getElementById('debt-breakdown-chart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Principal', 'Interest'],
                datasets: [{
                    data: [principal, interest],
                    backgroundColor: ['#10a37f', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Payment Breakdown'
                    }
                }
            }
        });
    }

    function updateCorpusGrowthChart(corpus, monthlyInvestment, years, returnRate) {
        const ctx = document.getElementById('corpus-growth-chart').getContext('2d');
        const data = [];
        let balance = 0;
        
        for (let i = 0; i <= years; i++) {
            balance = monthlyInvestment * 12 * ((Math.pow(1 + returnRate, i * 12) - 1) / returnRate);
            data.push(balance);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: years + 1}, (_, i) => i),
                datasets: [{
                    label: 'Corpus Growth',
                    data: data,
                    borderColor: '#10a37f',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Corpus Growth Over Time'
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    function updateInvestmentBreakdownChart(investment, returns) {
        const ctx = document.getElementById('investment-breakdown-chart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Investment', 'Returns'],
                datasets: [{
                    data: [investment, returns],
                    backgroundColor: ['#10a37f', '#3b82f6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Investment vs Returns'
                    }
                }
            }
        });
    }

    function updateAllocationPieChart(equity, debt, other) {
        const ctx = document.getElementById('allocation-pie-chart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Equity', 'Debt', 'Other'],
                datasets: [{
                    data: [equity, debt, other],
                    backgroundColor: ['#10a37f', '#3b82f6', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Asset Allocation'
                    }
                }
            }
        });
    }

    function updateRiskReturnChart(equity, debt, other) {
        const ctx = document.getElementById('risk-return-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Equity', 'Debt', 'Other'],
                datasets: [{
                    label: 'Risk Level',
                    data: [equity/100 * 10, debt/100 * 5, other/100 * 3],
                    backgroundColor: ['#10a37f', '#3b82f6', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Risk Level by Asset Class'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }
}); 