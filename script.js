// main app controller
const App = {
    transactions: [],
    budgets: [],
    goals: [],
    settings: { theme: 'light', currency: '₹' },
    
    init() {
        this.loadData();
        this.applyTheme();
        console.log("App booted up.");
    },
    
    // --- STORAGE ---
    saveData() {
        const data = {
            transactions: this.transactions,
            budgets: this.budgets,
            goals: this.goals,
            settings: this.settings,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('expenseTrackerData', JSON.stringify(data));
    },
    
    loadData() {
        const stored = localStorage.getItem('expenseTrackerData');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.transactions = data.transactions || [];
                this.budgets = data.budgets || [];
                this.goals = data.goals || [];
                this.settings = data.settings || { theme: 'light', currency: '₹' };
                this.applyTheme();
            } catch (e) {
                console.error('Failed to parse local storage', e);
                this.setDefaultData();
            }
        } else {
            this.setDefaultData();
        }
    },
    
    setDefaultData() {
        this.transactions = [
            { id: Date.now() + 1, type: 'income', category: 'Salary', amount: 45000, date: new Date().toISOString().split('T')[0], description: 'Initial Salary', paymentMethod: 'Bank', notes: '' }
        ];
        this.budgets = [];
        this.goals = [];
        this.saveData();
    },
    
    // --- THEME ---
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.textContent = this.settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
    },
    
    toggleTheme() {
        this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveData();
    }
    
    ,
    // --- TRANSACTIONS CRUD ---
    addTransaction(data) {
        const transaction = { id: Date.now(), ...data, createdAt: new Date().toISOString() };
        this.transactions.unshift(transaction);
        this.saveData();
        this.render();
    },
    
    deleteTransaction(id) {
        if (!confirm('Are you sure you want to delete this?')) return;
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveData();
        this.render();
    },
    
    getTransaction(id) {
        return this.transactions.find(t => t.id === id);
    },

    getStats(transactions) {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses };
    },

};

// boot it up
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});